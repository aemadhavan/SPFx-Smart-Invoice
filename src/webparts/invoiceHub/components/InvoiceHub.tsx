import * as React from 'react';
//import styles from './InvoiceHub.module.scss';
import type { IInvoiceHubProps } from './IInvoiceHubProps';
//import { escape } from '@microsoft/sp-lodash-subset';
import {
  FluentProvider,
  webLightTheme,
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
  TableCellLayout,  
  makeStyles,
  //tokens,
  Button,
  Input,
  useId
} from '@fluentui/react-components';
import { Document24Regular, AddRegular, Search24Regular} from '@fluentui/react-icons';
import { useInvoices } from '../hooks/useInvoices';
import { CreateInvoiceDrawer, IInvoiceFormData } from './CreateInvoiceDrawer';


// Define custom styles
const useStyles = makeStyles({
  container: {
    padding: '20px',
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
  },
  actionContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  searchInput: {
    width: '280px',
  },
  createButton: {
    backgroundColor: '#0078D4',
    color: 'white',
    '&:hover': {
      backgroundColor: '#106EBE',
    }
  },
  iconCell: {
    width: '40px',
    padding: '0 4px',
    textAlign: 'center'
  },
  tableCellHead: {
    padding: '8px 12px',
    fontWeight: '600',
  },
  tableCell: {
    padding: '8px 12px',
  },
  tableCellHeadAmount: {
    padding: '8px 12px',
    fontWeight: '600',
    textAlign: 'right',
  },
  tableCellAmount: {
    padding: '8px 12px',
    textAlign: 'right',
  },
  fileIcon: {
    fontSize: '20px',
    color: '#666'
  },
  link: {
    color: '#0066cc',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline'
    }
  }
});


export interface IInvoice {
  Id: number;
  Title: string;
  InvoiceNumber: string;
  CustomerName?: string;
  TotalAmount: number | null;
  InvoiceDate: string;
  FileRef: string;
  FileLeafRef: string;
}
interface ITableColumn {
  columnKey: string;
  label: string;
  width?: string;
}
// Helper function to format currency
const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '$0.00';
  return `$${amount.toFixed(2)}`;
};

export const InvoiceHub: React.FC<IInvoiceHubProps> = (props): JSX.Element => {
  const { invoices, loading, error,refreshInvoices  } = useInvoices(props.sp, props.libraryName);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const styles = useStyles();
  const searchId = useId('search');

  const handleCreateInvoice = (): void => {
    setIsDrawerOpen(true);
  };
  const handleDrawerDismiss = (): void => {
    setIsDrawerOpen(false);
  };
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(event.target.value);
  };
  const handleInvoiceSubmit = async (data: IInvoiceFormData): Promise<void> => {
    try {
      // Add your logic to save the invoice
      console.log('Saving invoice:', data);
      setIsDrawerOpen(false);
      // Wait a moment to ensure the file is uploaded
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Refresh the dashboard
      await refreshInvoices();
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  const filteredInvoices = React.useMemo(() => {
    if (!searchQuery) return invoices;
    
    const query = searchQuery.toLowerCase();
    return invoices.filter((invoice) => 
      invoice.FileLeafRef?.toLowerCase().includes(query) ||
      invoice.InvoiceNumber?.toLowerCase().includes(query) ||
      invoice.CustomerName?.toLowerCase().includes(query) ||
      invoice.TotalAmount?.toString().includes(query) ||
      invoice.InvoiceDate?.toLowerCase().includes(query)
    );
  }, [invoices, searchQuery]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const columns = [
    { columnKey: "file", label: "" },
    { columnKey: "name", label: "Name" },
    { columnKey: "invoiceNumber", label: "Invoice Number" },
    { columnKey: "customer", label: "Customer" },
    { columnKey: "totalAmount", label: "Total Amount" },
    { columnKey: "invoiceDate", label: "Invoice Date" },
  ];
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      // Create date object from UTC string
      const utcDate = new Date(dateString);
      
      // Format date in NZ timezone
      return utcDate.toLocaleDateString('en-NZ', {
        timeZone: 'Pacific/Auckland',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '/');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };
  const calculateFilteredTotal = (): number => {
    return filteredInvoices.reduce((sum, invoice) => sum + (invoice.TotalAmount || 0), 0);
  };
  return (
    <FluentProvider theme={webLightTheme}>
      <div className={styles.container}>
      <div className={styles.headerContainer}>
          <h2>Smart Invoice Hub</h2>
          <div className={styles.actionContainer}>
            <Input
              id={searchId}
              className={styles.searchInput}
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={handleSearch}
              contentBefore={<Search24Regular />}
              type="search"
            />
            <Button 
              appearance="primary"
              className={styles.createButton}
              icon={<AddRegular />}
              onClick={handleCreateInvoice}
              size="medium"
            >
              Create Invoice
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column: ITableColumn) => (
                <TableCell 
                  key={column.columnKey}
                  className={
                    column.columnKey === 'file' 
                      ? styles.iconCell 
                      : column.columnKey === 'totalAmount'
                        ? styles.tableCellHeadAmount
                        : styles.tableCellHead
                  }
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.label}
                </TableCell>
                
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((invoice: IInvoice) => (
              <TableRow key={invoice.Id}>
                <TableCell className={styles.iconCell}>
                  <TableCellLayout>
                    <Document24Regular className={styles.fileIcon} />
                  </TableCellLayout>
                </TableCell>
                <TableCell className={styles.tableCell}>
                  <a href={invoice.FileRef} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className={styles.link}>
                    {invoice.FileLeafRef}
                  </a>
                </TableCell>
                <TableCell className={styles.tableCell}>{invoice.InvoiceNumber}</TableCell>
                <TableCell className={styles.tableCell}>{invoice.CustomerName}</TableCell>
                <TableCell className={styles.tableCellAmount}>
                  {formatCurrency(invoice.TotalAmount)}
                </TableCell>
                <TableCell className={styles.tableCell}>{formatDate(invoice.InvoiceDate)}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell className={styles.iconCell}></TableCell>
              <TableCell colSpan={3} style={{ textAlign: 'right' }} className={styles.tableCell}>
                <strong>Sum</strong>
              </TableCell>
              <TableCell className={styles.tableCellAmount}>
                <strong>{formatCurrency(calculateFilteredTotal())}</strong>
              </TableCell>
              <TableCell className={styles.tableCell} />
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <CreateInvoiceDrawer 
        isOpen={isDrawerOpen}
        onDismiss={handleDrawerDismiss}
        onSubmit={handleInvoiceSubmit}
        sp={props.sp}
        invoiceLibraryName={props.libraryName}
        customerListName={props.listName}
        context={props.context}
      />
    </FluentProvider>
  );
};

export default InvoiceHub;
