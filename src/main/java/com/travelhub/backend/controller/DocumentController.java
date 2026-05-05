package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.DocumentResponse;
import com.travelhub.backend.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tourist")
@CrossOrigin(origins = "*")
public class DocumentController {

    private final DocumentService documentService;
    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }


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
}
