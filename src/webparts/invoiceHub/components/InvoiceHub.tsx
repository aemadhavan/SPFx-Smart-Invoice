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
  makeStyles,
  Button,
  Input,
  useId,
  tokens, 
} from '@fluentui/react-components';
import {
  AddRegular, Search24Regular, EditRegular, 
  } from '@fluentui/react-icons';
import { useInvoices } from '../hooks/useInvoices';
import { InvoiceTableRow } from './InvoiceTableRow';
import { UpdateInvoiceDialog } from './UpdateInvoiceDialog';
import { DeleteInvoiceDialog } from './DeleteInvoiceDialog';
import { CreateInvoiceDrawer, IInvoiceFormData } from './CreateInvoiceDrawer';
import { spfi, SPFx } from "@pnp/sp";
import { ICommentInfo } from "@pnp/sp/comments";
import "@pnp/sp/comments/item";
import "@pnp/sp/webs";
import "@pnp/sp/items";

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
    position: 'relative', // Added position
    width: '100%', // Added width
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
    visibility: 'visible',
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
    display: 'flex !important',
    alignItems: 'center !important',
    gap: '8px !important',
    padding: '8px 16px !important',
    cursor: 'pointer !important',
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
  invoiceInfoSection: {
    backgroundColor: tokens.colorNeutralBackground2,
    padding: '16px',
    borderRadius: '4px',
    marginBottom: '16px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  infoLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: tokens.colorNeutralForeground2,
  },
  infoValue: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
  },
  select: {
    width: '100%',
    minWidth: '250px',
  },
  commentsSection: {
    marginTop: '16px',
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    paddingTop: '16px',
  },
  commentsContainer: {
    maxHeight: '300px', // Fixed height for comments container
    overflowY: 'auto',  // Enable vertical scrolling
    marginTop: '8px',
    // Add custom scrollbar styling
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: tokens.colorNeutralBackground1,
      borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: tokens.colorNeutralStroke1,
      borderRadius: '3px',
      '&:hover': {
        background: tokens.colorNeutralStroke1Hover,
      },
    },
  },
  commentsContainerExpanded: {
    // When there are more than 3 comments
    maxHeight: '200px', // Reduced height to show clear scrolling
  },
  commentsLabel: {
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '8px',
    color: tokens.colorNeutralForeground2,
  },
  commentItem: {
    marginBottom: '12px',
    padding: '12px',
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '4px',
    '&:last-child': {
      marginBottom: '0', // Remove margin from last item
    },
  },
  commentAuthor: {
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '4px',
    color: tokens.colorNeutralForeground1,
  },
  commentText: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
    lineHeight: '20px',
    whiteSpace: 'pre-wrap',
  },
  commentDate: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
    marginTop: '4px',
  },
  noComments: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground2,
    fontStyle: 'italic',
    padding: '8px 12px',
  },
  commentInput: {
    marginTop: '16px',
  },
  commentTextarea: {
    width: '100%',
    minHeight: '80px',
  },
  commentInputContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  commentButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  commentButton: {
    minWidth: '80px',
  },
  // Update dialog styles
  dialogSurface: {
    minWidth: '480px',
    maxWidth: '600px',
  },
  dialogActions: {
    padding: '16px 24px', // Added padding
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
});


export interface IInvoice {
  Id: number;
  Title: string;
  InvoiceNumber: string;
  CustomerName?: string;
  TotalAmount: number | undefined;
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
interface ICommentInput {
  showInput: boolean;
  comment: string;
  isSubmitting: boolean;
}

// Helper function to format currency
const formatCurrency = (amount: number | undefined): string => {
  if (amount === null ||amount === undefined) return '$0.00';
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
  const [selectedInvoice, setSelectedInvoice] = React.useState<IInvoice | undefined>(undefined);
  const [invoiceToDelete, setInvoiceToDelete] = React.useState<IInvoice  | undefined>(undefined);

  // Add new state variables at the top with other states
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  const [itemComments, setItemComments] = React.useState<ICommentInfo[]>([]);

  const [loadingComments, setLoadingComments] = React.useState(false);
  // Add this new state in the InvoiceHub component
  const [commentInput, setCommentInput] = React.useState<ICommentInput>({
    showInput: false,
    comment: '',
    isSubmitting: false
  });

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

  //Create a function to fetch comments
  const fetchComments = async (itemId: number): Promise<void> => {
    try {
      setLoadingComments(true);
      console.log('Fetching comments for item ID:', itemId);
  
      const sp = spfi().using(SPFx(props.context));
      const commentInfo = await sp.web.lists.getByTitle(props.libraryName).items.getById(itemId).comments();
      console.log('Comment info:', commentInfo, commentInfo.length);
  
      if (commentInfo) {
        setItemComments(commentInfo);
      } else {
        setItemComments([]);
      }
  
    } catch (error) {
      console.error('Error fetching comments:', error);
      setItemComments([]);
    } finally {
      setLoadingComments(false);
    }
  };
// Add this new function to handle comment submission
  const handleCommentSubmit = async (): Promise<void> => {
    if (!selectedInvoice || !commentInput.comment.trim()) return;

    try {
      setCommentInput(prev => ({ ...prev, isSubmitting: true }));
      
      // Initialize the SPFx context
      const sp = spfi().using(SPFx(props.context));
      
      // Add the comment to the item
      await sp.web.lists
        .getByTitle(props.libraryName)
        .items.getById(selectedInvoice.Id)
        .comments.add(commentInput.comment.trim());

      // Refresh comments
      await fetchComments(selectedInvoice.Id);
      
      // Clear the comment input
      setCommentInput(prev => ({
        ...prev,
        comment: '',
        isSubmitting: false
      }));

    } catch (error) {
      console.error('Error submitting comment:', error);
      setCommentInput(prev => ({ ...prev, isSubmitting: false }));
    }
  };
  // Add handlers for context menu actions
  // Update the handleEdit function
// 1. First, update the handleEdit function to ensure it sets the initial state correctly
const handleEdit = async (invoiceId: number): Promise<void> => {
  const invoice = filteredInvoices.find(inv => inv.Id === invoiceId);
  console.log('Invoice found:', invoice); // Debug log
  if (invoice) {    
    setSelectedInvoice(invoice);
    setSelectedStatus(invoice.Status);
    // Set comment input visibility based on the current status
    setCommentInput(prev => ({
      ...prev,
      showInput: invoice.Status === 'Follow-up Required',
      comment: '',
      isSubmitting: false
    }));
    setIsUpdateDialogOpen(true);
    // Fetch comments when dialog opens
    try {
      await fetchComments(invoiceId);
    } catch (error) {
      console.error('Error fetching comments in handleEdit:', error);
    } 
  }
};
// Update handleStatusChange
const handleStatusChange = (_event: unknown, data: { value: string }): void => {
  console.log('Status changed to:', data.value); // Debug log
  setSelectedStatus(data.value);
  // Show comment input if status is "Follow-up Required"
  setCommentInput(prev => ({
    ...prev,
    showInput: data.value === 'Follow-up Required',
    // Maintain existing comment if the status changes back to Follow-up Required
    comment: data.value === 'Follow-up Required' ? prev.comment : ''
  }));
};
// 5. Update the handleCloseUpdateDialog
const handleCloseUpdateDialog = (): void => {
  setIsUpdateDialogOpen(false);
  // Reset comment input state
  setCommentInput({
    showInput: false,
    comment: '',
    isSubmitting: false
  });
  // Delay the reset of other states
  setTimeout(() => {
    setSelectedInvoice(undefined);
    setSelectedStatus('');
    setItemComments([]); // Clear comments
  }, 100);
};

const handleStatusSave = async (): Promise<void> => {
  try {
    setIsSaving(true);
    if (selectedInvoice) {
      await props.sp.web.lists
        .getByTitle(props.libraryName)
        .items.getById(selectedInvoice.Id)
        .update({
          Status: selectedStatus
        });
      
      const comment = `Customer (${selectedInvoice.CustomerName}) - Invoice #${selectedInvoice.InvoiceNumber} status updated to  ${selectedStatus}.`
      
      await props.sp.web.lists
        .getByTitle(props.libraryName)
        .items.getById(selectedInvoice.Id)
        .comments.add(comment);
      
        // Refresh the list
      await refreshInvoices();
      handleCloseUpdateDialog();
    }
  } catch (error) {
    console.error('Error updating status:', error);
  } finally {
    setIsSaving(false);
  }
};
// Update useEffect to handle initial status
React.useEffect(() => {
  if (isUpdateDialogOpen && selectedInvoice) {
    const invoice = filteredInvoices.find(inv => inv.Id === selectedInvoice.Id);
    if (invoice) {
      console.log('Setting initial status:', invoice.Status); // Debug log
      setSelectedStatus(invoice.Status);

      // Set comment input visibility based on the current status
      setCommentInput(prev => ({
        ...prev,
        showInput: invoice.Status === 'Follow-up Required',
      }));
    }
  }
}, [isUpdateDialogOpen, selectedInvoice]);

// Add dialog close handler
const handleCloseDialog = (): void => {
  //setIsDeleteDialogOpen(false);
  setInvoiceToDelete(undefined);
};

  // Update the delete handler
  const handleDelete = (invoiceId: number): void => {
    const invoice = filteredInvoices.find(inv => inv.Id === invoiceId);
    if (invoice) {
      setInvoiceToDelete(invoice);
    }
  };
 // Add confirm delete handler
const handleConfirmDelete = async (): Promise<void> => {
  try {
    if (invoiceToDelete) {
      await props.sp.web.lists
        .getByTitle(props.libraryName)
        .items.getById(invoiceToDelete.Id)
        .delete();
      
      // Refresh the list
      await refreshInvoices();
      
      // Clear selection if deleted item was selected
      if (selectedInvoice?.Id === invoiceToDelete.Id) {
        setSelectedInvoice(undefined);
      }
    }
  } catch (error) {
    console.error('Error deleting invoice:', error);
  } finally {
    //setIsDeleteDialogOpen(false);
    //setInvoiceToDelete(undefined);
    handleCloseDialog();
  }
};
  const handleEditStatus = (): void => {
    // Implement status edit functionality
    console.log('Edit status for invoice:', selectedInvoice?.Id);
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
    //{ columnKey: "radio", label: "", width: '20px' },
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
          { selectedInvoice? (              
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
        {filteredInvoices.map((invoice) => (
            <InvoiceTableRow
              key={invoice.Id}
              invoice={invoice}
              isSelected={selectedInvoice?.Id === invoice.Id}
              onEdit={handleEdit}
              onDelete={handleDelete}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          ))}
          <TableRow>
            {/* <TableCell className={styles.iconCell} /> */}
            <TableCell className={styles.iconCell} />
            <TableCell className={styles.iconCell} />
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
    <DeleteInvoiceDialog 
      isOpen={!!invoiceToDelete}
      invoiceToDelete={invoiceToDelete}
      onClose={handleCloseDialog}
      onConfirmDelete={handleConfirmDelete}
      formatCurrency={formatCurrency}
      formatDate={formatDate}
    />
    <UpdateInvoiceDialog 
        isOpen={isUpdateDialogOpen}
        selectedInvoice={selectedInvoice}
        selectedStatus={selectedStatus}
        itemComments={itemComments}
        commentInput={commentInput}
        loadingComments={loadingComments}
        isSaving={isSaving}
        statusOptions={STATUS_OPTIONS}
        onClose={handleCloseUpdateDialog}
        onStatusChange={handleStatusChange}
        onCommentChange={(comment: string) => setCommentInput(prev => ({
          ...prev,
          comment
        }))}
        onCommentSubmit={handleCommentSubmit}
        onStatusSave={handleStatusSave}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
  </FluentProvider>
);
};

export default InvoiceHub;
