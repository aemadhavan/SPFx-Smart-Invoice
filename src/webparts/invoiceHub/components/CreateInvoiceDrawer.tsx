import * as React from 'react';
import {
  OverlayDrawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  DrawerFooter,
  Button,
  Input,
  //Label,
  //Textarea,
  makeStyles,
  tokens,
  //Dropdown,
  //Option,
  Field,
  FluentProvider,
  webLightTheme,
} from '@fluentui/react-components';
import { Add24Regular, Dismiss24Regular } from '@fluentui/react-icons';
import { SPFI } from "@pnp/sp";
import { useInvoiceConfig } from '../hooks/useInvoiceConfig';
import { generateInvoicePDF } from './GenerateInvoicePDF';
import {ICustomer, manageCustomer} from '../hooks/useCustomer'

interface ICreateInvoiceDrawerProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (data: IInvoiceFormData) => void;
  sp: SPFI;
  invoiceLibraryName:string;
  customerListName:string;
}
// Add this interface to your existing interfaces
interface IInvoiceItem {
  id: string;
  description: string;
  amount: number;
}

export interface IInvoiceFormData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  // Company Details
  companyName: string;
  streetAddress: string;
  suburb: string;
  city: string;
  phone: string;
  email: string;
  gst: string;
  // Customer Details
  customerName: string;
  customerStreetAddress: string;
  customerSuburb: string;
  customerCity: string;
  customerPostalCode: string;
  customerPhone: string;
  customerEmail: string;
  // Invoice Items
  items: IInvoiceItem[]; 
  // Bank Details
  bankName: string;
  accountNumber: string;
}

const useStyles = makeStyles({
  drawer: {
    '.fui-DrawerBody': {
      padding: '20px',
    }
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    //gap: '20px',
  },
  labelTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: tokens.colorNeutralForeground2,
    marginBottom: '4px',
  },
  labelText: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
    padding: '5px 0',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  invoiceDetails: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '16px',
    //marginBottom: '24px',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  section: {
    //marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    //marginBottom: '16px',
  },
  itemsSection: {
    margin: '24px 0',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  itemRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr auto',
    gap: '16px',
    alignItems: 'start',
    //marginBottom: '16px',
    padding: '8px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    }
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  },
  totalsSection: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '8px',
    maxWidth: '300px',
    marginLeft: 'auto',
  },
  totalsLabel: {
    textAlign: 'right',
    paddingRight: '16px',
  },
  totalsAmount: {
    textAlign: 'right',
    minWidth: '100px', // Ensure consistent width for amounts
  },
  boldText: {
    fontWeight: 'bold',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    padding: '16px',
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  headerTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
  },
  closeButton: {
    cursor: 'pointer',
    color: tokens.colorNeutralForeground3,
    '&:hover': {
      color: tokens.colorNeutralForeground2,
    },
  }
});
// Function to get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  const today = new Date();
  return today.toLocaleDateString('en-CA');//.split('T')[0];
};
// Function to format date for input (YYYY-MM-DD)
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
// Function to get date 7 days from today in YYYY-MM-DD format
const getDueDate = (invoiceDate:string): string => {
  const date = new Date(invoiceDate);
  date.setDate(date.getDate() + 7);
  return formatDateForInput(date);//.split('T')[0];
};

export const CreateInvoiceDrawer: React.FC<ICreateInvoiceDrawerProps> = (props) => {
  const { isOpen, onDismiss, onSubmit, sp, invoiceLibraryName, customerListName } = props;
  const styles = useStyles();
  // Initialize dates once when drawer opens
  const [initialDates] = React.useState(() => {
    const today = getTodayDate();
    return {
      invoiceDate: today,
      dueDate: getDueDate(today)
    };
  });

  const [formData, setFormData] = React.useState<IInvoiceFormData>({
    invoiceNumber: '',
    invoiceDate:  initialDates.invoiceDate,
    dueDate:  initialDates.dueDate,
    companyName: 'Accounting House (Akl) Limited',
    streetAddress: '65, Mc Fadzean Drive',
    suburb: 'Blockhouse Bay',
    city: 'Auckland, 0600',
    phone: 'Tel: 09 - 627 0343',
    email: 'gru@xtra.co.nz',
    gst: '083-800-240',
    customerName: '',
    customerStreetAddress: '',
    customerSuburb: '',
    customerCity: '',
    customerPostalCode: '',
    customerPhone: '',
    customerEmail: '',
    items: [{
      id: '1',
      description: '',
      amount: 0
    }],
    bankName: 'ANZ New Lynn',
    accountNumber: '01-0186-0460792-00',
  });

  // Use the new invoice config hook
const {
  invoiceNumber,
  isLoading,
  error,
  getInvoiceNumber,
  incrementInvoiceNumber
} = useInvoiceConfig(sp);

// Update formData when invoiceNumber changes
React.useEffect(() => {
  if (invoiceNumber) {
    setFormData(prev => ({ ...prev, invoiceNumber }));
  }
}, [invoiceNumber]);
// Load invoice number when drawer opens
React.useEffect(() => {
  if (isOpen) {
    getInvoiceNumber();
  }
}, [isOpen, getInvoiceNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First, manage customer data
    if (formData.customerEmail) {  // Only proceed if email is provided
      const customerData: ICustomer = {
        CustomerName: formData.customerName,
        StreetAddress: formData.customerStreetAddress,
        Suburb: formData.customerSuburb,
        City: formData.customerCity,
        Pin: formData.customerPostalCode,
        Email: formData.customerEmail,
        Phone: formData.customerPhone,
        Status: 'Active'
      };

      await manageCustomer(sp, customerData,customerListName);
    }
      // First, generate and upload PDF
      await generateInvoicePDF(formData, sp,invoiceLibraryName);
      await incrementInvoiceNumber();
      onSubmit(formData);
      
    } catch (err) {
      console.error('Error submitting invoice:', err);
      // Handle error appropriately
    }
  };
  // Updated date change handler
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'invoiceDate') {
      const newDueDate = getDueDate(value);
      setFormData(prev => ({
        ...prev,
        invoiceDate: value,
        dueDate: newDueDate
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
     const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
   };
    
   // Add function to handle item changes
  const handleItemChange = (id: string, field: 'description' | 'amount', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id 
          ? { ...item, [field]: value }
          : item
      )
    }));
  };

 // Add function to add new item
  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now().toString(), // Simple way to generate unique id
          description: '',
          amount: 0
        }
      ]
    }));
  };
     // Add function to remove item
  const handleRemoveItem = (id: string) => {
    if (formData.items.length === 1) return; // Prevent removing last item
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };
  

  //const handleCustomerChange = (_: any, data: { value: string }) => {
  //  setFormData(prev => ({ ...prev, customer: data.value }));
  //};
  // Update total calculations
  const calculateSubTotal = (): number => {
    return formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const calculateGST = (): number => {
    return calculateSubTotal() * 0.15;
  };

  const calculateTotal = (): number => {
    return calculateSubTotal() + calculateGST();
  };
// Show loading state
if (isLoading && !formData.invoiceNumber) {
  return <div>Loading...</div>;
}

// Show error state
if (error) {
  return <div>Error loading invoice number: {error.message}</div>;
}

  return (
    <FluentProvider theme={webLightTheme}>
        <OverlayDrawer
              open={isOpen}
              position="end"
              className={styles.drawer}
              style={{ width: '700px' }}>
            
              <DrawerHeader className={styles.header}>
                <DrawerHeaderTitle action={<Button appearance='subtle' aria-label='Close' icon={<Dismiss24Regular/>} onClick={onDismiss}/>}>Create New Invoice</DrawerHeaderTitle>
              </DrawerHeader>
              
              <DrawerBody>
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.invoiceDetails}>
                    <Field label="Invoice Number" required className={styles.formField}>
                      <Input name="invoiceNumber" value={formData.invoiceNumber} onChange={handleInputChange} required readOnly/>
                    </Field>
                    <Field label="Invoice Date" required>
                      <Input name="invoiceDate" type="date" value={formData.invoiceDate} onChange={handleDateChange} required />                
                    </Field>
                    <Field label="Due Date" required>
                      <Input name="dueDate" type="date" value={formData.dueDate} onChange={handleDateChange} required />                
                    </Field>
                  </div>
                  <div className={styles.gridContainer}>
                    <div className={styles.section}>
                      <h3 className={styles.sectionTitle}>Company Details</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap:'5px' }}>
                          <div>{formData.companyName}</div>
                          <div>{formData.streetAddress} </div>
                          <div>{formData.suburb}</div>
                          <div>{formData.city}</div>
                          <div>{formData.phone}</div>
                          <div>{formData.email} </div>
                          <div>{formData.gst}</div>
                      </div>
                    </div>
                    <div className={styles.section}>
                      <h3 className={styles.sectionTitle}>Customer Details</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap:'2px'}}>
                          <Input name="customerName" value={formData.customerName} onChange={handleInputChange} placeholder='Customer Name' />
                          <Input name="customerStreetAddress" value={formData.customerStreetAddress} onChange={handleInputChange} placeholder='Street Address' />
                          <Input name="customerSuburb" value={formData.customerSuburb} onChange={handleInputChange} placeholder='Suburb' />
                          <Input name="customerCity" value={formData.customerCity} onChange={handleInputChange} placeholder='City' />
                          <Input name="customerPostalCode" value={formData.customerPostalCode} onChange={handleInputChange} placeholder='Postal Code'/>
                          <Input name="customerPhone" value={formData.customerPhone} onChange={handleInputChange} placeholder='Phone' />          
                          <Input name="customerEmail" value={formData.customerEmail} onChange={handleInputChange} placeholder='Email'/>
                      </div>
                    </div>
                  </div>
                  {/* Invoice Items Section */}
                  <div className={styles.itemsSection}>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>Invoice Items</h3>
                      <Button 
                        icon={<Add24Regular />}
                        onClick={handleAddItem}
                        appearance="transparent"
                      >
                        Add Item
                      </Button>
                    </div>

                    {formData.items.map((item) => (
                      <div key={item.id} className={styles.itemRow}>
                      <Field label="Description" required>
                        <Input
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        />
                      </Field>
                      <Field label="Amount (NZ$)" required>
                        <Input
                          type="number"
                          value={item.amount.toString()}
                          onChange={(e) => handleItemChange(item.id, 'amount', Number(e.target.value) || 0)}
                        />
                      </Field>
                      {formData.items.length > 1 && (
                        <Button 
                          icon={<Dismiss24Regular />}
                          appearance="transparent"
                          style={{ marginTop: '24px' }}
                          onClick={() => handleRemoveItem(item.id)}
                        />
                      )}
                    </div>
                    ))}
                  </div>
                  {/* Totals */}
                  <div className={styles.totalsSection}>
                    <div className={styles.totalsLabel}>Total exclusive of GST:</div>
                    <div className={styles.totalsAmount}>${calculateSubTotal().toFixed(2)}</div>            
                    <div className={styles.totalsLabel}>GST (15%):</div>
                    <div className={styles.totalsAmount}>${calculateGST().toFixed(2)}</div>            
                    <div className={`${styles.totalsLabel} ${styles.boldText}`}>Total inclusive of GST:</div>
                    <div className={`${styles.totalsAmount} ${styles.boldText}`}>${calculateTotal().toFixed(2)}</div>
                  </div>
                  {/* Bank Details */}
                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Bank Account Details</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>              
                        <div>{formData.bankName}</div>              
                        <div>{formData.accountNumber}</div>              
                    </div>
                  </div>
                </form>
              </DrawerBody>

              <DrawerFooter className={styles.footer}>
                <Button appearance="secondary" onClick={onDismiss}>Cancel</Button>
                <Button appearance="primary" onClick={handleSubmit}>Create Invoice</Button>
              </DrawerFooter>
        </OverlayDrawer>
    </FluentProvider>
    
  );
};