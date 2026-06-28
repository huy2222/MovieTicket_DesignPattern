package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.EmployeePasswordRequest;
import org.example.backend.dto.request.EmployeeRequest;
import org.example.backend.dto.response.EmployeePageResponse;
import org.example.backend.dto.response.EmployeeResponse;
import org.example.backend.entity.Admin;
import org.example.backend.entity.Cinema;
import org.example.backend.entity.Staff;
import org.example.backend.entity.User;
import org.example.backend.enums.AccountStatus;
import org.example.backend.enums.Role;
import org.example.backend.repository.AdminRepository;
import org.example.backend.repository.CinemaRepository;
import org.example.backend.repository.EmployeeRepository;
import org.example.backend.repository.StaffRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.repository.projection.EmployeeProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private static final Set<Role> EMPLOYEE_ROLES = Set.of(Role.ADMIN, Role.STAFF);

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final StaffRepository staffRepository;
    private final CinemaRepository cinemaRepository;
    private final PasswordEncoder passwordEncoder;
    private final DashboardService dashboardService;

    @Transactional(readOnly = true)
    public EmployeePageResponse getEmployees(
            String search,
            String fullName,
            String email,
            String phoneNumber,
            Role role,
            AccountStatus status,
            int page,
            int size,
            String sortBy,
            String sortDirection
    ) {
        validateEmployeeRoleFilter(role);
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortField = resolveSortField(sortBy);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));

        Page<EmployeeProjection> result = employeeRepository.searchEmployees(
                EMPLOYEE_ROLES,
                normalizeSearch(search),
                normalizeSearch(fullName),
                normalizeSearch(email),
                normalizeSearch(phoneNumber),
                role,
                status,
                pageable
        );

        List<EmployeeResponse> content = result.getContent().stream()
                .map(this::toResponse)
                .toList();

        return EmployeePageResponse.builder()
                .content(content)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        User user = findEmployeeUser(id);
        return toResponse(user);
    }

    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        validateEmployeeRole(request.getRole());
        validateCreateRequest(request);

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email đã tồn tại");
        }

        User user = request.getRole() == Role.ADMIN ? new Admin() : new Staff();
        applyCommonFields(user, request, true);
        userRepository.save(user);

        if (user instanceof Staff staff) {
            applyStaffFields(staff, request);
            staffRepository.save(staff);
        } else {
            adminRepository.save((Admin) user);
        }

        dashboardService.evictSlowStatsCache();
        return toResponse(user);
    }

    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        User user = findEmployeeUser(id);
        validateEmployeeRole(request.getRole());

        if (user.getRole() != request.getRole()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể thay đổi vai trò sau khi tạo tài khoản");
        }

        if (userRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email đã tồn tại");
        }

        applyCommonFields(user, request, false);
        userRepository.save(user);

        if (user instanceof Staff staff) {
            applyStaffFields(staff, request);
            staffRepository.save(staff);
        }

        return toResponse(user);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        User user = findEmployeeUser(id);

        if (user.getRole() == Role.ADMIN) {
            long adminCount = adminRepository.countByRole(Role.ADMIN);
            if (adminCount <= 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể xóa Admin cuối cùng");
            }
        }

        userRepository.delete(user);
        dashboardService.evictSlowStatsCache();
    }

    @Transactional
    public EmployeeResponse lockEmployee(Long id) {
        User user = findEmployeeUser(id);
        if (user.getRole() == Role.ADMIN) {
            long activeAdminCount = adminRepository.countByStatus(AccountStatus.ACTIVE);
            if (activeAdminCount <= 1 && user.getStatus() == AccountStatus.ACTIVE) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể khóa Admin cuối cùng đang hoạt động");
            }
        }
        user.setStatus(AccountStatus.LOCKED);
        userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public EmployeeResponse unlockEmployee(Long id) {
        User user = findEmployeeUser(id);
        user.setStatus(AccountStatus.ACTIVE);
        userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public void changePassword(Long id, EmployeePasswordRequest request) {
        User user = findEmployeeUser(id);
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private User findEmployeeUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nhân viên không tồn tại"));
        if (!EMPLOYEE_ROLES.contains(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nhân viên không tồn tại");
        }
        return user;
    }

    private void validateCreateRequest(EmployeeRequest request) {
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu không được để trống khi tạo mới");
        }
        if (request.getRole() == Role.STAFF && request.getCinemaId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nhân viên phải được gán rạp làm việc");
        }
    }

    private void validateEmployeeRole(Role role) {
        if (role != null && !EMPLOYEE_ROLES.contains(role)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vai trò chỉ được phép ADMIN hoặc STAFF");
        }
    }

    private void validateEmployeeRoleFilter(Role role) {
        if (role != null && role == Role.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vai trò chỉ được phép ADMIN hoặc STAFF");
        }
    }

    private void applyCommonFields(User user, EmployeeRequest request, boolean isCreate) {
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setFullName(request.getFullName().trim());
        user.setPhoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null);
        user.setRole(request.getRole());
        if (isCreate) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setStatus(AccountStatus.ACTIVE);
            user.setCreatedAt(LocalDateTime.now());
        }
    }

    private void applyStaffFields(Staff staff, EmployeeRequest request) {
        staff.setPosition(request.getPosition() != null ? request.getPosition().trim() : null);
        if (request.getCinemaId() != null) {
            Cinema cinema = cinemaRepository.findById(request.getCinemaId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rạp chiếu không tồn tại"));
            staff.setWorkingCinema(cinema);
        }
    }

    private EmployeeResponse toResponse(EmployeeProjection projection) {
        return EmployeeResponse.builder()
                .id(projection.getId())
                .email(projection.getEmail())
                .fullName(projection.getFullName())
                .avatarUrl(projection.getAvatarUrl())
                .phoneNumber(projection.getPhoneNumber())
                .role(projection.getRole().name())
                .status(projection.getStatus().name())
                .position(projection.getPosition())
                .cinemaId(projection.getCinemaId())
                .cinemaName(projection.getCinemaName())
                .createdAt(projection.getCreatedAt() != null ? projection.getCreatedAt().toString() : null)
                .build();
    }

    private EmployeeResponse toResponse(User user) {
        EmployeeResponse.EmployeeResponseBuilder builder = EmployeeResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);

        if (user instanceof Staff staff) {
            builder.position(staff.getPosition());
            if (staff.getWorkingCinema() != null) {
                builder.cinemaId(staff.getWorkingCinema().getId())
                        .cinemaName(staff.getWorkingCinema().getName());
            }
        }

        return builder.build();
    }

    private String normalizeSearch(String search) {
        return search != null ? search.trim() : null;
    }

    private String resolveSortField(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return "createdAt";
        }
        return switch (sortBy) {
            case "email", "fullName", "role", "status", "createdAt" -> sortBy;
            default -> "createdAt";
        };
    }
}
