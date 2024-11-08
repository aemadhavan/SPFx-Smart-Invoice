import { useState, useEffect, useCallback } from 'react';
import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import { IInvoice } from '../components/InvoiceHub';

export const useInvoices = (sp: SPFI, listName: string) => {
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const items: IInvoice[] = await sp.web.lists
        .getByTitle(listName)
        .items
        .select('Id,Title,InvoiceNumber,CustomerName,TotalAmount,InvoiceDate,Status,FileRef,FileLeafRef')
        .orderBy('Created', false)();

      setInvoices(items);
      setError(null);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err instanceof Error ? err.message : 'Error fetching invoices');
    } finally {
      setLoading(false);
    }
  }, [sp, listName]);

  // Initial fetch with proper promise handling
  useEffect(() => {
    const initFetch = async () => {
      try {
        await fetchInvoices();
      } catch (err) {
        console.error('Error during initial invoice fetch:', err);
        setError('Failed to load invoices');
      }
    };

    void initFetch(); // Use void operator to explicitly mark the promise as handled
  }, [fetchInvoices]);
  

  // Expose the refresh function
  const refreshInvoices = useCallback(async () => {
    try {
      await fetchInvoices();
    } catch (err) {
      console.error('Error refreshing invoices:', err);
      throw err; // Re-throw the error to be handled by the caller
    }
  }, [fetchInvoices]);

  return { invoices, loading, error, refreshInvoices };
};