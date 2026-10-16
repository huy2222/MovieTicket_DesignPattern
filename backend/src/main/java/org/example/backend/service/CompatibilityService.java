package org.example.backend.service;

import org.example.backend.entity.Customer;
import org.example.backend.entity.Genre;
import org.example.backend.entity.Location;
import org.example.backend.entity.MovieHistory;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
public class CompatibilityService {

    public double calculateScore(Customer source, Customer target) {
        double distanceScore = distanceScore(source, target); // 40%
        double genreScore = genreScore(source, target); // 30%
        double cinemaScore = cinemaScore(source, target); // 20%
        double historyScore = historyScore(source, target); // 10%
        return round2(distanceScore * 0.4 + genreScore * 0.3 + cinemaScore * 0.2 + historyScore * 0.1);
    }

    public double distanceInKm(Customer source, Customer target) {
        Location sourceLocation = source.getCurrentLocation();
        Location targetLocation = target.getCurrentLocation();
        if (sourceLocation == null || targetLocation == null) {
            return 9999d;
        }
        return haversine(
                sourceLocation.getLatitude(),
                sourceLocation.getLongitude(),
                targetLocation.getLatitude(),
                targetLocation.getLongitude()
        );
    }

    private double distanceScore(Customer source, Customer target) {
        double km = distanceInKm(source, target);
        if (km <= 5) {
            return 100;
        }
        if (km <= 15) {
            return 90;
        }
        if (km <= 30) {
            return 80;
        }
        if (km <= 50) {
            return 65;
        }
        if (km <= 100) {
            return 45;
        }
        return 20;
    }

    private double genreScore(Customer source, Customer target) {
        Set<Long> sourceGenres = extractGenreIds(source);
        Set<Long> targetGenres = extractGenreIds(target);
        return jaccardPercentage(sourceGenres, targetGenres);
    }

    private double cinemaScore(Customer source, Customer target) {
        Set<Long> sourceCinemaIds = extractCinemaIds(source);
        Set<Long> targetCinemaIds = extractCinemaIds(target);
        return jaccardPercentage(sourceCinemaIds, targetCinemaIds);
    }

    private double historyScore(Customer source, Customer target) {
        Set<Long> sourceMovieIds = extractMovieHistoryIds(source.getMovieHistories());
        Set<Long> targetMovieIds = extractMovieHistoryIds(target.getMovieHistories());
        return jaccardPercentage(sourceMovieIds, targetMovieIds);
    }

    private Set<Long> extractGenreIds(Customer customer) {
        Set<Long> genreIds = new HashSet<>();
        if (customer.getFavoriteGenres() != null) {
            genreIds.addAll(mapGenreIds(customer.getFavoriteGenres()));
        }
        if (customer.getProfileCard() != null && customer.getProfileCard().getFavoriteGenres() != null) {
            genreIds.addAll(mapGenreIds(customer.getProfileCard().getFavoriteGenres()));
        }

        List<MovieHistory> histories = customer.getMovieHistories();
        if (histories != null) {
            for (MovieHistory history : histories) {
                if (history.getMovie() == null || history.getMovie().getGenres() == null) {
                    continue;
                }
                genreIds.addAll(mapGenreIds(history.getMovie().getGenres()));
            }
        }
        return genreIds;
    }

    private Set<Long> mapGenreIds(List<Genre> genres) {
        if (genres == null) {
            return Set.of();
        }
        return genres.stream()
                .map(Genre::getId)
                .filter(Objects::nonNull)
                .collect(java.util.stream.Collectors.toSet());
    }

    private Set<Long> extractCinemaIds(Customer customer) {
        Set<Long> cinemaIds = new HashSet<>();
        if (customer.getFrequentCinemas() != null) {
            customer.getFrequentCinemas().stream()
                    .map(cinema -> cinema.getId())
                    .filter(Objects::nonNull)
                    .forEach(cinemaIds::add);
        }

        List<MovieHistory> histories = customer.getMovieHistories();
        if (histories != null) {
            for (MovieHistory history : histories) {
                if (history.getCinema() != null && history.getCinema().getId() != null) {
                    cinemaIds.add(history.getCinema().getId());
                }
            }
        }

        if (customer.getProfileCard() != null && customer.getProfileCard().getFrequentCinema() != null
                && customer.getProfileCard().getFrequentCinema().getId() != null) {
            cinemaIds.add(customer.getProfileCard().getFrequentCinema().getId());
        }
        return cinemaIds;
    }

    private Set<Long> extractMovieHistoryIds(List<MovieHistory> histories) {
        if (histories == null) {
            return Set.of();
        }
        Set<Long> ids = new HashSet<>();
        for (MovieHistory history : histories) {
            if (history.getMovie() != null && history.getMovie().getId() != null) {
                ids.add(history.getMovie().getId());
            }
        }
        return ids;
    }

    private double jaccardPercentage(Set<Long> first, Set<Long> second) {
        if (first.isEmpty() || second.isEmpty()) {
            return 0;
        }
        Set<Long> union = new HashSet<>(first);
        union.addAll(second);

        Set<Long> intersection = new HashSet<>(first);
        intersection.retainAll(second);
        if (union.isEmpty()) {
            return 0;
        }
        return ((double) intersection.size() / union.size()) * 100d;
    }

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        double earthRadius = 6371d;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }

    private double round2(double value) {
        return Math.round(value * 100d) / 100d;
    }
}
