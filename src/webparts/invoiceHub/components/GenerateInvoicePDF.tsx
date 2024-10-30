import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { IInvoiceFormData } from "./CreateInvoiceDrawer";

// Interface for PDF metadata
interface IInvoiceMetadata {
  InvoiceNumber: string;
  CustomerName: string;
  TotalAmount: number;
  InvoiceDate: string;
}

export const generateInvoicePDF = async (
  formData: IInvoiceFormData,
  sp: SPFI
): Promise<void> => {
  try {
    // Create PDF
    const doc = new jsPDF();
    
    // Add company logo or header
    doc.setFontSize(20);
    doc.text('INVOICE', 105, 15, { align: 'center' });
    
    // Company Details
    doc.setFontSize(12);
    doc.text('From:', 20, 30);
    doc.setFontSize(10);
    doc.text([
      formData.companyName,
      formData.streetAddress,
      formData.suburb,
      formData.city,
      formData.phone,
      formData.email,
      `GST: ${formData.gst}`
    ], 20, 35);

    // Customer Details
    doc.setFontSize(12);
    doc.text('Bill To:', 120, 30);
    doc.setFontSize(10);
    doc.text([
      formData.customerName,
      formData.customerStreetAddress,
      formData.customerSuburb,
      formData.customerCity,
      formData.customerPostalCode,
      formData.customerPhone,
      formData.customerEmail
    ], 120, 35);

    // Invoice Details
    doc.setFontSize(10);
    doc.text(`Invoice Number: ${formData.invoiceNumber}`, 20, 80);
    doc.text(`Invoice Date: ${formData.invoiceDate}`, 20, 85);
    doc.text(`Due Date: ${formData.dueDate}`, 20, 90);

    // Invoice Items with right-aligned amounts
    const tableData = formData.items.map(item => [
      item.description,
      { content: `$${item.amount.toFixed(2)}`, styles: { halign: 'right' } }
    ]);

    // @ts-ignore (jspdf-autotable extends jsPDF prototype)
    doc.autoTable({
      startY: 100,
      head: [
        [
          { content: 'Description', styles: { halign: 'left' } },
          { content: 'Amount (NZD)', styles: { halign: 'right' } }
        ]
      ],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [51, 122, 183],
        fontSize: 10,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 40, halign: 'right' }
      },
      margin: { right: 40 }, // Add right margin for totals alignment
    });

    // Calculate final position for totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const totalsX = 170; // Right align position for totals

    // Calculate totals
    const subTotal = formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const gst = subTotal * 0.15;
    const total = subTotal + gst;

    // Add totals with right alignment
    // Labels
    doc.text('Subtotal:', totalsX - 50, finalY, { align: 'right' });
    doc.text('GST (15%):', totalsX - 50, finalY + 5, { align: 'right' });
    doc.text('Total:', totalsX - 50, finalY + 10, { align: 'right' });

    // Amounts
    doc.text(`$${subTotal.toFixed(2)}`, totalsX, finalY, { align: 'right' });
    doc.text(`$${gst.toFixed(2)}`, totalsX, finalY + 5, { align: 'right' });
    
    // Set font styles for total
    doc.setFont('helvetica', 'bold');
    doc.text(`$${total.toFixed(2)}`, totalsX, finalY + 10, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    // Bank Details
    doc.setFontSize(12);
    doc.text('Bank Account Details', 20, finalY + 25);
    doc.setFontSize(10);
    doc.text([
      formData.bankName,
      formData.accountNumber
    ], 20, finalY + 30);

    // Convert PDF to binary data
    const pdfData = doc.output('arraybuffer');

    // Create file name
    const fileName = `${formData.invoiceNumber.replace(/\//g, '-')}.pdf`;

    // Metadata for the file
    const metadata: IInvoiceMetadata = {
      InvoiceNumber: formData.invoiceNumber,
      CustomerName: formData.customerName,
      TotalAmount: total,
      InvoiceDate: formData.invoiceDate
    };

    // Upload to SharePoint
    await uploadPDFToSharePoint(sp, fileName, pdfData, metadata);

  } catch (error) {
    console.error('Error generating/uploading PDF:', error);
    throw error;
  }
};

const uploadPDFToSharePoint = async (
  sp: SPFI,
  fileName: string,
  pdfData: ArrayBuffer,
  metadata: IInvoiceMetadata
): Promise<void> => {
  try {
    // Upload file to Documents library
    const result = await sp.web.getFolderByServerRelativePath('Shared Documents')
      .files.addUsingPath(fileName, pdfData, { Overwrite: true });
    console.log('File uploaded to SharePoint:', result)
    
    // Get the item associated with the file using the proper method
    const fileServerRelativeUrl = result.ServerRelativeUrl;
    const item = await sp.web.getFileByServerRelativePath(fileServerRelativeUrl).listItemAllFields();

    await sp.web.lists.getByTitle('Documents').items.getById(item.Id).update(metadata);
    console.log(`File ${fileName} uploaded successfully with metadata`);

  } catch (error) {
    console.error('Error uploading to SharePoint:', error);
    throw error;
  }
};