package com.travelhub.backend.service;

import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.Room;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.RoomRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private ImageUploadService imageUploadService;

    @InjectMocks
    private RoomService roomService;

    @Test
    void addRoom_assignsHotelWhenHotelIdProvided() {
        Hotel hotel = new Hotel();
        hotel.setId(42L);
        when(hotelRepository.findById(42L)).thenReturn(Optional.of(hotel));
        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Room room = roomService.addRoom("Deluxe Suite", "Suite", 120.0, "Ocean view", null, true, 42L);

        assertNotNull(room);
        assertEquals(hotel, room.getHotel());
        verify(roomRepository).save(any(Room.class));
    }
}
