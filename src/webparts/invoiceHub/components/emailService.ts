import { SPFI } from "@pnp/sp";
import "@pnp/sp/sputilities";
import "@pnp/sp/files";
import { IInvoiceFormData } from "./CreateInvoiceDrawer";
//import { IEmailProperties } from "@pnp/sp/sputilities";
import { Message, FileAttachment, BodyType } from "@microsoft/microsoft-graph-types";
import { MSGraphClientV3 } from '@microsoft/sp-http';
import { WebPartContext } from "@microsoft/sp-webpart-base";

export const sendEmailWithAttachment = async (
    formData: IInvoiceFormData,
    sp: SPFI,
    libraryName: string,
    context: WebPartContext
): Promise<void> => {
    try {
        console.log(formData)
        const graphClient: MSGraphClientV3 = await context.msGraphClientFactory.getClient('3');
        // 1. Get the file from SharePoint library
        const fileName = `${formData.invoiceNumber.replace(/\//g, '-')}.pdf`;
        
        // Construct the server-relative URL properly
        const folder = await sp.web.getFolderByServerRelativePath('Shared Documents')(); //libraryName
        const serverRelativeUrl = `${folder.ServerRelativeUrl}/${fileName}`;
        
        // Get the file using the full server-relative URL
        const file = await sp.web.getFileByServerRelativePath(serverRelativeUrl)();
        
        if (!file) {
            throw new Error(`File ${fileName} not found in library ${libraryName}`);
        }

        // 2. Get file content as array buffer
        const fileContent = await sp.web.getFileByServerRelativePath(serverRelativeUrl)
            .getBuffer();

        // 3. Convert ArrayBuffer to base64 using browser APIs
        const uint8Array = new Uint8Array(fileContent);
        const binaryString = uint8Array.reduce((str, byte) => str + String.fromCharCode(byte), '');
        const base64Content = btoa(binaryString);

        // 4. Format currency
        //const totalAmount = formData.items.reduce((sum, item) => sum + item.amount, 0);
        //const gst = totalAmount * 0.15;
        //const totalWithGst = totalAmount + gst;
        
        // const formattedAmount = new Intl.NumberFormat('en-NZ', {
        //     style: 'currency',
        //     currency: 'NZD'
        // }).format(totalWithGst);

        // 5. Create email body with HTML formatting
        // const emailBody = `
        //     <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        //         <p style="margin-bottom: 16px;">Dear ${formData.customerName},</p>
                
        //         <p style="margin-bottom: 16px;">Please find attached your invoice ${formData.invoiceNumber} for ${formattedAmount}.</p>
                
        //         <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 16px;">
        //             <strong style="display: block; margin-bottom: 8px;">Payment Details:</strong>
        //             Bank: ${formData.bankName}<br/>
        //             Account Number: ${formData.accountNumber}<br/>
        //             Reference: ${formData.invoiceNumber}
        //         </div>
                
        //         <p style="margin-bottom: 16px;"><strong>Payment Terms:</strong> 7 days from the date of Invoice</p>
                
        //         <p style="margin-bottom: 16px;">If you have any questions about this invoice, please don't hesitate to contact us.</p>
                
        //         <p style="margin-bottom: 16px;">Thank you for your business!</p>
                
        //         <div style="margin-top: 30px; border-top: 1px solid #dee2e6; padding-top: 20px;">
        //             <strong style="display: block; margin-bottom: 8px;">Best regards,</strong>
        //             ${formData.companyName}<br/>
        //             ${formData.phone}<br/>
        //             ${formData.email}
        //         </div>
        //     </div>
        // `;

        // 6. Create email properties
        // const emailProps: IEmailProperties = {
        //     To: [formData.customerEmail],
        //     Subject: `Invoice ${formData.invoiceNumber} from ${formData.companyName}`,
        //     Body: emailBody,
        //     AdditionalHeaders: {
        //         "content-type": "text/html",
        //     },
        //     From: formData.email
        // };
        const message:Message ={
            subject: `Invoice ${formData.invoiceNumber} from ${formData.companyName}`,
            body: {
                    contentType: "html" as BodyType,
                    content: `
                        <p>Dear ${formData.customerName || 'Customer'},</p>
                        <p>Please find attached your invoice ${formData.invoiceNumber}.</p>
                        <p>Thank you for your business!</p>
                        <p>Best regards,<br/>${formData.companyName}</p>
                    `
                },
                toRecipients: [
                    {
                        emailAddress: {
                            address: formData.customerEmail // Replace with actual recipient email
                        }
                    }
                ],
                attachments: [
                    {
                        '@odata.type': '#microsoft.graph.fileAttachment',
                        name: `Invoice-${formData.invoiceNumber}.pdf`,
                        contentType: 'application/pdf',
                        contentBytes: base64Content
                    } as FileAttachment
                ]
        }

        // 7. Send email using SharePoint utility
        await graphClient.api('/me/sendMail').post({ message: message,saveToSentItems: "true" })
        console.log('Invoice email sent successfully');

    } catch (error) {
        console.error('Error sending invoice email:', error);
        if (error instanceof Error) {
            console.error('Detailed error:', {
                message: error.message,
                stack: error.stack
            });
        }
        throw new Error('Failed to send invoice email: ' + (error instanceof Error ? error.message : String(error)));
    }
};