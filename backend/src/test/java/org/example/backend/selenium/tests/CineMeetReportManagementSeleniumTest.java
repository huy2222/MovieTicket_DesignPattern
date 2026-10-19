package org.example.backend.selenium.tests;

import org.example.backend.selenium.base.BaseSeleniumTest;
import org.example.backend.selenium.config.SeleniumConfig;
import org.example.backend.selenium.pages.CineMeetReportAdminPage;
import org.example.backend.selenium.pages.LoginPage;
import org.example.backend.selenium.support.SeleniumApi;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

class CineMeetReportManagementSeleniumTest extends BaseSeleniumTest {

    private final List<SeleniumApi.Account> configuredAccounts = new ArrayList<>();

    @AfterEach
    void disableDemoProfiles() {
        for (SeleniumApi.Account account : configuredAccounts) {
            try {
                SeleniumApi.configureCineMeet(account, false);
            } catch (AssertionError exception) {
                System.err.println("Không thể tắt hồ sơ Selenium " + account.email() + ": " + exception.getMessage());
            }
        }
    }

    @Test
    @DisplayName("Kịch bản 2: Quản trị viên tiếp nhận và xác nhận báo cáo CineMeet")
    void adminReviewsAndConfirmsCineMeetViolationReport() {
        try {
            SeleniumApi.Account reporter = configuredAccount("Demo Khách Hàng Báo Cáo");
            SeleniumApi.Account violatingUser = configuredAccount("Demo Tài Khoản Vi Phạm");
            String reportDescription = "Tài khoản liên tục gửi nội dung spam - dữ liệu demo Selenium.";
            String resolutionNote = "Đã kiểm tra bằng chứng và xác nhận tài khoản có hành vi vi phạm.";

            long reportId = SeleniumApi.createUserReport(
                    reporter,
                    violatingUser,
                    "SPAM",
                    reportDescription
            );

            new LoginPage(driver, wait, SeleniumConfig.baseUrl())
                    .open()
                    .login(SeleniumConfig.adminEmail(), SeleniumConfig.adminPassword());

            CineMeetReportAdminPage adminPage = new CineMeetReportAdminPage(
                    driver,
                    wait,
                    SeleniumConfig.baseUrl()
            ).open();
            adminPage.openReport(reportId);

            String pendingDetail = adminPage.detailText(reportId);
            assertTrue(pendingDetail.contains(reporter.fullName()), "Chi tiết phải có người báo cáo");
            assertTrue(pendingDetail.contains(violatingUser.fullName()), "Chi tiết phải có người bị báo cáo");
            assertTrue(pendingDetail.contains(reportDescription), "Chi tiết phải có mô tả báo cáo");
            assertTrue(adminPage.detailStatus().contains("Chờ xử lý"), "Báo cáo ban đầu phải chờ xử lý");

            adminPage.startReview();
            assertTrue(adminPage.detailStatus().contains("Đang xem xét"), "Báo cáo phải chuyển sang đang xem xét");

            adminPage.confirmViolation(resolutionNote);
            assertTrue(adminPage.detailStatus().contains("Đã xác nhận"), "Báo cáo phải được xác nhận vi phạm");
            assertTrue(adminPage.resultText().contains(resolutionNote), "Kết quả phải lưu ghi chú xử lý");
            assertTrue(adminPage.toastText().contains("Xử lý báo cáo thành công"), "Phải hiển thị thông báo thành công");
        } catch (RuntimeException | AssertionError exception) {
            saveScreenshot("cinemeet-report-management-failed");
            throw exception;
        }
    }

    private SeleniumApi.Account configuredAccount(String displayName) {
        SeleniumApi.Account account = SeleniumApi.createCustomer(displayName);
        SeleniumApi.configureCineMeet(account, true);
        configuredAccounts.add(account);
        return account;
    }
}
