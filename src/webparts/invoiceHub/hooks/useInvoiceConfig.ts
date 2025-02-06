import { useState, useCallback } from 'react';
import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { IConfig } from "../types/config";

interface IUseInvoiceConfigReturn {
  invoiceNumber: string;
  isLoading: boolean;
  error: Error | undefined;
  config: IConfig | undefined;
  getConfig: () => Promise<void>;
  getInvoiceNumber: () => Promise<void>;
  incrementInvoiceNumber: () => Promise<string | void>;
}

export const useInvoiceConfig = (sp: SPFI): IUseInvoiceConfigReturn => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [config, setConfig] = useState<IConfig>();
  const [configId, setConfigId] = useState<number>(0);
  const [invoiceFormat, setInvoiceFormat] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  // Format invoice number with better error handling
  const formatInvoiceNumber = (number: string, format: string): string => {
    try {
      if (!format || !number) {
        throw new Error('Invalid format or number provided');
      }
      const year = new Date().getFullYear().toString();
      return format
        .replace('{RunningNumber}', number.padStart(3, '0'))
        .replace('{Year}', year);
    } catch (err) {
      console.error('Error formatting invoice number:', err);
      throw new Error('Failed to format invoice number');
    }
  };

  // Get Config with enhanced error handling
  const getConfig = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const items = await sp.web.lists
        .getByTitle("Config")
        .items
        .select("Id", "Title", "Value")();

      if (!items || items.length === 0) {
        throw new Error('No configuration found');
      }

      const configMap = items.reduce((acc, item) => {
        acc[item.Title] = { id: item.Id, value: item.Value };
        return acc;
      }, {} as Record<string, { id: number; value: string }>);

      // Validate required config entries
      if (!configMap.InvoiceNumberFormat) {
        throw new Error('Invoice number format not found in configuration');
      }

      // Store the invoice format
      const format = configMap.InvoiceNumberFormat.value;
      setInvoiceFormat(format);

      // Find and store running number config ID
      const runningNumberConfig = configMap.InvoiceRunningNumber;
      if (runningNumberConfig) {
        setConfigId(runningNumberConfig.id);
        const formattedNumber = formatInvoiceNumber(
          runningNumberConfig.value,
          format
        );
        setInvoiceNumber(formattedNumber);
      }

      const configItem: IConfig = {
        CompanyName: configMap.CompanyName?.value || "",
        CompanyAddress: configMap.CompanyAddress?.value || "",
        Suburb: configMap.Suburb?.value || "",
        City: configMap.City?.value || "",
        CompanyTel: configMap.CompanyTel?.value || "",
        CompanyEmail: configMap.CompanyEmail?.value || "",
        GSTNo: configMap.GSTNo?.value || "",
        BankName: configMap.BankName?.value || "",
        BankAccountNo: configMap.AccountNo?.value || "",
        PaymentTerms: configMap.PaymentTerms?.value || "",
        EmailToCustomer: configMap.EmailToCustomer?.value === "Yes",
      };
      setConfig(configItem);
      setError(undefined);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch configuration';
      setError(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sp]);

  // Get invoice number with validation
  const getInvoiceNumber = useCallback(async (): Promise<void> => {
    try {
      await getConfig();
    } catch (err) {
      console.error('Error in getInvoiceNumber:', err);
      throw err;
    }
  }, [getConfig]);

  // Increment invoice number with enhanced validation
  const incrementInvoiceNumber = useCallback(async (): Promise<string> => {
    if (!configId) {
      throw new Error('Config ID not found. Please refresh the page and try again.');
    }

    setIsLoading(true);
    try {
      const match = invoiceNumber.match(/\d+/);
      if (!match) {
        throw new Error('Could not extract running number from invoice number');
      }

      const currentNumber = parseInt(match[0]);
      const nextNumber = (currentNumber + 1).toString();

      await sp.web.lists
        .getByTitle("Config")
        .items
        .getById(configId)
        .update({
          Value: nextNumber
        });

      const newInvoiceNumber = formatInvoiceNumber(nextNumber, invoiceFormat);
      setInvoiceNumber(newInvoiceNumber);
      return newInvoiceNumber;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to increment invoice number';
      setError(new Error(errorMessage));
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