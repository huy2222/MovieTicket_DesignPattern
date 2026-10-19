package org.example.backend.selenium.config;

import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.util.Properties;

public final class SeleniumConfig {

    private static final Properties PROPERTIES = loadProperties();

    private SeleniumConfig() {
    }

    public static String baseUrl() {
        return read("selenium.base-url", "SELENIUM_BASE_URL", "http://localhost:5173");
    }

    public static Duration timeout() {
        String value = read("selenium.timeout-seconds", "SELENIUM_TIMEOUT_SECONDS", "15");
        return Duration.ofSeconds(Long.parseLong(value));
    }

    public static boolean headless() {
        return Boolean.parseBoolean(read("selenium.headless", "SELENIUM_HEADLESS", "false"));
    }

    public static String apiUrl() {
        return read("selenium.api-url", "SELENIUM_API_URL", "http://localhost:8081/api");
    }

    public static String adminEmail() {
        return read("selenium.admin-email", "SELENIUM_ADMIN_EMAIL", "admin@admin.com");
    }

    public static String adminPassword() {
        return read("selenium.admin-password", "SELENIUM_ADMIN_PASSWORD", "admin");
    }

    private static String read(String propertyName, String environmentName, String defaultValue) {
        String systemValue = System.getProperty(propertyName);
        if (systemValue != null && !systemValue.isBlank()) {
            return systemValue.trim();
        }

        String environmentValue = System.getenv(environmentName);
        if (environmentValue != null && !environmentValue.isBlank()) {
            return environmentValue.trim();
        }

        return PROPERTIES.getProperty(propertyName, defaultValue).trim();
    }

    private static Properties loadProperties() {
        Properties properties = new Properties();
        try (InputStream input = SeleniumConfig.class.getClassLoader()
                .getResourceAsStream("selenium.properties")) {
            if (input != null) {
                properties.load(input);
            }
            return properties;
        } catch (IOException exception) {
            throw new IllegalStateException("Khong the doc selenium.properties", exception);
        }
    }
}
