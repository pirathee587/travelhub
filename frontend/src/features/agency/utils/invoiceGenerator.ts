import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from '@/components/common/ui/sonner';

export const downloadBookingInvoice = (booking: any, formatPrice: (price: number) => string, agencyProfile?: any) => {
  try {
    const doc = new jsPDF();
    const agencyName = agencyProfile?.agencyName || agencyProfile?.agentName || 'TravelHub Partner Agency';
    const agencyEmail = agencyProfile?.email || 'support@travelhub.com';
    const agencyPhone = agencyProfile?.phone || agencyProfile?.mobileNumber || 'N/A';

    const bookingId = booking?.bookingId || booking?.id || 'N/A';
    const invoiceNum = `INV-TRH-${String(bookingId).slice(-6).toUpperCase()}`;
    const invoiceDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // ── PAGE DECORATION & HEADER ──────────────────────────────────
    doc.setFillColor(13, 148, 136); // #0d9488 Primary Teal
    doc.rect(0, 0, 210, 44, 'F');

    // Brand Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('TRAVELHUB', 15, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Official Payment & Settlement Invoice', 15, 24);

    // Agency Profile Meta
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(agencyName.toUpperCase(), 15, 33);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Email: ${agencyEmail}  |  Phone: ${agencyPhone}`, 15, 38);

    // Right-aligned Invoice Meta
    doc.setFontSize(9);
    doc.text(`Invoice #: ${invoiceNum}`, 195, 18, { align: 'right' });
    doc.text(`Booking ID: ${bookingId}`, 195, 24, { align: 'right' });
    doc.text(`Issue Date: ${invoiceDate}`, 195, 30, { align: 'right' });
    doc.text(`Payment Method: Card / Escrow`, 195, 36, { align: 'right' });

    let currentY = 56;

    // ── SECTION 1: RESERVATION & TOURIST DETAILS ──────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85); // Slate-700
    doc.text('1. Reservation & Guest Information', 15, currentY);
    currentY += 4;

    const touristName = booking?.touristName || booking?.customerName || 'N/A';
    const touristEmail = booking?.touristEmail || booking?.customerEmail || 'N/A';
    const packageName = booking?.packageName || booking?.packageTitle || 'Custom Travel Itinerary';
    const adults = booking?.adults ?? 1;
    const children = booking?.children ?? 0;
    const partySize = `${adults} Adult(s)${children > 0 ? `, ${children} Child(ren)` : ''}`;
    const startDate = booking?.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A';
    const endDate = booking?.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A';

    autoTable(doc, {
      startY: currentY,
      head: [['Field', 'Reservation Detail']],
      body: [
        ['Package Name', packageName],
        ['Primary Guest', touristName],
        ['Guest Contact Email', touristEmail],
        ['Party Size', partySize],
        ['Travel Schedule', `${startDate} to ${endDate}`],
      ],
      theme: 'plain',
      headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 2 },
      margin: { left: 15, right: 15 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;

    // ── SECTION 2: FLEET & DRIVER ASSIGNMENT ──────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text('2. Allocated Fleet & Staff Resources', 15, currentY);
    currentY += 4;

    const vehicleInfo = booking?.assignedVehicleName 
      ? `${booking.assignedVehicleName} (${booking.assignedVehicleRegistration || 'Assigned'})`
      : booking?.vehicle ? `${booking.vehicle.brand || ''} ${booking.vehicle.model || ''} (${booking.vehicle.registration || 'Assigned'})` : 'Standard Tourist Transport';

    const driverInfo = booking?.assignedDriverName
      ? `${booking.assignedDriverName} (${booking.assignedDriverPhone || 'Contact Provided'})`
      : booking?.driver ? `${booking.driver.name} (${booking.driver.mobileNumber || 'Contact Provided'})` : 'Assigned Escort Driver';

    autoTable(doc, {
      startY: currentY,
      head: [['Resource Type', 'Assigned Asset / Staff Details']],
      body: [
        ['Allocated Vehicle', vehicleInfo],
        ['Assigned Driver', driverInfo],
      ],
      theme: 'plain',
      headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 2 },
      margin: { left: 15, right: 15 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;

    // ── SECTION 3: FINANCIAL SETTLEMENT & ESCROW SPLIT ─────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text('3. Payment Split & Escrow Financial Settlement', 15, currentY);
    currentY += 4;

    const totalPrice = Number(booking?.totalPrice || booking?.amount || 0);
    const platformCommission = totalPrice * 0.10; // 10% TravelHub Commission
    const netAgencyEarnings = totalPrice - platformCommission; // 90% Released to Agency Wallet

    const paymentStatusText = (booking?.status || '').toLowerCase() === 'completed' 
      ? 'Released to Agency Wallet' 
      : 'Held in TravelHub Escrow';

    autoTable(doc, {
      startY: currentY,
      head: [['Accounting Line Item', 'Split Rate', 'Settlement Amount', 'Escrow Status']],
      body: [
        ['Gross Tourist Booking Payment', '100%', formatPrice(totalPrice), 'Paid by Tourist'],
        ['TravelHub Platform Commission', '10%', `- ${formatPrice(platformCommission)}`, 'Platform Service Fee'],
        ['Net Agency Wallet Earnings', '90%', formatPrice(netAgencyEarnings), paymentStatusText],
      ],
      theme: 'striped',
      headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 3 },
      margin: { left: 15, right: 15 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;

    // ── GUARANTEE & STAMP BOX ──────────────────────────────────────
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.rect(15, currentY, 180, 26, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(13, 148, 136);
    doc.text('TRAVELHUB DIGITAL PAYMENT GUARANTEE', 20, currentY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `This official settlement invoice confirms funds were processed via TravelHub Secure Escrow. Net earnings of ${formatPrice(netAgencyEarnings)} are deposited directly into your Agency Wallet balance.`,
      20,
      currentY + 14,
      { maxWidth: 170 }
    );

    // ── FOOTER ───────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Official TravelHub Invoice — Issued for ${agencyName} — ${invoiceNum}`,
      15,
      288
    );
    doc.text('Page 1 of 1', 195, 288, { align: 'right' });

    const filename = `${invoiceNum.toLowerCase()}_invoice.pdf`;
    doc.save(filename);
    toast.success('Official payment invoice downloaded successfully');
  } catch (err) {
    console.error('Failed to generate invoice PDF:', err);
    toast.error('Failed to generate invoice PDF');
  }
};
