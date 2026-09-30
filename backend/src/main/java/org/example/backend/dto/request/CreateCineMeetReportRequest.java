package org.example.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.example.backend.enums.CineMeetReportReason;

@Data
public class CreateCineMeetReportRequest {
    private Long reportedUserId;
    private Long messageId;

    @NotNull(message = "Vui lòng chọn lý do báo cáo")
    private CineMeetReportReason reason;

    @Size(max = 1000, message = "Nội dung mô tả tối đa 1000 ký tự")
    private String description;
}
