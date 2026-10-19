package org.example.backend.selenium.tests;

import org.example.backend.selenium.base.BaseSeleniumTest;
import org.example.backend.selenium.config.SeleniumConfig;
import org.example.backend.selenium.pages.CineMeetPage;
import org.example.backend.selenium.pages.LoginPage;
import org.example.backend.selenium.support.SeleniumApi;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

class CineMeetUserReportSeleniumTest extends BaseSeleniumTest {

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
    @DisplayName("Kịch bản 1: Khách hàng báo cáo người dùng vi phạm trong CineMeet")
    void customerReportsViolatingUserAndSeesPendingReport() {
        try {
            SeleniumApi.Account reporter = configuredAccount("Demo Người Báo Cáo");
            SeleniumApi.Account violatingUser = configuredAccount("Demo Người Vi Phạm");

            SeleniumApi.swipeRight(violatingUser, reporter);
            SeleniumApi.SwipeResult match = SeleniumApi.swipeRight(reporter, violatingUser);
            assertTrue(match.matched(), "Hai người dùng phải tạo được match để thực hiện báo cáo");
            assertTrue(match.matchId() > 0, "Match phải có ID hợp lệ");

            new LoginPage(driver, wait, SeleniumConfig.baseUrl())
                    .open()
                    .login(reporter.email(), "Selenium@123");

            CineMeetPage page = new CineMeetPage(driver, wait, SeleniumConfig.baseUrl()).open();
            page.waitForMatch(match.matchId());
            page.openReportForMatch(match.matchId());

            assertTrue(
                    page.reportTargetText().contains(violatingUser.fullName()),
                    "Modal phải hiển thị đúng người dùng bị báo cáo"
            );

            page.submitReportWithoutReason();
            assertTrue(
                    page.reportError().contains("Vui lòng chọn lý do báo cáo"),
                    "Hệ thống phải bắt buộc chọn lý do báo cáo"
            );

            page.submitUserReport(
                    "HARASSMENT",
                    "Người dùng gửi nội dung quấy rối trong CineMeet - dữ liệu demo Selenium."
            );

            assertTrue(
                    page.successNotice().contains("Gửi báo cáo thành công"),
                    "Phải hiển thị thông báo gửi báo cáo thành công"
            );

            page.openMyReports();
            String reportCard = page.reportCardTextFor(violatingUser.fullName());
            assertTrue(reportCard.contains("Quấy rối hoặc bắt nạt"), "Báo cáo phải lưu đúng lý do");
            assertTrue(reportCard.contains("Chờ xử lý"), "Báo cáo mới phải ở trạng thái chờ xử lý");
        } catch (RuntimeException | AssertionError exception) {
            saveScreenshot("cinemeet-user-report-failed");
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
