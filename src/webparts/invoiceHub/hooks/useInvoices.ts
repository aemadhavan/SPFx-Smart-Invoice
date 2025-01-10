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
      
      // Get the list information first
      const list = sp.web.lists.getByTitle(listName);
      const listInfo = await list.select('ItemCount')();
      const totalItems = listInfo.ItemCount;

      let allItems: IInvoice[] = [];
      console.log('Total items:', totalItems);
      if (totalItems <= 5000) {
        // For lists under 5000 items, use simple fetch
        allItems = await list.items
          .select('Id,Title,InvoiceNumber,CustomerName,TotalAmount,InvoiceDate,Status,FileRef,FileLeafRef')
          .orderBy('Created', false)
          .top(5000)();
      } else {
        // For large lists, use batched fetching with indexed column
        const batchSize = 4500;
        let processed = 0;

        // Get the most recent Created date
        const newestItem = await list.items
          .select('Created')
          .orderBy('Created', false)
          .top(1)();

        if (newestItem && newestItem.length > 0) {
          // Convert SharePoint date string to Date object
          let lastCreatedDate = new Date(newestItem[0].Created);

          while (processed < totalItems) {
            // Format the date for SharePoint REST filter
            const formattedDate = lastCreatedDate.toISOString();
            
            const batch = await list.items
              .select('Id,Title,InvoiceNumber,CustomerName,TotalAmount,InvoiceDate,Status,FileRef,FileLeafRef,Created')
              .filter(`Created le datetime'${formattedDate}'`)
              .orderBy('Created', false)
              .top(batchSize)();

            if (batch.length === 0) break;

            allItems = [...allItems, ...batch];
            processed += batch.length;

            if (batch.length === batchSize) {
              // Update lastCreatedDate for next iteration
              lastCreatedDate = new Date(batch[batch.length - 1].Created);
            }
          }
        }
      }

      setInvoices(allItems);
      setError(undefined);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err instanceof Error ? err.message : 'Error fetching invoices');
    } finally {
      setLoading(false);
    }
  }, [sp, listName]);

  useEffect(() => {
    let isMounted = true;
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

    initFetch().catch((err) => {
      console.error('Unhandled error in initFetch:', err);
      if (isMounted) {
        setError('Unexpected error while loading invoices');
      }
    });
    
    return () => {
      isMounted = false;
    };
  }, [fetchInvoices]);

  const refreshInvoices = useCallback(async (): Promise<void> => {
    try {
      await fetchInvoices();
    } catch (err) {
      console.error('Error refreshing invoices:', err);
      throw err;
    }
  }, [fetchInvoices]);

  return { invoices, loading, error, refreshInvoices };
};