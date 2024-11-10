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
  //TableCellLayout,  
  makeStyles,
  //tokens,
  Button,
  Input,
  useId,
  Radio,
  tokens,
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
 // MenuProps
  Dialog,
 // DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Select,
  //Option,
  SelectProps 
} from '@fluentui/react-components';
import { Document24Regular, AddRegular, Search24Regular, EditRegular, DeleteRegular, 
  //CommentRegular, 
  MoreHorizontalRegular } from '@fluentui/react-icons';
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
  radioCell: {
    width: '20px',
    padding: '0 4px',
    position: 'relative',
  },
  radioContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& .fui-Radio': {
      margin: 0,
      transform: 'scale(0.8)',
    }
  },
  moreCell: {
    width: '20px',
    padding: '0 4px',
    position: 'relative',
  },
  moreContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCell: {
    width: '20px',
    padding: '0 4px',
    position: 'relative',
  },
  documentIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableRow: {
    position: 'relative',
    transition: 'background-color 0.2s ease-in-out',
    height: '40px', // Fixed height for consistency
    '&:hover': {
      '& .moreButton': {
        visibility: 'visible',
      }
    }
  },
  selectedRow: {
    backgroundColor: `${tokens.colorNeutralBackground3} !important`,
    '& td': {
      backgroundColor: `${tokens.colorNeutralBackground3} !important`,
    },
    '& .radio-button': {
      opacity: 1
    },
    '& .contextMenuTrigger': {
      visibility: 'visible',
    },
    '&:hover': {
      backgroundColor: `${tokens.colorNeutralBackground3} !important`,
      '& td': {
        backgroundColor: `${tokens.colorNeutralBackground3} !important`,
      }
    }
  },
  hoverRow: {
    '&:hover': {
      '&:not(.selectedRow)': {
        backgroundColor: tokens.colorNeutralBackground2,
        '& td': {
          backgroundColor: tokens.colorNeutralBackground2,
        }
      }
    }
  },
  // Update header cell widths to match
  tableHeader: {
    
  },
  tableCellSelected: {
    backgroundColor: `${tokens.colorNeutralBackground3} !important`,
  },
  tableCellHead: {
    padding: '8px 12px',
    fontWeight: '600',
  },
  tableCell: {
    padding: '8px', // Consistent padding
    verticalAlign: 'middle', // Added for alignment
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
    fontSize: '16px',
    color: '#666',
  },
  // Update the link style
  link: {
    color: '#0066cc',
    textDecoration: 'none',
    padding: '8px 0',
    display: 'block',
    '&:hover': {
      textDecoration: 'underline'
    },    
  },
  moreButton: {
    visibility: 'hidden',
    width: '20px',
    height: '20px',
    minWidth: '20px',
    padding: '0',
    margin: '0',
    '& svg': {
      fontSize: '14px',
    }
  },
  contextMenuTrigger: {
    position: 'absolute',
    right: '-24px', // Position after the radio button
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 2,
    visibility: 'hidden', // Hide by default
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground2,
    }
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '16px',
  },
  select: {
    width: '100%',
    minWidth: '250px',
  }
});


export interface IInvoice {
  Id: number;
  Title: string;
  InvoiceNumber: string;
  CustomerName?: string;
  TotalAmount: number | null;
  InvoiceDate: string;
  Status: string;
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
// Add constant for status options outside the component
const STATUS_OPTIONS = [
  'Invoice Sent',
  'Paid',
  'Follow-up Required'
] as const;

export const InvoiceHub: React.FC<IInvoiceHubProps> = (props): JSX.Element => {
  const {invoices, loading, error,refreshInvoices  } = useInvoices(props.sp, props.libraryName);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = React.useState<number | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = React.useState<number | null>(null);

  // Add new state variables at the top with other states
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

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
  const filteredInvoices = React.useMemo(() => {
    if (!searchQuery) return invoices;
    
    const query = searchQuery.toLowerCase();
    return invoices.filter((invoice) => 
      invoice.FileLeafRef?.toLowerCase().includes(query) ||
      invoice.InvoiceNumber?.toLowerCase().includes(query) ||
      invoice.CustomerName?.toLowerCase().includes(query) ||
      invoice.TotalAmount?.toString().includes(query) ||
      invoice.InvoiceDate?.toLowerCase().includes(query) ||
      invoice.Status?.toLowerCase().includes(query)
    );
  }, [invoices, searchQuery]);

  const handleRadioClick = (invoiceId: number): void => {
    if (selectedInvoiceId === invoiceId) {
      setSelectedInvoiceId(null);
    } else {
      setSelectedInvoiceId(invoiceId);
    }
  };
  // Add handlers for context menu actions
  // Update the handleEdit function
// 1. First, update the handleEdit function to ensure it sets the initial state correctly
const handleEdit = (invoiceId: number): void => {
  const invoice = filteredInvoices.find(inv => inv.Id === invoiceId);
  console.log('Invoice found:', invoice); // Debug log
  if (invoice) {
    setSelectedInvoiceId(invoiceId);
    setSelectedStatus(invoice.Status);
    setIsUpdateDialogOpen(true);
  }
};
// Update handleStatusChange
const handleStatusChange = (_event: any, data: { value: string }): void => {
  console.log('Status changed to:', data.value); // Debug log
  setSelectedStatus(data.value);
};
const handleStatusSave = async (): Promise<void> => {
  try {
    setIsSaving(true);
    if (selectedInvoiceId) {
      await props.sp.web.lists
        .getByTitle(props.libraryName)
        .items.getById(selectedInvoiceId)
        .update({
          Status: selectedStatus
        });
      
      // Refresh the list
      await refreshInvoices();
      setIsUpdateDialogOpen(false);
      setSelectedInvoiceId(null);
    }
  } catch (error) {
    console.error('Error updating status:', error);
  } finally {
    setIsSaving(false);
  }
};

// Update useEffect to handle initial status
React.useEffect(() => {
  if (isUpdateDialogOpen && selectedInvoiceId) {
    const invoice = filteredInvoices.find(inv => inv.Id === selectedInvoiceId);
    if (invoice) {
      console.log('Setting initial status:', invoice.Status); // Debug log
      setSelectedStatus(invoice.Status);
    }
  }
}, [isUpdateDialogOpen, selectedInvoiceId, filteredInvoices]);

// 5. Update the handleCloseUpdateDialog
const handleCloseUpdateDialog = (): void => {
  setIsUpdateDialogOpen(false);
  // Delay the reset of other states
  setTimeout(() => {
    setSelectedInvoiceId(null);
    setSelectedStatus('');
  }, 100);
};


  // const handleComment = (invoiceId: number): void => {
  //   console.log('Comment on invoice:', invoiceId);
  // };

  // Update the delete handler
const handleDelete = (invoiceId: number): void => {
  setInvoiceToDelete(invoiceId);
  setIsDeleteDialogOpen(true);
};
 // Add confirm delete handler
const handleConfirmDelete = async (): Promise<void> => {
  try {
    if (invoiceToDelete) {
      await props.sp.web.lists
        .getByTitle(props.libraryName)
        .items.getById(invoiceToDelete)
        .delete();
      
      // Refresh the list
      await refreshInvoices();
      
      // Clear selection if deleted item was selected
      if (selectedInvoiceId === invoiceToDelete) {
        setSelectedInvoiceId(null);
      }
    }
  } catch (error) {
    console.error('Error deleting invoice:', error);
  } finally {
    setIsDeleteDialogOpen(false);
    setInvoiceToDelete(null);
  }
};

// Add dialog close handler
const handleCloseDialog = (): void => {
  setIsDeleteDialogOpen(false);
  setInvoiceToDelete(null);
};

  const handleEditStatus = (): void => {
    // Implement status edit functionality
    console.log('Edit status for invoice:', selectedInvoiceId);
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

  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const columns = [
    { columnKey: "radio", label: "", width: '20px' },
  { columnKey: "more", label: "", width: '20px' },
  { columnKey: "file", label: "", width: '20px' },
    { columnKey: "name", label: "Name" },
    { columnKey: "invoiceNumber", label: "Invoice Number" },
    { columnKey: "customer", label: "Customer" },
    { columnKey: "totalAmount", label: "Total Amount" },
    { columnKey: "invoiceDate", label: "Invoice Date" },
    { columnKey: "status", label: "Status" },
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
   // Create context menu items
   const menuItems = [
    {
      key: 'edit',
      label: 'Update',
      icon: <EditRegular />,
      onClick: (invoiceId: number) => handleEdit(invoiceId)
    },
    // {
    //   key: 'comment',
    //   label: 'Comment',
    //   icon: <CommentRegular />,
    //   onClick: (invoiceId: number) => handleComment(invoiceId)
    // },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteRegular />,
      onClick: (invoiceId: number) => handleDelete(invoiceId)
    }
  ];
// Modify the table row rendering to include context menu
const renderTableRow = (invoice: IInvoice) => {
  const isSelected = selectedInvoiceId === invoice.Id;
  
  return (
    <TableRow 
      key={invoice.Id} 
      className={`${styles.tableRow} ${styles.hoverRow} ${isSelected ? styles.selectedRow : ''}`}
    >
       <TableCell className={styles.radioCell}>
        <div className={styles.radioContainer}>
          <Radio 
            checked={isSelected}
            onClick={() => handleRadioClick(invoice.Id)}
            aria-label={`Select invoice ${invoice.InvoiceNumber}`}
          />
        </div>
      </TableCell>
      <TableCell className={styles.moreCell}>
        <div className={styles.moreContainer}>
          <Menu positioning="below-end">
            <MenuTrigger disableButtonEnhancement>
              <Button
                className={`moreButton ${styles.moreButton}`}
                appearance="subtle"
                icon={<MoreHorizontalRegular fontSize={12} />}
                aria-label="Show more options"
                size="small"
              />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                {menuItems.map((item) => (
                  <MenuItem
                    key={item.key}
                    onClick={() => item.onClick(invoice.Id)}
                  >
                    <span className={styles.menuItem}>
                      {item.icon}
                      {item.label}
                    </span>
                  </MenuItem>
                ))}
              </MenuList>
            </MenuPopover>
          </Menu>
        </div>
      </TableCell>
      <TableCell className={styles.iconCell}>
        <div className={styles.documentIcon}>
          <Document24Regular />
        </div>
      </TableCell>
      <TableCell className={styles.tableCell}>
        <a href={invoice.FileRef} 
           target="_blank" 
           rel="noopener noreferrer"
           className={styles.link}>
          {invoice.FileLeafRef}
        </a>
      </TableCell>
      <TableCell className={styles.tableCell}>
        {invoice.InvoiceNumber}
      </TableCell>
      <TableCell className={styles.tableCell}>
        {invoice.CustomerName}
      </TableCell>
      <TableCell className={styles.tableCellAmount}>
        {formatCurrency(invoice.TotalAmount)}
      </TableCell>
      <TableCell className={styles.tableCell}>
        {formatDate(invoice.InvoiceDate)}
      </TableCell>
      <TableCell className={styles.tableCell}>
        {invoice.Status}
      </TableCell>
    </TableRow>
  );
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
          {selectedInvoiceId ? (              
            <Button 
              appearance="primary"
              className={styles.createButton}
              icon={<EditRegular />}
              onClick={handleEditStatus}
              size="medium"
            >
              Edit Status
            </Button>
          ) : (
            <Button 
              appearance="primary"
              className={styles.createButton}
              icon={<AddRegular />}
              onClick={handleCreateInvoice}
              size="medium"
            >
              Create Invoice
            </Button>
          )}
        </div>
      </div>
      <Table>
        <TableHeader className={styles.tableHeader}>
          <TableRow>
            {columns.map((column: ITableColumn) => (
              <TableCell 
                key={column.columnKey}
                className={
                  column.columnKey === 'select' || column.columnKey === 'file' 
                    ? styles.iconCell 
                    : column.columnKey === 'totalAmount'
                      ? styles.tableCellHeadAmount
                      : styles.tableCellHead
                }
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvoices.map(renderTableRow)}
          <TableRow>
            <TableCell className={styles.iconCell}></TableCell>
            <TableCell className={styles.iconCell}></TableCell>
            <TableCell className={styles.iconCell}></TableCell>
            <TableCell colSpan={3} style={{ textAlign: 'right' }} className={styles.tableCell}>
              <strong>Sum</strong>
            </TableCell>
            <TableCell className={styles.tableCellAmount}>
              <strong>{formatCurrency(calculateFilteredTotal())}</strong>
            </TableCell>
            <TableCell className={styles.tableCell} />
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

{/* Add to your JSX return statement, right before the closing FluentProvider tag: */}
<Dialog open={isDeleteDialogOpen} onOpenChange={(event, data) => {
  if (!data.open) handleCloseDialog();
}}>
  <DialogSurface>
    <DialogBody>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        Are you sure you want to delete this invoice? This action cannot be undone.
      </DialogContent>
      <DialogActions>
        <Button appearance="secondary" onClick={handleCloseDialog}>Cancel</Button>
        <Button appearance="primary" onClick={handleConfirmDelete}>Delete</Button>
      </DialogActions>
    </DialogBody>
  </DialogSurface>
</Dialog>

{/* // Add the Update Status Dialog component before the closing FluentProvider tag // 2. Update the Select component in the Dialog*/}

{/* Update the Dialog with the fixed Select implementation */}
<Dialog 
  open={isUpdateDialogOpen} 
  onOpenChange={(event, data) => {
    if (!data.open) handleCloseUpdateDialog();
  }}
>
  <DialogSurface>
    <DialogBody>
      <DialogTitle>Update Status</DialogTitle>
      <DialogContent>
        <div className={styles.dialogContent}>
        <Select
            value={selectedStatus}
            onChange={handleStatusChange as SelectProps["onChange"]}
            className={styles.select}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
      </DialogContent>
      <DialogActions>
        <Button 
          appearance="secondary" 
          onClick={handleCloseUpdateDialog}
        >
          Cancel
        </Button>
        <Button
          appearance="primary"
          onClick={handleStatusSave}
          disabled={!selectedStatus || selectedStatus === (filteredInvoices.find(inv => inv.Id === selectedInvoiceId)?.Status) || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </DialogBody>
  </DialogSurface>
</Dialog>

  </FluentProvider>
);
};

export default InvoiceHub;
