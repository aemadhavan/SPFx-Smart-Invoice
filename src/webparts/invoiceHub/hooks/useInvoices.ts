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
        .select('Id,Title,InvoiceNumber,CustomerName,TotalAmount,InvoiceDate,FileRef,FileLeafRef')
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

  // Initial fetch
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Expose the refresh function
  const refreshInvoices = useCallback(async () => {
    await fetchInvoices();
  }, [fetchInvoices]);

  return { invoices, loading, error, refreshInvoices };
};