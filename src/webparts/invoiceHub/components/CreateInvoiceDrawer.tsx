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
} from '@fluentui/react-components';
import { Add24Regular, Dismiss24Regular } from '@fluentui/react-icons';

interface ICreateInvoiceDrawerProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (data: IInvoiceFormData) => void;
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
  description: string;
  amount: number;
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
    marginBottom: '24px',
  },
  itemRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr auto',
    gap: '16px',
    alignItems: 'start',
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

export const CreateInvoiceDrawer: React.FC<ICreateInvoiceDrawerProps> = (props) => {
  const { isOpen, onDismiss, onSubmit } = props;
  const styles = useStyles();
  const [formData, setFormData] = React.useState<IInvoiceFormData>({
    invoiceNumber: 'AHL-0116/2024',
    invoiceDate: '',
    dueDate: '',
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
    description: '',
    amount: 0,
    bankName: 'ANZ New Lynn',
    accountNumber: '01-0186-0460792-00',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
     const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
   };

  //const handleCustomerChange = (_: any, data: { value: string }) => {
  //  setFormData(prev => ({ ...prev, customer: data.value }));
  //};
  const calculateGST = (amount: number): number => {
    return amount * 0.15;
  };

  const calculateTotal = (amount: number): number => {
    return amount + calculateGST(amount);
  };

  return (
    <OverlayDrawer
      open={isOpen}
      position="end"
      className={styles.drawer}
      style={{ width: '900px' }}>
    
      <DrawerHeader className={styles.header}>
        <DrawerHeaderTitle action={<Button appearance='subtle' aria-label='Close' icon={<Dismiss24Regular/>} onClick={onDismiss}/>}>Create New Invoice</DrawerHeaderTitle>
      </DrawerHeader>
      
      <DrawerBody>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.invoiceDetails}>
            <Field label="Invoice Number" required className={styles.formField}>
              <Input name="invoiceNumber" value={formData.invoiceNumber} onChange={handleInputChange} required />
            </Field>
            <Field label="Invoice Date" required>
              <Input name="invoiceDate" type="date" value={formData.invoiceDate} onChange={handleInputChange} required />                
            </Field>
            <Field label="Due Date" required>
              <Input name="dueDate" type="date" value={formData.dueDate} onChange={handleInputChange} required />                
            </Field>
          </div>
          <div className={styles.gridContainer}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Company Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap:'5px' }}>
                  <Input name="companyName" value={formData.companyName} readOnly />
                  <Input name="streetAddress" value={formData.streetAddress} readOnly />
                  <Input name="suburb" value={formData.suburb} readOnly />
                  <Input name="city" value={formData.city} readOnly />
                  <Input name="phone" value={formData.phone} readOnly />
                  <Input name="email" value={formData.email} readOnly />
                  <Input name="gst" value={formData.gst} readOnly />
              </div>
            </div>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Customer Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap:'5px'}}>
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
          {/* Invoice Items */}
          <div className={styles.itemsSection}>
            <h3 className={styles.sectionTitle}>Invoice Items</h3>
            <div className={styles.itemRow}>
              <Field label="Description" required>
                <Input
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </Field>
              <Field label="Amount (NZ$)" required>
                <Input
                  name="amount"
                  type="number"
                  //value={formData.amount}
                  onChange={handleInputChange}
                />
              </Field>
              <Button 
                icon={<Add24Regular />}
                style={{ marginTop: '24px' }}
              >
                Add Item
              </Button>
            </div>
          </div>
          {/* Totals */}
          <div className={styles.totalsSection}>
            <div>Total exclusive of GST:</div>
            <div>${formData.amount}</div>
            <div>GST (15%):</div>
            <div>${calculateGST(formData.amount)}</div>
            <div style={{ fontWeight: 'bold' }}>Total inclusive of GST:</div>
            <div style={{ fontWeight: 'bold' }}>${calculateTotal(formData.amount)}</div>
          </div>
           {/* Bank Details */}
           <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Bank Account Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Field label="Bank Name">
                <Input name="bankName" value={formData.bankName} readOnly />
              </Field>
              <Field label="Account Number">
                <Input name="accountNumber" value={formData.accountNumber} readOnly />
              </Field>
            </div>
          </div>
        </form>
      </DrawerBody>

      <DrawerFooter className={styles.footer}>
        <Button appearance="secondary" onClick={onDismiss}>Cancel</Button>
        <Button appearance="primary" onClick={handleSubmit}>Create Invoice</Button>
      </DrawerFooter>
    </OverlayDrawer>
  );
};