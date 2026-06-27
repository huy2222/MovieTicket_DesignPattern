package org.example.backend.config;

import org.example.backend.service.AvatarStorageService;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class UploadResourceConfig implements WebMvcConfigurer {
    private final AvatarStorageService avatarStorageService;

    public UploadResourceConfig(AvatarStorageService avatarStorageService) {
        this.avatarStorageService = avatarStorageService;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/avatars/**")
                .addResourceLocations(avatarStorageService.getUploadDirectory().toUri().toString());
    }
}
