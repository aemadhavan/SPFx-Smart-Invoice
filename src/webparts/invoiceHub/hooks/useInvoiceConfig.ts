import { useState, useCallback } from 'react';
import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { IConfig } from "../types/config";

interface IConfigItem {
  Id: number;
  Title: string;
  Value: string;
}

interface IUseInvoiceConfigReturn {
  invoiceNumber: string;
  isLoading: boolean;
  error: Error | undefined;
  config: IConfig | undefined;  
  getConfig: () => Promise<void>;
  getInvoiceNumber: () => Promise<void>;
  incrementInvoiceNumber: () => Promise<void>;
}

export const useInvoiceConfig = (sp: SPFI): IUseInvoiceConfigReturn => {
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [config, setConfig] = useState<IConfig>();
  const [configId, setConfigId] = useState<number>(0);
  const [invoiceFormat, setInvoiceFormat] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  // Format invoice number
  const formatInvoiceNumber = (number: string): string => {
    if (!invoiceFormat) return number;
    
    const year = new Date().getFullYear().toString();
    return invoiceFormat
      .replace('{RunningNumber}', number.padStart(3, '0'))
      .replace('{Year}', year);
  };
  // Get Config
  const getConfig = useCallback(async () => {
    // Your implementation here
    try{
      const items = await sp.web.lists
                .getByTitle("Config")
                .items
                .select("Title", "Value")();
      const configMap = items.reduce((acc, item) => {
              acc[item.Title] = item.Value;
              return acc;
          }, {} as Record<string, string>);
      // Store the invoice format
      setInvoiceFormat(configMap.InvoiceNumberFormat || 'ICS-{RunningNumber}/{Year}');

      const configItem: IConfig = {
            CompanyName: configMap.CompanyName || "",
            CompanyAddress: configMap.CompanyAddress || "",
            Suburb: configMap.Suburb || "",
            City: configMap.City || "",
            CompanyTel: configMap.CompanyTel || "",
            CompanyEmail: configMap.CompanyEmail || "",
            GSTNo: configMap.GSTNo || "",
            BankName: configMap.BankName || "",
            BankAccountNo: configMap.AccountNo || "",
            PaymentTerms: configMap.PaymentTerms || "",
            EmailToCustomer: (configMap.EmailToCustomer==="No")?false:true,
        };
        setConfig(configItem);
        setError(undefined);
    }
    catch (error) {
      console.error('Error fetching config:', error)
      throw error
    }
    finally {
      setIsLoading(false);
    }
  },[sp]);

  // Get invoice number from config
  const getInvoiceNumber = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);
    try {
       // First ensure we have the format
       if (!invoiceFormat) {
        const formatItems = await sp.web.lists
          .getByTitle("Config")
          .items
          .filter("Title eq 'InvoiceNumberFormat'")();
        
        if (formatItems && formatItems.length > 0) {
          setInvoiceFormat(formatItems[0].Value);
        }
      }

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
  }, [sp,invoiceFormat]);

  // Increment invoice number
  const incrementInvoiceNumber = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);
    try {
      if (!configId) {
        throw new Error('Config ID not found');
      }

      // Extract the running number from the current invoice number
      const runningNumber = invoiceNumber.match(/\d+/)?.[0];
      if (!runningNumber) {
        throw new Error('Could not extract running number from invoice number');
      }

      const nextNumber = (parseInt(runningNumber) + 1).toString();

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
  }, [sp, configId, invoiceNumber,invoiceFormat]);

  return {
    invoiceNumber,
    isLoading,
    error,
    config,
    getConfig,
    getInvoiceNumber,
    incrementInvoiceNumber
  };
};