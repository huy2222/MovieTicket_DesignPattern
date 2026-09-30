package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.CreateCineMeetReportRequest;
import org.example.backend.dto.request.ResolveCineMeetReportRequest;
import org.example.backend.dto.response.CineMeetReportResponse;
import org.example.backend.dto.response.CineMeetReportEvidenceMessageResponse;
import org.example.backend.dto.response.MyCineMeetReportResponse;
import org.example.backend.entity.*;
import org.example.backend.enums.CineMeetReportStatus;
import org.example.backend.enums.CineMeetReportTargetType;
import org.example.backend.repository.*;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CineMeetReportService {
    private static final EnumSet<CineMeetReportStatus> ACTIVE_STATUSES =
            EnumSet.of(CineMeetReportStatus.PENDING, CineMeetReportStatus.REVIEWING);

    private final CineMeetReportRepository reportRepository;
    private final CustomerRepository customerRepository;
    private final MessageRepository messageRepository;
    private final MatchRepository matchRepository;
    private final AdminRepository adminRepository;

    @Transactional
    public CineMeetReportResponse create(String email, CreateCineMeetReportRequest request) {
        Customer reporter = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thành viên"));
        if (reporter.getProfileCard() == null || !reporter.getProfileCard().isCineMeetEnabled()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vui lòng bật CineMeet trước khi gửi báo cáo");
        }

        Long reportedUserId = request.getReportedUserId();
        Long messageId = request.getMessageId();
        if ((reportedUserId == null && messageId == null) || (reportedUserId != null && messageId != null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn một người dùng hoặc tin nhắn cần báo cáo");
        }

        CineMeetReport report = new CineMeetReport();
        report.setReporter(reporter);
        report.setReason(request.getReason());
        report.setDescription(normalize(request.getDescription()));
        report.setStatus(CineMeetReportStatus.PENDING);
        report.setCreatedAt(LocalDateTime.now());

        if (messageId != null) {
            Message message = messageRepository.findById(messageId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tin nhắn"));
            if (message.getMatch() == null || !matchRepository.canAccess(message.getMatch().getId(), email)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền báo cáo tin nhắn này");
            }
            if (message.getSender().getId().equals(reporter.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn không thể báo cáo nội dung của chính mình");
            }
            if (reportRepository.existsByReporter_IdAndReportedMessage_IdAndStatusIn(
                    reporter.getId(), messageId, ACTIVE_STATUSES)) {
                throw duplicateReport();
            }
            report.setTargetType(CineMeetReportTargetType.MESSAGE);
            report.setReportedMessage(message);
            report.setReportedUser(message.getSender());
        } else {
            if (reportedUserId.equals(reporter.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn không thể báo cáo chính tài khoản của mình");
            }
            Customer reportedUser = customerRepository.findById(reportedUserId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng cần báo cáo"));
            if (reportedUser.getProfileCard() == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không có hồ sơ CineMeet");
            }
            if (reportRepository.existsByReporter_IdAndReportedUser_IdAndReportedMessageIsNullAndStatusIn(
                    reporter.getId(), reportedUserId, ACTIVE_STATUSES)) {
                throw duplicateReport();
            }
            report.setTargetType(CineMeetReportTargetType.USER);
            report.setReportedUser(reportedUser);
        }

        try {
            captureEvidenceSnapshot(report);
            return toResponse(reportRepository.saveAndFlush(report), false);
        } catch (DataAccessException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Gửi báo cáo thất bại. Vui lòng thử lại sau.",
                    exception
            );
        }
    }

    @Transactional(readOnly = true)
    public List<CineMeetReportResponse> findAll(CineMeetReportStatus status) {
        List<CineMeetReport> reports = status == null
                ? reportRepository.findAllByOrderByCreatedAtDesc()
                : reportRepository.findByStatusOrderByCreatedAtDesc(status);
        return reports.stream().map(report -> toResponse(report, false)).toList();
    }

    @Transactional(readOnly = true)
    public List<MyCineMeetReportResponse> findMine(String email) {
        customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thành viên"));
        return reportRepository.findByReporter_EmailOrderByCreatedAtDesc(email).stream()
                .map(this::toMyReportResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CineMeetReportResponse findById(Long id) {
        return toResponse(findReport(id), true);
    }

    @Transactional
    public CineMeetReportResponse startReview(String adminEmail, Long id) {
        CineMeetReport report = findReportForUpdate(id);
        if (report.getStatus() != CineMeetReportStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Báo cáo không còn ở trạng thái PENDING. Trạng thái hiện tại: " + report.getStatus()
            );
        }
        Admin admin = findAdmin(adminEmail);
        report.setStatus(CineMeetReportStatus.REVIEWING);
        report.setReviewedBy(admin);
        report.setReviewStartedAt(LocalDateTime.now());
        return saveAdminUpdate(report);
    }

    @Transactional
    public CineMeetReportResponse resolve(String adminEmail, Long id, ResolveCineMeetReportRequest request) {
        CineMeetReport report = findReportForUpdate(id);
        if (report.getStatus() != CineMeetReportStatus.REVIEWING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chỉ có thể xử lý báo cáo đang ở trạng thái REVIEWING");
        }
        if (request.getStatus() != CineMeetReportStatus.RESOLVED
                && request.getStatus() != CineMeetReportStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kết quả xử lý phải là RESOLVED hoặc REJECTED");
        }
        Admin admin = findAdmin(adminEmail);
        report.setStatus(request.getStatus());
        report.setReviewedBy(admin);
        report.setResolutionNote(request.getNote().trim());
        report.setResolvedAt(LocalDateTime.now());
        return saveAdminUpdate(report);
    }

    private CineMeetReportResponse saveAdminUpdate(CineMeetReport report) {
        try {
            return toResponse(reportRepository.saveAndFlush(report), true);
        } catch (DataAccessException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Cập nhật báo cáo thất bại. Vui lòng thử lại sau.",
                    exception
            );
        }
    }

    private CineMeetReport findReport(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy báo cáo"));
    }

    private CineMeetReport findReportForUpdate(Long id) {
        return reportRepository.findLockedById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy báo cáo"));
    }

    private Admin findAdmin(String email) {
        return adminRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Không tìm thấy tài khoản quản trị viên"));
    }

    private ResponseStatusException duplicateReport() {
        return new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Báo cáo tương tự đang được xử lý. Vui lòng chờ kết quả."
        );
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }

    private void captureEvidenceSnapshot(CineMeetReport report) {
        Customer reportedUser = report.getReportedUser();
        report.setReportedUserNameSnapshot(resolveDisplayName(reportedUser));
        report.setReportedUserEmailSnapshot(reportedUser.getEmail());
        report.setReportedUserAvatarSnapshot(resolveAvatar(reportedUser));
        report.setReportedUserAgeSnapshot(reportedUser.getProfileCard() != null
                ? reportedUser.getProfileCard().getAge() : null);
        report.setReportedUserBioSnapshot(reportedUser.getProfileCard() != null
                ? normalize(reportedUser.getProfileCard().getBio()) : null);

        Message message = report.getReportedMessage();
        if (message != null) {
            report.setMessageContentSnapshot(message.getContent());
            report.setMessageSentAtSnapshot(message.getSentAt());
            report.setMatchIdSnapshot(message.getMatch() != null ? message.getMatch().getId() : null);
        }
    }

    private CineMeetReportResponse toResponse(CineMeetReport report, boolean includeEvidence) {
        Customer reportedUser = report.getReportedUser();
        Message message = report.getReportedMessage();
        Admin admin = report.getReviewedBy();
        String reportedName = firstNonBlank(report.getReportedUserNameSnapshot(), resolveDisplayName(reportedUser));
        String reportedEmail = firstNonBlank(report.getReportedUserEmailSnapshot(), reportedUser.getEmail());
        String reportedAvatar = firstNonBlank(report.getReportedUserAvatarSnapshot(), resolveAvatar(reportedUser));
        String messageContent = firstNonBlank(report.getMessageContentSnapshot(), message != null ? message.getContent() : null);
        Long matchId = report.getMatchIdSnapshot() != null
                ? report.getMatchIdSnapshot()
                : message != null && message.getMatch() != null ? message.getMatch().getId() : null;
        return CineMeetReportResponse.builder()
                .id(report.getId())
                .targetType(report.getTargetType())
                .reason(report.getReason())
                .description(report.getDescription())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .reporterId(report.getReporter().getId())
                .reporterName(report.getReporter().getFullName())
                .reporterEmail(report.getReporter().getEmail())
                .reportedUserId(reportedUser.getId())
                .reportedUserName(reportedName)
                .reportedUserEmail(reportedEmail)
                .reportedUserAvatar(reportedAvatar)
                .reportedUserAge(report.getReportedUserAgeSnapshot())
                .reportedUserBio(report.getReportedUserBioSnapshot())
                .messageId(message != null ? message.getId() : null)
                .messageContent(messageContent)
                .messageSentAt(report.getMessageSentAtSnapshot() != null
                        ? report.getMessageSentAtSnapshot() : message != null ? message.getSentAt() : null)
                .matchId(matchId)
                .reviewedById(admin != null ? admin.getId() : null)
                .reviewedByName(admin != null ? admin.getFullName() : null)
                .reviewStartedAt(report.getReviewStartedAt())
                .resolvedAt(report.getResolvedAt())
                .resolutionNote(report.getResolutionNote())
                .evidenceMessages(includeEvidence ? buildMessageEvidence(report) : List.of())
                .build();
    }

    private MyCineMeetReportResponse toMyReportResponse(CineMeetReport report) {
        Message message = report.getReportedMessage();
        return MyCineMeetReportResponse.builder()
                .id(report.getId())
                .targetType(report.getTargetType())
                .reason(report.getReason())
                .description(report.getDescription())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .reportedUserId(report.getReportedUser().getId())
                .reportedUserName(firstNonBlank(report.getReportedUserNameSnapshot(), resolveDisplayName(report.getReportedUser())))
                .reportedUserAvatar(firstNonBlank(report.getReportedUserAvatarSnapshot(), resolveAvatar(report.getReportedUser())))
                .messageId(message != null ? message.getId() : null)
                .messageContent(firstNonBlank(report.getMessageContentSnapshot(), message != null ? message.getContent() : null))
                .reviewStartedAt(report.getReviewStartedAt())
                .resolvedAt(report.getResolvedAt())
                .resolutionNote(report.getResolutionNote())
                .build();
    }

    private List<CineMeetReportEvidenceMessageResponse> buildMessageEvidence(CineMeetReport report) {
        Message reportedMessage = report.getReportedMessage();
        Long matchId = report.getMatchIdSnapshot();
        if (reportedMessage == null || matchId == null) return List.of();

        List<Message> before = new ArrayList<>(messageRepository.findEvidenceBefore(
                matchId, reportedMessage.getId(), PageRequest.of(0, 4)));
        Collections.reverse(before);
        List<Message> context = new ArrayList<>(before);
        context.addAll(messageRepository.findEvidenceAfter(matchId, reportedMessage.getId(), PageRequest.of(0, 3)));
        return context.stream().map(message -> CineMeetReportEvidenceMessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderName(resolveDisplayName(message.getSender()))
                .content(message.getId().equals(reportedMessage.getId())
                        ? firstNonBlank(report.getMessageContentSnapshot(), message.getContent())
                        : message.getContent())
                .sentAt(message.getSentAt())
                .reportedMessage(message.getId().equals(reportedMessage.getId()))
                .build()).toList();
    }

    private String resolveDisplayName(Customer customer) {
        if (customer.getProfileCard() != null && customer.getProfileCard().getDisplayName() != null
                && !customer.getProfileCard().getDisplayName().isBlank()) {
            return customer.getProfileCard().getDisplayName();
        }
        return customer.getFullName();
    }

    private String resolveAvatar(Customer customer) {
        if (customer.getProfileCard() != null && customer.getProfileCard().getAvatarUrl() != null
                && !customer.getProfileCard().getAvatarUrl().isBlank()) {
            return customer.getProfileCard().getAvatarUrl();
        }
        return customer.getAvatarUrl();
    }

    private String firstNonBlank(String preferred, String fallback) {
        return preferred != null && !preferred.isBlank() ? preferred : fallback;
    }
}
