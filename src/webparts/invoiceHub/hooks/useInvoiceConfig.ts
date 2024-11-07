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
  error: Error | null;
  config: IConfig | undefined;  
  getConfig: () => Promise<void>;
  getInvoiceNumber: () => Promise<void>;
  incrementInvoiceNumber: () => Promise<void>;
}

export const useInvoiceConfig = (sp: SPFI): IUseInvoiceConfigReturn => {
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [config, setConfig] = useState<IConfig>();
  const [configId, setConfigId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Format invoice number
  const formatInvoiceNumber = (number: string): string => {
    return `AHL-${number.padStart(3, '0')}/${new Date().getFullYear()}`;
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
        };
        setConfig(configItem);
        setError(null);
    }
    catch (err) {
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
    config,
    getConfig,
    getInvoiceNumber,
    incrementInvoiceNumber
  };
};