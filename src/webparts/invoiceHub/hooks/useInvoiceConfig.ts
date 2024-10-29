import { useState, useCallback } from 'react';
import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

interface IConfigItem {
  Id: number;
  Title: string;
  Value: string;
}

interface IUseInvoiceConfigReturn {
  invoiceNumber: string;
  isLoading: boolean;
  error: Error | null;
  getInvoiceNumber: () => Promise<void>;
  incrementInvoiceNumber: () => Promise<void>;
}

export const useInvoiceConfig = (sp: SPFI): IUseInvoiceConfigReturn => {
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [configId, setConfigId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Format invoice number
  const formatInvoiceNumber = (number: string): string => {
    return `AHL-${number.padStart(3, '0')}/${new Date().getFullYear()}`;
  };

  // Get invoice number from config
  const getInvoiceNumber = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const configItems: IConfigItem[] = await sp.web.lists
        .getByTitle("Config")
        .items
        .filter("Title eq 'InvoiceRunningNumber'")();

      if (configItems && configItems.length > 0) {
        const currentNumber = configItems[0].Value;
        setConfigId(configItems[0].Id);
        setInvoiceNumber(formatInvoiceNumber(currentNumber));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch invoice number'));
    } finally {
      setIsLoading(false);
    }
  }, [sp]);

  // Increment invoice number
  const incrementInvoiceNumber = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!configId) {
        throw new Error('Config ID not found');
      }

      const currentNum = parseInt(invoiceNumber.split('-')[1].split('/')[0]);
      const nextNumber = (currentNum + 1).toString();

      await sp.web.lists
        .getByTitle("Config")
        .items
        .getById(configId)
        .update({
          Value: nextNumber
        });

      setInvoiceNumber(formatInvoiceNumber(nextNumber));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to increment invoice number'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sp, configId, invoiceNumber]);

  return {
    invoiceNumber,
    isLoading,
    error,
    getInvoiceNumber,
    incrementInvoiceNumber
  };
};