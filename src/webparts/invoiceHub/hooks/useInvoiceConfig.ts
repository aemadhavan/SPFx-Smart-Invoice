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
  const formatInvoiceNumber = (number: string, format: string): string => {
    const year = new Date().getFullYear().toString();
    return format
      .replace('{RunningNumber}', number.padStart(3, '0'))
      .replace('{Year}', year);
  };

  // Get Config including invoice format
  const getConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await sp.web.lists
        .getByTitle("Config")
        .items
        .select("Title", "Value")();

      const configMap = items.reduce((acc, item) => {
        acc[item.Title] = item.Value;
        return acc;
      }, {} as Record<string, string>);

      // Store the invoice format
      const format = configMap.InvoiceNumberFormat || 'ISC-{RunningNumber}/{Year}';
      setInvoiceFormat(format);

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
        EmailToCustomer: (configMap.EmailToCustomer === "No") ? false : true,
      };
      setConfig(configItem);
      setError(undefined);

      // After getting config, update the invoice number with the correct format
      if (configMap.InvoiceRunningNumber) {
        const formattedNumber = formatInvoiceNumber(configMap.InvoiceRunningNumber, format);
        setInvoiceNumber(formattedNumber);
        // Store the config ID for the running number
        const runningNumberItem = items.find(item => item.Title === 'InvoiceRunningNumber');
        if (runningNumberItem) {
          setConfigId(runningNumberItem.Id);
        }
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [sp]);

  // Get invoice number
  const getInvoiceNumber = useCallback(async () => {
    if (!invoiceFormat) {
      // If no format is set, get the config first
      await getConfig();
      return;
    }

    setIsLoading(true);
    setError(undefined);
    try {
      const configItems: IConfigItem[] = await sp.web.lists
        .getByTitle("Config")
        .items
        .filter("Title eq 'InvoiceRunningNumber'")();

      if (configItems && configItems.length > 0) {
        const currentNumber = configItems[0].Value;
        setConfigId(configItems[0].Id);
        setInvoiceNumber(formatInvoiceNumber(currentNumber, invoiceFormat));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch invoice number'));
    } finally {
      setIsLoading(false);
    }
  }, [sp, invoiceFormat, getConfig]);

  // Increment invoice number
  const incrementInvoiceNumber = useCallback(async () => {
    if (!invoiceFormat || !configId) {
      throw new Error('Invoice format or Config ID not found');
    }

    setIsLoading(true);
    setError(undefined);
    try {
      // Extract the running number from the current invoice number
      const match = invoiceNumber.match(/\d+/);
      if (!match) {
        throw new Error('Could not extract running number from invoice number');
      }

      const runningNumber = match[0];
      const nextNumber = (parseInt(runningNumber) + 1).toString();

      await sp.web.lists
        .getByTitle("Config")
        .items
        .getById(configId)
        .update({
          Value: nextNumber
        });

      setInvoiceNumber(formatInvoiceNumber(nextNumber, invoiceFormat));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to increment invoice number'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sp, configId, invoiceNumber, invoiceFormat]);

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