package org.example.backend.controller;

import org.example.backend.dto.request.RoomRequest;
import org.example.backend.dto.response.RoomResponse;
import org.example.backend.service.RoomService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class RoomController {
    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping("/rooms")
    public List<RoomResponse> getRooms(@RequestParam(required = false) Long cinemaId) {
        return roomService.getRooms(cinemaId);
    }

    @GetMapping("/cinemas/{cinemaId}/rooms")
    public List<RoomResponse> getRoomsByCinema(@PathVariable Long cinemaId) {
        return roomService.getRooms(cinemaId);
    }

    @GetMapping("/rooms/{id}")
    public RoomResponse getRoomById(@PathVariable Long id) {
        return roomService.getRoomById(id);
    }

    @PostMapping("/rooms")
    @ResponseStatus(HttpStatus.CREATED)
    public RoomResponse createRoom(@RequestBody RoomRequest request) {
        return roomService.createRoom(request);
    }

    @PutMapping("/rooms/{id}")
    public RoomResponse updateRoom(@PathVariable Long id, @RequestBody RoomRequest request) {
        return roomService.updateRoom(id, request);
    }

    @DeleteMapping("/rooms/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
    }
}
