package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.backend.enums.CineMeetReportReason;
import org.example.backend.enums.CineMeetReportStatus;
import org.example.backend.enums.CineMeetReportTargetType;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "cinemeet_reports",
        indexes = {
                @Index(name = "idx_cm_report_status_created", columnList = "status, created_at"),
                @Index(name = "idx_cm_report_reporter", columnList = "reporter_id"),
                @Index(name = "idx_cm_report_target_user", columnList = "reported_user_id"),
                @Index(name = "idx_cm_report_target_message", columnList = "reported_message_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
public class CineMeetReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reporter_id", nullable = false)
    private Customer reporter;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reported_user_id", nullable = false)
    private Customer reportedUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_message_id")
    private Message reportedMessage;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 20)
    private CineMeetReportTargetType targetType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private CineMeetReportReason reason;

    @Column(length = 1000)
    private String description;

    @Column(name = "reported_user_name_snapshot", length = 255)
    private String reportedUserNameSnapshot;

    @Column(name = "reported_user_email_snapshot", length = 255)
    private String reportedUserEmailSnapshot;

    @Column(name = "reported_user_avatar_snapshot", length = 1000)
    private String reportedUserAvatarSnapshot;

    @Column(name = "reported_user_age_snapshot")
    private Integer reportedUserAgeSnapshot;

    @Column(name = "reported_user_bio_snapshot", length = 1000)
    private String reportedUserBioSnapshot;

    @Column(name = "message_content_snapshot", length = 2000)
    private String messageContentSnapshot;

    @Column(name = "message_sent_at_snapshot")
    private LocalDateTime messageSentAtSnapshot;

    @Column(name = "match_id_snapshot")
    private Long matchIdSnapshot;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CineMeetReportStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_id")
    private Admin reviewedBy;

    @Column(name = "review_started_at")
    private LocalDateTime reviewStartedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "resolution_note", length = 1000)
    private String resolutionNote;
}
