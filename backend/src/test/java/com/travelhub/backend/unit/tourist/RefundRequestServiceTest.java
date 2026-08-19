package com.travelhub.backend.unit.tourist;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.RefundRequestDto;
import com.travelhub.backend.dto.response.RefundResponseDto;
import com.travelhub.backend.entity.*;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.repository.*;
import com.travelhub.backend.service.*;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class RefundRequestServiceTest {

    @Mock
    private RefundRequestRepository refundRequestRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private AgentRepository agentRepository;

    @Mock
    private ImageUploadService imageUploadService;

    @Mock
    private EmailService emailService;

    @Mock
    private AgentSettingsRepository agentSettingsRepository;

    @Mock
    private AgentNotificationService agentNotificationService;

    @Mock
    private UserNotificationService userNotificationService;

    @Mock
    private WalletService walletService;

    @InjectMocks
    private RefundRequestService refundRequestService;

    @Test(description = "createRefundRequest on COMPLETED trip should throw BadRequestException")
    public void createRefundRequest_CompletedTrip_ShouldThrowBadRequestException() {
        User user = User.builder().id(1L).build();
        Booking booking = Booking.builder()
                .id(100L)
                .user(user)
                .status("completed")
                .paymentStatus("PAID")
                .build();

        RefundRequestDto dto = new RefundRequestDto();
        dto.setBankName("Commercial Bank");
        dto.setAccountNo("12345678");
        dto.setAccountHolderName("John Doe");
        dto.setReason("Not satisfied");

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));

        BadRequestException ex = expectThrows(BadRequestException.class,
                () -> refundRequestService.createRefundRequest(1L, 100L, dto));
        assertTrue(ex.getMessage().contains("completed trips"), "Error should state completed trips cannot be refunded");
        verify(refundRequestRepository, never()).save(any());
    }

    @Test(description = "createRefundRequest on CANCELLED trip should throw BadRequestException")
    public void createRefundRequest_CancelledTrip_ShouldThrowBadRequestException() {
        User user = User.builder().id(1L).build();
        Booking booking = Booking.builder()
                .id(101L)
                .user(user)
                .status("cancelled")
                .paymentStatus("PAID")
                .build();

        RefundRequestDto dto = new RefundRequestDto();
        when(bookingRepository.findById(101L)).thenReturn(Optional.of(booking));

        BadRequestException ex = expectThrows(BadRequestException.class,
                () -> refundRequestService.createRefundRequest(1L, 101L, dto));
        assertTrue(ex.getMessage().contains("cancelled trips"));
    }

    @Test(description = "createRefundRequest on unpaid trip should throw BadRequestException")
    public void createRefundRequest_UnpaidTrip_ShouldThrowBadRequestException() {
        User user = User.builder().id(1L).build();
        Booking booking = Booking.builder()
                .id(102L)
                .user(user)
                .status("confirmed")
                .paymentStatus("UNPAID")
                .build();

        RefundRequestDto dto = new RefundRequestDto();
        when(bookingRepository.findById(102L)).thenReturn(Optional.of(booking));

        BadRequestException ex = expectThrows(BadRequestException.class,
                () -> refundRequestService.createRefundRequest(1L, 102L, dto));
        assertTrue(ex.getMessage().contains("Only paid bookings can be refunded"));
    }

    @Test(description = "createRefundRequest by unauthorized user should throw BadRequestException")
    public void createRefundRequest_UnauthorizedUser_ShouldThrowBadRequestException() {
        User user = User.builder().id(1L).build();
        Booking booking = Booking.builder()
                .id(103L)
                .user(user)
                .status("confirmed")
                .paymentStatus("PAID")
                .build();

        RefundRequestDto dto = new RefundRequestDto();
        when(bookingRepository.findById(103L)).thenReturn(Optional.of(booking));

        assertThrows(BadRequestException.class,
                () -> refundRequestService.createRefundRequest(999L, 103L, dto));
    }

    @Test(description = "createRefundRequest on valid paid confirmed trip should succeed")
    public void createRefundRequest_ValidPaidTrip_ShouldSucceed() {
        User user = User.builder().id(1L).name("John Doe").build();
        Agent agent = Agent.builder().id(5L).build();
        Package pkg = Package.builder().id(10L).packageName("Beach Tour").agent(agent).build();
        Booking booking = Booking.builder()
                .id(104L)
                .user(user)
                .pkg(pkg)
                .status("confirmed")
                .paymentStatus("PAID")
                .totalPrice(200.0)
                .build();

        RefundRequestDto dto = new RefundRequestDto();
        dto.setBankName("BOC");
        dto.setAccountNo("987654321");
        dto.setAccountHolderName("John Doe");
        dto.setBranchName("Colombo");
        dto.setReason("Emergency cancellation");

        RefundRequest savedRequest = RefundRequest.builder()
                .id(1L)
                .booking(booking)
                .user(user)
                .agent(agent)
                .bankName(dto.getBankName())
                .accountNo(dto.getAccountNo())
                .accountHolderName(dto.getAccountHolderName())
                .branchName(dto.getBranchName())
                .reason(dto.getReason())
                .status("PENDING")
                .build();

        when(bookingRepository.findById(104L)).thenReturn(Optional.of(booking));
        when(refundRequestRepository.findByBookingId(104L)).thenReturn(Optional.empty());
        when(refundRequestRepository.save(any(RefundRequest.class))).thenReturn(savedRequest);
        when(agentSettingsRepository.findByAgentId(5L)).thenReturn(Optional.empty());

        RefundResponseDto response = refundRequestService.createRefundRequest(1L, 104L, dto);

        assertNotNull(response);
        assertEquals(response.getStatus(), "PENDING");
        assertEquals(booking.getStatus(), "Refund_Requested");
        assertEquals(booking.getPaymentStatus(), "REFUND_REQUESTED");
        verify(refundRequestRepository, times(1)).save(any(RefundRequest.class));
        verify(bookingRepository, times(1)).save(booking);
    }
}
