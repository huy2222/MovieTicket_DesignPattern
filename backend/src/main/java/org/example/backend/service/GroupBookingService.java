package org.example.backend.service;

import org.example.backend.dto.response.GroupBookingResponse;
import org.example.backend.entity.Booking;
import org.example.backend.entity.Customer;
import org.example.backend.entity.GroupBookingSession;
import org.example.backend.entity.Match;
import org.example.backend.entity.MovieDate;
import org.example.backend.entity.ParticipantPayment;
import org.example.backend.entity.Seat;
import org.example.backend.entity.SeatHold;
import org.example.backend.entity.Showtime;
import org.example.backend.entity.Ticket;
import org.example.backend.enums.BookingStatus;
import org.example.backend.enums.GroupBookingStatus;
import org.example.backend.enums.GroupMemberStatus;
import org.example.backend.enums.SeatStatus;
import org.example.backend.enums.TicketStatus;
import org.example.backend.repository.BookingRepository;
import org.example.backend.repository.CustomerRepository;
import org.example.backend.repository.GroupBookingSessionRepository;
import org.example.backend.repository.ParticipantPaymentRepository;
import org.example.backend.repository.SeatHoldRepository;
import org.example.backend.repository.SeatRepository;
import org.example.backend.repository.TicketRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class GroupBookingService {
    private static final int GROUP_EXPIRATION_HOURS = 2;
    private static final int SEAT_HOLD_MINUTES = 10;

    private final GroupBookingSessionRepository groupRepository;
    private final ParticipantPaymentRepository participantRepository;
    private final CustomerRepository customerRepository;
    private final SeatRepository seatRepository;
    private final SeatHoldRepository seatHoldRepository;
    private final TicketRepository ticketRepository;
    private final BookingRepository bookingRepository;
    private final CineMeetRealtimePublisher realtimePublisher;
    private final VNPayService vnPayService;

    @org.springframework.beans.factory.annotation.Value("${vnpay.cinemeetReturnUrl}")
    private String cinemeetReturnUrl;

    public GroupBookingService(
            GroupBookingSessionRepository groupRepository,
            ParticipantPaymentRepository participantRepository,
            CustomerRepository customerRepository,
            SeatRepository seatRepository,
            SeatHoldRepository seatHoldRepository,
            TicketRepository ticketRepository,
            BookingRepository bookingRepository,
            CineMeetRealtimePublisher realtimePublisher,
            VNPayService vnPayService
    ) {
        this.groupRepository = groupRepository;
        this.participantRepository = participantRepository;
        this.customerRepository = customerRepository;
        this.seatRepository = seatRepository;
        this.seatHoldRepository = seatHoldRepository;
        this.ticketRepository = ticketRepository;
        this.bookingRepository = bookingRepository;
        this.realtimePublisher = realtimePublisher;
        this.vnPayService = vnPayService;
    }

    @Transactional
    public GroupBookingSession createFromInvitation(MovieDate invitation, Match match) {
        if (groupRepository.existsByInvitation_Id(invitation.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Lời mời này đã tạo nhóm xem phim");
        }

        GroupBookingSession group = new GroupBookingSession();
        group.setConversationId(match.getId());
        group.setMatch(match);
        group.setInvitation(invitation);
        group.setShowtime(invitation.getShowtime());
        group.setParticipants(new ArrayList<>(List.of(match.getCustomerA(), match.getCustomerB())));
        group.setCreatedAt(LocalDateTime.now());
        group.setExpiresAt(resolveExpiration(invitation.getShowtime()));
        group.setStatus(GroupBookingStatus.WAITING);
        group = groupRepository.save(group);

        List<ParticipantPayment> members = new ArrayList<>();
        for (Customer participant : group.getParticipants()) {
            ParticipantPayment member = new ParticipantPayment();
            member.setCustomer(participant);
            member.setGroupBookingSession(group);
            member.setAmount(invitation.getShowtime().getBasePrice());
            member.setStatus(GroupMemberStatus.UNPAID);
            members.add(member);
        }
        participantRepository.saveAll(members);
        invitation.setGroupBookingSession(group);
        GroupBookingResponse response = toResponse(group, members);
        realtimePublisher.publishMatch(match.getId(), "GROUP_CREATED", response);
        realtimePublisher.publishGroup(group.getId(), "GROUP_UPDATED", response);
        return group;
    }

    @Transactional(readOnly = true)
    public List<GroupBookingResponse> getMyGroups(String email) {
        Customer customer = findCustomer(email);
        return groupRepository.findAllForCustomer(customer.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public GroupBookingResponse getGroupForMatch(String email, Long matchId) {
        Customer customer = findCustomer(email);
        List<GroupBookingSession> groups =
                groupRepository.findForMatchAndCustomer(matchId, customer.getId());
        if (groups.isEmpty()) return null;
        GroupBookingSession group = groups.get(0);
        expireIfNeeded(group);
        return toResponse(group);
    }

    @Transactional
    public GroupBookingResponse getGroup(String email, Long groupId) {
        Customer customer = findCustomer(email);
        GroupBookingSession group = findAccessible(groupId, customer);
        expireIfNeeded(group);
        return toResponse(group);
    }

    @Transactional
    public GroupBookingResponse selectSeat(String email, Long groupId, Long seatId) {
        Customer customer = findCustomer(email);
        GroupBookingSession group = requireActiveGroup(groupId, customer);
        ParticipantPayment member = findMemberWithDetails(group, customer);
        if (member.getStatus() == GroupMemberStatus.PAID) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vé đã thanh toán nên không thể đổi ghế");
        }

        Seat seat = seatRepository.findByIdWithRoom(seatId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy ghế"));
        Showtime showtime = group.getShowtime();
        if (seat.getRoom() == null || showtime.getRoom() == null
                || !seat.getRoom().getId().equals(showtime.getRoom().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ghế không thuộc phòng chiếu của nhóm");
        }
        if (seat.getStatus() == SeatStatus.UNAVAILABLE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ghế không khả dụng");
        }
        LocalDateTime now = LocalDateTime.now();
        SeatHold activeHold = seatHoldRepository.findActiveBySeatAndShowtimeWithCustomer(
                seatId, showtime.getId(), now).stream().findFirst().orElse(null);
        if (activeHold != null && !activeHold.getCustomer().getId().equals(customer.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ghế đang được người khác giữ");
        }
        if (ticketRepository.existsBySeat_IdAndShowtime_Id(seatId, showtime.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ghế đã được đặt");
        }

        if (member.getSeatHold() != null && !member.getSeatHold().getId().equals(
                activeHold != null ? activeHold.getId() : null)) {
            SeatHold previousHold = member.getSeatHold();
            member.setSeatHold(null);
            member.setSeat(null);
            participantRepository.save(member);
            seatHoldRepository.delete(previousHold);
        }
        SeatHold hold = activeHold;
        if (hold == null) {
            hold = new SeatHold();
            hold.setSeat(seat);
            hold.setCustomer(customer);
            hold.setShowtime(showtime);
            hold.setGroupBookingSession(group);
            hold.setHoldTime(now);
        }
        hold.setExpiresAt(now.plusMinutes(SEAT_HOLD_MINUTES));
        hold = seatHoldRepository.save(hold);
        member.setSeat(seat);
        member.setSeatHold(hold);
        member.setAmount(showtime.getBasePrice());
        participantRepository.save(member);
        group.setStatus(GroupBookingStatus.PROCESSING);
        groupRepository.save(group);
        GroupBookingResponse response = toResponse(group);
        realtimePublisher.publishGroup(group.getId(), "GROUP_UPDATED", response);
        return response;
    }

    @Transactional
    public GroupBookingResponse updatePaymentStatus(
            String email, Long groupId, GroupMemberStatus status) {
        Customer customer = findCustomer(email);
        GroupBookingSession group = requireActiveGroup(groupId, customer);
        ParticipantPayment member = findMemberWithDetails(group, customer);
        if (status != GroupMemberStatus.PAID
                && status != GroupMemberStatus.FAILED
                && status != GroupMemberStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái thanh toán không hợp lệ");
        }
        if (member.getStatus() == GroupMemberStatus.PAID) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Thành viên đã thanh toán");
        }
        if (status == GroupMemberStatus.PAID) {
            if (member.getSeat() == null || member.getSeatHold() == null) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Ghế chưa được chọn hoặc bị lỗi dữ liệu");
            }
            if (ticketRepository.existsBySeat_IdAndShowtime_Id(
                    member.getSeat().getId(), group.getShowtime().getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Ghế đã được đặt");
            }
            createBookingAndTicket(group, member);
        }
        member.setStatus(status);
        participantRepository.save(member);
        List<ParticipantPayment> members = participantRepository.findByGroupIdWithDetails(group.getId());
        updateGroupStatus(group, members);
        GroupBookingResponse response = toResponse(group, members);
        realtimePublisher.publishGroup(group.getId(), "GROUP_UPDATED", response);
        return response;
    }

    @Transactional
    public String createVNPayUrl(String email, Long groupId, jakarta.servlet.http.HttpServletRequest request) {
        Customer customer = findCustomer(email);
        GroupBookingSession group = requireActiveGroup(groupId, customer);
        ParticipantPayment member = findMemberWithDetails(group, customer);

        if (member.getStatus() == GroupMemberStatus.PAID) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Đã thanh toán rồi");
        }
        if (member.getSeat() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chưa chọn ghế");
        }

        String txnRef = "CM_" + groupId + "_" + customer.getId() + "_" + System.currentTimeMillis();
        String orderInfo = "Thanh toan ve nhom CineMeet " + groupId;
        
        return vnPayService.createPaymentUrl(request, (long) member.getAmount(), orderInfo, txnRef, cinemeetReturnUrl);
    }

    @Transactional
    public void handleVNPayReturn(java.util.Map<String, String> params) {
        if (!vnPayService.verifyPayment(params)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chữ ký VNPay không hợp lệ");
        }
        String txnRef = params.get("vnp_TxnRef"); // CM_{groupId}_{customerId}_{timestamp}
        String responseCode = params.get("vnp_ResponseCode");

        if (txnRef != null && txnRef.startsWith("CM_")) {
            String[] parts = txnRef.split("_");
            if (parts.length >= 3) {
                Long groupId = Long.parseLong(parts[1]);
                Long customerId = Long.parseLong(parts[2]);

                Customer customer = customerRepository.findById(customerId).orElse(null);
                if (customer != null) {
                    GroupMemberStatus status = "00".equals(responseCode) ? GroupMemberStatus.PAID : GroupMemberStatus.FAILED;
                    // Lấy lại group để kiểm tra và cập nhật
                    GroupBookingSession group = groupRepository.findById(groupId).orElse(null);
                    if (group != null) {
                        try {
                            updatePaymentStatus(customer.getEmail(), groupId, status);
                        } catch (Exception e) {
                            // Bỏ qua lỗi nếu đã thanh toán rồi hoặc hết hạn
                        }
                    }
                }
            }
        }
    }

    @Transactional
    public GroupBookingResponse cancelGroup(String email, Long groupId) {
        Customer customer = findCustomer(email);
        GroupBookingSession group = findAccessible(groupId, customer);
        if (group.getStatus() == GroupBookingStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Nhóm đã hoàn tất không thể hủy");
        }
        group.setStatus(GroupBookingStatus.CANCELLED);
        for (ParticipantPayment member : participantRepository.findByGroupBookingSession_Id(group.getId())) {
            if (member.getStatus() != GroupMemberStatus.PAID) {
                member.setStatus(GroupMemberStatus.CANCELLED);
                SeatHold hold = member.getSeatHold();
                member.setSeatHold(null);
                member.setSeat(null);
                participantRepository.save(member);
                if (hold != null) seatHoldRepository.delete(hold);
            }
        }
        GroupBookingResponse response = toResponse(groupRepository.save(group));
        realtimePublisher.publishGroup(group.getId(), "GROUP_UPDATED", response);
        return response;
    }

    private void createBookingAndTicket(GroupBookingSession group, ParticipantPayment member) {
        Booking booking = new Booking();
        booking.setCustomer(member.getCustomer());
        booking.setShowtime(group.getShowtime());
        booking.setGroupBookingSession(group);
        booking.setBookingDate(LocalDateTime.now());
        booking.setPaymentDeadline(LocalDateTime.now());
        booking.setBasePrice(group.getShowtime().getBasePrice());
        booking.setSubtotal(group.getShowtime().getBasePrice());
        booking.setTotalAmount(group.getShowtime().getBasePrice());
        booking.setDiscountAmount(0);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking = bookingRepository.save(booking);

        Ticket ticket = new Ticket();
        ticket.setBooking(booking);
        ticket.setCustomer(member.getCustomer());
        ticket.setShowtime(group.getShowtime());
        ticket.setSeat(member.getSeat());
        ticket.setIssuedAt(LocalDateTime.now());
        ticket.setStatus(TicketStatus.ISSUED);
        ticket.setTicketCode("CM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        ticket.setConfirmationCode(UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        ticket.setQrCode(UUID.randomUUID().toString());
        ticketRepository.save(ticket);
    }

    private void updateGroupStatus(GroupBookingSession group, List<ParticipantPayment> members) {
        if (members.size() == 2 && members.stream().allMatch(m -> m.getStatus() == GroupMemberStatus.PAID)) {
            group.setStatus(GroupBookingStatus.COMPLETED);
        } else if (members.stream().anyMatch(m -> m.getStatus() == GroupMemberStatus.CANCELLED)) {
            group.setStatus(GroupBookingStatus.CANCELLED);
        } else {
            group.setStatus(GroupBookingStatus.PROCESSING);
        }
        groupRepository.save(group);
    }

    private GroupBookingSession requireActiveGroup(Long groupId, Customer customer) {
        GroupBookingSession group = findAccessible(groupId, customer);
        expireIfNeeded(group);
        if (group.getStatus() == GroupBookingStatus.EXPIRED
                || group.getStatus() == GroupBookingStatus.CANCELLED
                || group.getStatus() == GroupBookingStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Nhóm không còn nhận thao tác đặt vé");
        }
        return group;
    }

    private void expireIfNeeded(GroupBookingSession group) {
        if ((group.getStatus() == GroupBookingStatus.WAITING
                || group.getStatus() == GroupBookingStatus.PROCESSING)
                && group.getExpiresAt() != null
                && group.getExpiresAt().isBefore(LocalDateTime.now())) {
            group.setStatus(GroupBookingStatus.EXPIRED);
            for (ParticipantPayment member : participantRepository.findByGroupBookingSession_Id(group.getId())) {
                if (member.getStatus() != GroupMemberStatus.PAID && member.getSeatHold() != null) {
                    SeatHold hold = member.getSeatHold();
                    member.setSeatHold(null);
                    member.setSeat(null);
                    participantRepository.save(member);
                    seatHoldRepository.delete(hold);
                }
            }
            groupRepository.save(group);
            realtimePublisher.publishGroup(group.getId(), "GROUP_UPDATED", toResponse(group));
        }
    }

    private GroupBookingSession findAccessible(Long groupId, Customer customer) {
        return groupRepository.findAccessible(groupId, customer.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không thuộc nhóm này"));
    }

    private ParticipantPayment findMember(GroupBookingSession group, Customer customer) {
        return participantRepository.findByGroupBookingSession_IdAndCustomer_Id(group.getId(), customer.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy trạng thái thành viên"));
    }

    private ParticipantPayment findMemberWithDetails(GroupBookingSession group, Customer customer) {
        return participantRepository.findByGroupIdAndCustomerIdWithDetails(group.getId(), customer.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy trạng thái thành viên"));
    }

    private Customer findCustomer(String email) {
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thành viên"));
    }

    private LocalDateTime resolveExpiration(Showtime showtime) {
        LocalDateTime standard = LocalDateTime.now().plusHours(GROUP_EXPIRATION_HOURS);
        return showtime.getStartTime().isBefore(standard) ? showtime.getStartTime() : standard;
    }

    private GroupBookingResponse toResponse(GroupBookingSession group) {
        Showtime showtime = group.getShowtime();
        List<ParticipantPayment> members = participantRepository.findByGroupIdWithDetails(group.getId());
        return toResponse(group, members);
    }

    private GroupBookingResponse toResponse(GroupBookingSession group, List<ParticipantPayment> members) {
        Showtime showtime = group.getShowtime();
        List<GroupBookingResponse.MemberItem> memberItems = members.stream()
                .map(member -> GroupBookingResponse.MemberItem.builder()
                        .customerId(member.getCustomer().getId())
                        .displayName(member.getCustomer().getProfileCard() != null
                                ? member.getCustomer().getProfileCard().getDisplayName()
                                : member.getCustomer().getFullName())
                        .avatarUrl(member.getCustomer().getProfileCard() != null
                                ? member.getCustomer().getProfileCard().getAvatarUrl() : null)
                        .seatId(member.getSeat() != null ? member.getSeat().getId() : null)
                        .seatLabel(member.getSeat() != null ? seatLabel(member.getSeat()) : null)
                        .status(member.getStatus())
                        .amount(member.getAmount())
                        .build())
                .toList();

        return GroupBookingResponse.builder()
                .id(group.getId())
                .matchId(group.getMatch() != null ? group.getMatch().getId() : null)
                .invitationId(group.getInvitation() != null ? group.getInvitation().getId() : null)
                .status(group.getStatus())
                .createdAt(group.getCreatedAt())
                .expiresAt(group.getExpiresAt())
                .showtimeId(showtime.getId())
                .movieId(showtime.getMovie() != null ? showtime.getMovie().getId() : null)
                .movieTitle(showtime.getMovie() != null ? showtime.getMovie().getTitle() : null)
                .moviePosterUrl(showtime.getMovie() != null ? showtime.getMovie().getImages() : null)
                .cinemaName(showtime.getCinema() != null ? showtime.getCinema().getName() : null)
                .roomName(showtime.getRoom() != null ? showtime.getRoom().getName() : null)
                .startTime(showtime.getStartTime())
                .members(memberItems)
                .build();
    }

    @Transactional(readOnly = true)
    public org.example.backend.dto.response.GroupBookingSeatResponse getGroupSeats(String email, Long groupId) {
        Customer customer = findCustomer(email);
        GroupBookingSession group = findAccessible(groupId, customer);
        Showtime showtime = group.getShowtime();

        Set<Long> bookedSeatIds = new HashSet<>(ticketRepository.findBookedSeatIdsByShowtime(showtime.getId()));
        Set<Long> heldSeatIds = new HashSet<>(seatHoldRepository.findActiveHeldSeatIdsByShowtime(showtime.getId(), LocalDateTime.now()));

        List<GroupBookingResponse.SeatItem> seats = showtime.getRoom() == null ? List.of()
                : seatRepository.findByRoom_IdOrderByRowLabelAscColumnNumberAsc(showtime.getRoom().getId()).stream()
                    .map(seat -> GroupBookingResponse.SeatItem.builder()
                            .id(seat.getId())
                            .label(seatLabel(seat))
                            .seatType(seat.getSeatType() != null ? seat.getSeatType().name() : null)
                            .available(isSeatAvailable(seat, bookedSeatIds, heldSeatIds))
                            .build())
                    .toList();

        return org.example.backend.dto.response.GroupBookingSeatResponse.builder()
                .availableSeats(seats)
                .build();
    }

    private boolean isSeatAvailable(Seat seat, Set<Long> bookedSeatIds, Set<Long> heldSeatIds) {
        if (seat.getStatus() == SeatStatus.UNAVAILABLE) return false;
        if (bookedSeatIds.contains(seat.getId())) return false;
        return !heldSeatIds.contains(seat.getId());
    }

    private String seatLabel(Seat seat) {
        return seat.getRowLabel() + seat.getColumnNumber();
    }
}
