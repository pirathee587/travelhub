package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.DocumentResponse;
import com.travelhub.backend.service.DocumentService;
import com.travelhub.backend.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tourist")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final ReceiptService receiptService;

    // GET /api/tourist/documents?userId=1
    @GetMapping("/documents")
    public ResponseEntity<List<DocumentResponse>> getDocuments(
            @RequestParam Long userId,
            @RequestParam(required = false) String type) {
        if (type != null && !type.equals("all")) {
            return ResponseEntity.ok(documentService.getDocumentsByType(userId, type));
        }
        return ResponseEntity.ok(documentService.getDocumentsByUserId(userId));
    }

    // GET /api/tourist/documents/1
    @GetMapping("/documents/{id}")
    public ResponseEntity<DocumentResponse> getDocumentById(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getDocumentById(id));
    }

    // GET /api/tourist/documents/invoice/{bookingId}/download
    @GetMapping("/documents/invoice/{bookingId}/download")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long bookingId) {
        try {
            byte[] pdf = receiptService.generateBookingInvoice(bookingId);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Invoice_Booking_" + bookingId + ".pdf");
            return ResponseEntity.ok().headers(headers).body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /api/tourist/documents/receipt/{bookingId}/download
    @GetMapping("/documents/receipt/{bookingId}/download")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable Long bookingId) {
        try {
            byte[] pdf = receiptService.generateBookingReceipt(bookingId);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Receipt_Booking_" + bookingId + ".pdf");
            return ResponseEntity.ok().headers(headers).body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
