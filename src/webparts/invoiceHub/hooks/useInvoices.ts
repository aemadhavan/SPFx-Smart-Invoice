import { useState, useEffect, useCallback } from 'react';
import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import { IInvoice } from '../components/InvoiceHub';

export const useInvoices = (sp: SPFI, listName: string):{
  invoices: IInvoice[];
  loading: boolean;
  error: string | undefined;
  refreshInvoices: () => Promise<void>;
} => {
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const items: IInvoice[] = await sp.web.lists
        .getByTitle(listName)
        .items
        .select('Id,Title,InvoiceNumber,CustomerName,TotalAmount,InvoiceDate,Status,FileRef,FileLeafRef')
        .orderBy('Created', false)();

      setInvoices(items);
      setError(undefined);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err instanceof Error ? err.message : 'Error fetching invoices');
    } finally {
      setLoading(false);
    }
  }, [sp, listName]);

  // Initial fetch with proper promise handling
  useEffect(() => {
    let isMounted = true; // Flag to check if component is still mounted
    const initFetch = async (): Promise<void> => {
      try {
        if (isMounted) {
          await fetchInvoices();
        }
      } catch (err) {
        console.error('Error during initial invoice fetch:', err);
        if (isMounted) {
          setError('Failed to load invoices');
        }
      }
    };

    // Call initFetch and handle any potential errors
    initFetch().catch((err) => {
      console.error('Unhandled error in initFetch:', err);
      if (isMounted) {
        setError('Unexpected error while loading invoices');
      }
    });
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [fetchInvoices]);
  

  // Expose the refresh function
  const refreshInvoices = useCallback(async (): Promise<void> => {
    try {
      await fetchInvoices();
    } catch (err) {
      console.error('Error refreshing invoices:', err);
      throw err; // Re-throw the error to be handled by the caller
    }
  }, [fetchInvoices]);

  return { invoices, loading, error, refreshInvoices };
};