package org.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.example.backend.enums.CineMeetReportStatus;

@Data
public class ResolveCineMeetReportRequest {
    @NotNull(message = "Vui lòng chọn kết quả xử lý")
    private CineMeetReportStatus status;

    @NotBlank(message = "Vui lòng nhập ghi chú xử lý")
    @Size(max = 1000, message = "Ghi chú xử lý tối đa 1000 ký tự")
    private String note;
}
