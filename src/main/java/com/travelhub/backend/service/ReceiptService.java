package com.travelhub.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.Payment;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class ReceiptService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    public ReceiptService(BookingRepository bookingRepository, PaymentRepository paymentRepository) {
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
    }

    public byte[] generateBookingReceipt(Long bookingId) throws Exception {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        Payment payment = paymentRepository.findFirstByBookingOrderByCreatedAtDesc(booking)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "bookingId", bookingId));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, baos);

        document.open();

        // Fonts
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Color.BLACK);
        Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.DARK_GRAY);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.BLACK);
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.BLACK);

        // Header Table
        PdfPTable headerTable = new PdfPTable(1);
        headerTable.setWidthPercentage(100);
        
        PdfPCell titleCell = new PdfPCell(new Phrase("TravelHub Sri Lanka", titleFont));
        titleCell.setBorder(Rectangle.NO_BORDER);
        titleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        headerTable.addCell(titleCell);

        PdfPCell subTitleCell = new PdfPCell(new Phrase("OFFICIAL PAYMENT RECEIPT", subTitleFont));
        subTitleCell.setBorder(Rectangle.NO_BORDER);
        subTitleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        subTitleCell.setPaddingTop(10f);
        headerTable.addCell(subTitleCell);

        document.add(headerTable);
        document.add(new Paragraph("\n"));
        document.add(new Paragraph("----------------------------------------------------------------------------------------------------------------------------------"));
        document.add(new Paragraph("\n"));

        // Information Table
        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setSpacingBefore(10f);

        // Left Side: Customer Details
        addTableCell(infoTable, "CUSTOMER DETAILS", boldFont, true);
        addTableCell(infoTable, "PAYMENT DETAILS", boldFont, true);

        addTableCell(infoTable, "Name: " + booking.getUser().getName(), normalFont, false);
        addTableCell(infoTable, "Receipt No: " + payment.getTransactionId(), normalFont, false);

        addTableCell(infoTable, "Email: " + booking.getUser().getEmail(), normalFont, false);
        addTableCell(infoTable, "Date: " + payment.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")), normalFont, false);

        addTableCell(infoTable, "Phone: " + (booking.getUser().getTelephone() != null ? booking.getUser().getTelephone() : "N/A"), normalFont, false);
        addTableCell(infoTable, "Status: " + payment.getStatus().toUpperCase(), boldFont, false);

        document.add(infoTable);
        document.add(new Paragraph("\n"));

        // Booking Summary Table
        PdfPTable summaryTable = new PdfPTable(2);
        summaryTable.setWidthPercentage(100);
        summaryTable.setSpacingBefore(20f);
        summaryTable.setWidths(new float[]{3f, 1f});

        // Table Header
        PdfPCell h1 = new PdfPCell(new Phrase("Description", boldFont));
        h1.setBackgroundColor(Color.LIGHT_GRAY);
        h1.setPadding(8f);
        summaryTable.addCell(h1);

        PdfPCell h2 = new PdfPCell(new Phrase("Amount", boldFont));
        h2.setBackgroundColor(Color.LIGHT_GRAY);
        h2.setPadding(8f);
        h2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        summaryTable.addCell(h2);

        // Content
        addSummaryRow(summaryTable, "Package: " + booking.getPkg().getPackageName(), normalFont);
        addSummaryRow(summaryTable, "Start Date: " + booking.getStartDate().toString(), normalFont);
        addSummaryRow(summaryTable, "End Date: " + booking.getEndDate().toString(), normalFont);

        // Total
        PdfPCell totalLabel = new PdfPCell(new Phrase("TOTAL PAID (LKR)", boldFont));
        totalLabel.setPadding(10f);
        totalLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        summaryTable.addCell(totalLabel);

        PdfPCell totalValue = new PdfPCell(new Phrase(String.format("%,.2f", payment.getAmount()), boldFont));
        totalValue.setPadding(10f);
        totalValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        summaryTable.addCell(totalValue);

        document.add(summaryTable);

        // Footer
        document.add(new Paragraph("\n\n\n"));
        Paragraph footer = new Paragraph("Thank you for choosing TravelHub Sri Lanka!\nThis is a computer-generated receipt and does not require a signature.", 
                FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY));
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        document.close();
        return baos.toByteArray();
    }

    private void addTableCell(PdfPTable table, String text, Font font, boolean isHeader) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(5f);
        table.addCell(cell);
    }

    private void addSummaryRow(PdfPTable table, String description, Font font) {
        PdfPCell descCell = new PdfPCell(new Phrase(description, font));
        descCell.setPadding(8f);
        table.addCell(descCell);

        PdfPCell emptyCell = new PdfPCell(new Phrase("-", font));
        emptyCell.setPadding(8f);
        emptyCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(emptyCell);
    }
}
