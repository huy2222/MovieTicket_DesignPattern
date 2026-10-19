package org.example.backend.selenium.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public final class LoginPage extends BasePage {

    private final String baseUrl;

    public LoginPage(WebDriver driver, WebDriverWait wait, String baseUrl) {
        super(driver, wait);
        this.baseUrl = baseUrl;
    }

    public LoginPage open() {
        driver.get(baseUrl + "/login");
        visible(By.id("login-submit"));
        return this;
    }

    public void login(String email, String password) {
        type(By.id("login-email"), email);
        type(By.id("login-password"), password);
        click(By.id("login-submit"));
        wait.until(ExpectedConditions.not(ExpectedConditions.urlContains("/login")));
    }
}
