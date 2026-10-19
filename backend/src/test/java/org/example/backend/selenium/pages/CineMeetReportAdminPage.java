package org.example.backend.selenium.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public final class CineMeetReportAdminPage extends BasePage {
    private final String baseUrl;

    public CineMeetReportAdminPage(WebDriver driver, WebDriverWait wait, String baseUrl) {
        super(driver, wait);
        this.baseUrl = baseUrl;
    }

    public CineMeetReportAdminPage open() {
        driver.get(baseUrl + "/admin/cinemeet-reports");
        visible(By.cssSelector("[data-testid='cmr-page']"));
        visible(By.cssSelector("[data-testid='cmr-search']"));
        return this;
    }

    public void openReport(long reportId) {
        type(By.cssSelector("[data-testid='cmr-search']"), String.valueOf(reportId));
        click(By.cssSelector("[data-testid='cmr-row-" + reportId + "']"));
        visible(By.cssSelector("[data-testid='cmr-detail-" + reportId + "']"));
    }

    public String detailText(long reportId) {
        return visible(By.cssSelector("[data-testid='cmr-detail-" + reportId + "']")).getText();
    }

    public String detailStatus() {
        return visible(By.cssSelector("[data-testid='cmr-detail-status']")).getText();
    }

    public void startReview() {
        click(By.cssSelector("[data-testid='cmr-start-review']"));
        wait.until(ExpectedConditions.textToBePresentInElementLocated(
                By.cssSelector("[data-testid='cmr-detail-status']"),
                "Đang xem xét"
        ));
    }

    public void confirmViolation(String resolutionNote) {
        type(By.cssSelector("[data-testid='cmr-resolution-note']"), resolutionNote);
        click(By.cssSelector("[data-testid='cmr-resolve']"));
        wait.until(ExpectedConditions.textToBePresentInElementLocated(
                By.cssSelector("[data-testid='cmr-detail-status']"),
                "Đã xác nhận"
        ));
        visible(By.cssSelector("[data-testid='cmr-result']"));
    }

    public String resultText() {
        return visible(By.cssSelector("[data-testid='cmr-result']")).getText();
    }

    public String toastText() {
        return visible(By.cssSelector("[data-testid='cmr-toast']")).getText();
    }
}
