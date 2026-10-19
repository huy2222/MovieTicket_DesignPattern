package org.example.backend.selenium.base;

import org.example.backend.selenium.config.SeleniumConfig;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public abstract class BaseSeleniumTest {

    protected WebDriver driver;
    protected WebDriverWait wait;

    @BeforeEach
    protected void startBrowser() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--disable-notifications");
        options.addArguments("--disable-popup-blocking");
        options.addArguments("--lang=vi-VN");

        if (SeleniumConfig.headless()) {
            options.addArguments("--headless=new");
            options.addArguments("--window-size=1440,1000");
        }

        driver = new ChromeDriver(options);
        if (!SeleniumConfig.headless()) {
            driver.manage().window().setSize(new Dimension(1440, 1000));
        }
        wait = new WebDriverWait(driver, SeleniumConfig.timeout());
    }

    @AfterEach
    protected void stopBrowser() {
        if (driver != null) {
            driver.quit();
        }
    }

    protected void saveScreenshot(String name) {
        if (!(driver instanceof TakesScreenshot screenshotDriver)) {
            return;
        }

        try {
            Path directory = Path.of("target", "selenium-screenshots");
            Files.createDirectories(directory);
            String timestamp = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
            byte[] image = screenshotDriver.getScreenshotAs(OutputType.BYTES);
            Files.write(directory.resolve(name + "-" + timestamp + ".png"), image);
        } catch (IOException exception) {
            System.err.println("Khong the luu screenshot: " + exception.getMessage());
        }
    }
}
