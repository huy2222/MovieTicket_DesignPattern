package org.example.backend.dto.request;

import lombok.Data;
import org.example.backend.enums.GroupMemberStatus;

@Data
public class GroupPaymentRequest {
    private GroupMemberStatus status;
}
