package org.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SupportRequestRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 150, message = "Tiêu đề không được vượt quá 150 ký tự")
    private String title;

    @NotBlank(message = "Nội dung yêu cầu không được để trống")
    @Size(max = 5000, message = "Nội dung không được vượt quá 5000 ký tự")
    private String content;

    @NotBlank(message = "Vui lòng chọn loại vấn đề")
    private String issueType;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getIssueType() {
        return issueType;
    }

    public void setIssueType(String issueType) {
        this.issueType = issueType;
    }
}