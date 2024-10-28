import { useState, useEffect } from 'react';
import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import { IInvoice } from '../components/InvoiceHub';

export const useInvoices = (sp: SPFI, listName: string) => {
    const [invoices, setInvoices] = useState<IInvoice[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [totalAmount, setTotalAmount] = useState<number>(0);
  
    useEffect(() => {
      const fetchInvoices = async () => {
        try {
          const items = await sp.web.lists
            .getByTitle(listName)
            .items
            .select('Id,Title,InvoiceNumber,CustomerName,TotalAmount,InvoiceDate,FileRef,FileLeafRef')
            .orderBy('InvoiceDate', false)();
  
          setInvoices(items);
          
          // Calculate total amount
          const total = items.reduce((sum: number, invoice: IInvoice) => 
            sum + (invoice.TotalAmount || 0), 0);
          setTotalAmount(total);
          
          setLoading(false);
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      };
  
      fetchInvoices();
    }, [sp, listName]);
  
    return { invoices, loading, error, totalAmount };
  };