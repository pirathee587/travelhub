package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.DocumentResponse;
import com.travelhub.backend.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * DocumentController manages endpoints for user-related travel documents.
 * It provides tools for tourists to retrieve invoices, itineraries, and other booking-related files.
 */
@RestController
@RequestMapping("/api/tourist")
@CrossOrigin(origins = "*")
public class DocumentController {

    private final DocumentService documentService;

    /**
     * Constructor injection for document management business logic.
     */
    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    /**
     * Retrieves a list of documents for a specific user.
     * Supports optional filtering by document type (e.g., 'INVOICE', 'ITINERARY').
     * If type is 'all' or null, returns all documents for the user.
     */
    @GetMapping("/documents")
    public ResponseEntity<List<DocumentResponse>> getDocuments(
            @RequestParam Long userId,
            @RequestParam(required = false) String type) {
        if (type != null && !type.equals("all")) {
            return ResponseEntity.ok(documentService.getDocumentsByType(userId, type));
        }
        return ResponseEntity.ok(documentService.getDocumentsByUserId(userId));
    }

    /**
     * Retrieves the metadata for a single specific document by its ID.
     */
    @GetMapping("/documents/{id}")
    public ResponseEntity<DocumentResponse> getDocumentById(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getDocumentById(id));
    }
}
