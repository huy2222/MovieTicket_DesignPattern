package org.example.backend.selenium.support;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.backend.selenium.config.SeleniumConfig;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.LinkedHashMap;
import java.util.Map;

/** Test-data setup helpers. User actions and assertions remain browser-driven in the Selenium tests. */
public final class SeleniumApi {
    public record Account(long id, String email, String fullName, String token) {
    }

    public record SwipeResult(boolean matched, long matchId) {
    }

    private static final ObjectMapper JSON = new ObjectMapper();
    private static final HttpClient HTTP = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build();

    private SeleniumApi() {
    }

    public static Account createCustomer(String displayName) {
        String suffix = String.valueOf(System.nanoTime());
        String email = "selenium." + suffix + "@example.com";
        String phone = "09" + suffix.substring(Math.max(0, suffix.length() - 8));
        Map<String, Object> registration = Map.of(
                "email", email,
                "fullName", displayName,
                "phoneNumber", phone,
                "password", "Selenium@123"
        );
        post("/auth/register", registration, null);

        JsonNode login = post("/auth/login", Map.of("email", email, "password", "Selenium@123"), null);
        return new Account(login.path("id").asLong(), email, displayName, login.path("token").asText());
    }

    public static void configureCineMeet(Account account, boolean enabled) {
        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("fullName", account.fullName());
        profile.put("profileCard", Map.of(
                "age", 25,
                "bio", "Selenium profile " + account.fullName(),
                "favoriteGenreIds", java.util.List.of(),
                "cineMeetEnabled", enabled
        ));
        profile.put("currentLocation", Map.of(
                "address", "CGV Vincom Thủ Đức",
                "ward", "Linh Trung",
                "district", "Thủ Đức",
                "city", "TP.HCM",
                "country", "Vietnam"
        ));
        put("/customers/me", profile, account.token());
        post("/cinemeet/location", Map.of(
                "latitude", 10.8506,
                "longitude", 106.7719,
                "address", "CGV Vincom Thủ Đức",
                "district", "Thủ Đức",
                "city", "TP.HCM",
                "country", "Vietnam"
        ), account.token());
    }

    public static SwipeResult swipeRight(Account actor, Account target) {
        JsonNode response = post("/cinemeet/swipe/right", Map.of("targetCustomerId", target.id()), actor.token());
        return new SwipeResult(response.path("matched").asBoolean(), response.path("matchId").asLong());
    }

    public static long createUserReport(
            Account reporter,
            Account reportedUser,
            String reason,
            String description
    ) {
        JsonNode response = post("/cinemeet/reports", Map.of(
                "reportedUserId", reportedUser.id(),
                "reason", reason,
                "description", description
        ), reporter.token());
        long reportId = response.path("id").asLong();
        if (reportId <= 0) {
            throw new AssertionError("API không trả về ID báo cáo CineMeet hợp lệ: " + response);
        }
        return reportId;
    }

    private static JsonNode post(String path, Object body, String token) {
        return request("POST", SeleniumConfig.apiUrl() + path, body, token);
    }

    private static JsonNode put(String path, Object body, String token) {
        return request("PUT", SeleniumConfig.apiUrl() + path, body, token);
    }

    private static JsonNode request(String method, String url, Object body, String token) {
        try {
            HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(url))
                    .header("Content-Type", "application/json")
                    .method(method, HttpRequest.BodyPublishers.ofString(JSON.writeValueAsString(body)));
            if (token != null) builder.header("Authorization", "Bearer " + token);
            HttpResponse<String> response = HTTP.send(builder.build(), HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new AssertionError("Không tạo được dữ liệu Selenium: HTTP " + response.statusCode() + " - " + response.body());
            }
            return JSON.readTree(response.body());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new AssertionError("Không gọi được API để tạo dữ liệu Selenium", exception);
        } catch (IOException exception) {
            throw new AssertionError("Không gọi được API để tạo dữ liệu Selenium", exception);
        }
    }

}
