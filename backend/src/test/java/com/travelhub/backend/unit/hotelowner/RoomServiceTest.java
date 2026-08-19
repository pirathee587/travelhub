package com.travelhub.backend.unit.hotelowner;

import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.Room;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.RoomRepository;
import com.travelhub.backend.service.ImageUploadService;
import com.travelhub.backend.service.RoomService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private ImageUploadService imageUploadService;

    @InjectMocks
    private RoomService roomService;

    // ─────────────────────────────────────────────────────────────
    // Test 1: Add Room — Happy path (valid type, price, capacity)
    // ─────────────────────────────────────────────────────────────
    @Test(description = "addRoom with valid details should save and return new room")
    public void addRoom_WithValidDetails_ShouldSaveAndReturnRoom() {
        // ARRANGE
        Hotel hotel = Hotel.builder().id(1L).hotelName("Grand Hotel").applicationStatus("Approved").build();
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));

        Room savedRoom = new Room();
        savedRoom.setName("Deluxe Suite");
        savedRoom.setType("Suite");
        savedRoom.setPrice(250.0);
        savedRoom.setAvailability(true);
        savedRoom.setHotel(hotel);
        when(roomRepository.save(any(Room.class))).thenReturn(savedRoom);

        // ACT
        Room result = roomService.addRoom(
                "Deluxe Suite", "Suite", 250.0, "Ocean view room",
                null, true, 1L
        );

        // ASSERT
        assertNotNull(result, "Saved room should not be null");
        assertEquals(result.getName(), "Deluxe Suite");
        assertEquals(result.getType(), "Suite");
        assertEquals(result.getPrice(), 250.0);
        assertTrue(result.getAvailability());
        verify(roomRepository, times(1)).save(any(Room.class));
    }

    // ─────────────────────────────────────────────────────────────
    // Test 2: Edit Room — Update details (type, price, description)
    // ─────────────────────────────────────────────────────────────
    @Test(description = "updateRoom with valid id should update and return the updated room")
    public void updateRoom_WithValidId_ShouldUpdateAndReturnRoom() {
        // ARRANGE
        Room existingRoom = new Room();
        existingRoom.setId("room-101");
        existingRoom.setName("Standard Room");
        existingRoom.setType("Standard");
        existingRoom.setPrice(100.0);
        existingRoom.setDescription("Basic room");
        when(roomRepository.findById("room-101")).thenReturn(Optional.of(existingRoom));

        Room updatedRoom = new Room();
        updatedRoom.setId("room-101");
        updatedRoom.setName("Updated Standard Room");
        updatedRoom.setType("Deluxe");
        updatedRoom.setPrice(150.0);
        updatedRoom.setDescription("Updated description");
        when(roomRepository.save(any(Room.class))).thenReturn(updatedRoom);

        // ACT
        Room result = roomService.updateRoom(
                "room-101", "Updated Standard Room", "Deluxe", 150.0, "Updated description", null
        );

        // ASSERT
        assertNotNull(result, "Updated room should not be null");
        assertEquals(result.getType(), "Deluxe");
        assertEquals(result.getPrice(), 150.0);
        assertEquals(result.getDescription(), "Updated description");
        verify(roomRepository, times(1)).save(any(Room.class));
    }

    // ─────────────────────────────────────────────────────────────
    // Test 3: Add Room — Validation fails (hotel not found)
    //         Simulates submitting a room with a non-existent hotel
    // ─────────────────────────────────────────────────────────────
    @Test(description = "addRoom with invalid hotelId should throw RuntimeException — validation error preventing room from being added")
    public void addRoom_WithInvalidHotelId_ShouldThrowValidationException() {
        // ARRANGE — hotel not found in DB (simulates missing required data)
        when(hotelRepository.findById(999L)).thenReturn(Optional.empty());

        // ACT + ASSERT
        RuntimeException thrown = expectThrows(RuntimeException.class, () ->
                roomService.addRoom(
                        "Suite A", "Suite", 0.0,
                        null, null, true, 999L
                )
        );

        assertNotNull(thrown, "Should throw when hotel is not found");
        assertTrue(thrown.getMessage().contains("Hotel not found"),
                "Exception message should indicate hotel not found");

        // Verify room was never saved — validation error prevented it
        verify(roomRepository, never()).save(any(Room.class));
    }

    // ─────────────────────────────────────────────────────────────
    // Test 4: Get Rooms By Hotel — Returns list for given hotelId
    // ─────────────────────────────────────────────────────────────
    @Test(description = "getRoomsByHotelId should return all rooms belonging to the hotel")
    public void getRoomsByHotelId_ShouldReturnRoomsList() {
        // ARRANGE
        Room r1 = new Room(); r1.setId("r1"); r1.setName("Room A"); r1.setType("Standard"); r1.setPrice(100.0);
        Room r2 = new Room(); r2.setId("r2"); r2.setName("Room B"); r2.setType("Suite");    r2.setPrice(300.0);
        when(roomRepository.findByHotelId(1L)).thenReturn(List.of(r1, r2));

        // ACT
        List<Room> result = roomService.getRoomsByHotelId(1L);

        // ASSERT
        assertNotNull(result);
        assertEquals(result.size(), 2, "Should return 2 rooms for hotel 1");
        verify(roomRepository, times(1)).findByHotelId(1L);
    }
}
