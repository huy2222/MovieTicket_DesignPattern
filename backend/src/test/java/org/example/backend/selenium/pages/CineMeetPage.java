package org.example.backend.selenium.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

public final class CineMeetPage extends BasePage {
    private final String baseUrl;

    public CineMeetPage(WebDriver driver, WebDriverWait wait, String baseUrl) {
        super(driver, wait);
        this.baseUrl = baseUrl;
    }

    public CineMeetPage open() {
        driver.get(baseUrl + "/cinemeet");
        visible(By.cssSelector("[data-testid='cinemeet-toggle']"));
        return this;
    }

    public void waitForMatch(long matchId) {
        visible(By.cssSelector("[data-testid='cinemeet-match-" + matchId + "']"));
    }

    public void openReportForMatch(long matchId) {
        click(By.cssSelector("[data-testid='cinemeet-report-match-" + matchId + "']"));
        visible(By.cssSelector("[data-testid='cinemeet-report-modal']"));
    }

    public String reportTargetText() {
        return visible(By.cssSelector("[data-testid='cinemeet-report-target']")).getText();
    }

    public void submitReportWithoutReason() {
        click(By.cssSelector("[data-testid='cinemeet-report-submit']"));
    }

    public String reportError() {
        return visible(By.cssSelector("[data-testid='cinemeet-report-error']")).getText();
    }

    public void submitUserReport(String reason, String description) {
        new Select(visible(By.cssSelector("[data-testid='cinemeet-report-reason']")))
                .selectByValue(reason);
        type(By.cssSelector("[data-testid='cinemeet-report-description']"), description);
        click(By.cssSelector("[data-testid='cinemeet-report-submit']"));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(
                By.cssSelector("[data-testid='cinemeet-report-modal']")));
    }

    public String successNotice() {
        return visible(By.cssSelector("[data-testid='cinemeet-report-toast']")).getText();
    }

    public void openMyReports() {
        click(By.cssSelector("[data-testid='cinemeet-my-reports']"));
        visible(By.cssSelector("[data-testid='cinemeet-my-reports-modal']"));
    }

    public String reportCardTextFor(String reportedUserName) {
        By card = By.xpath(
                "//*[@data-testid='cinemeet-my-reports-modal']" +
                "//article[contains(@data-testid,'cinemeet-my-report-')][.//*[contains(normalize-space()," +
                xpathLiteral(reportedUserName) + ")]]"
        );
        return visible(card).getText();
    }

    private static String xpathLiteral(String value) {
        if (!value.contains("'")) return "'" + value + "'";
        return "concat('" + value.replace("'", "',\"'\",'") + "')";
    }
}
