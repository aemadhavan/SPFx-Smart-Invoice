import * as React from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  makeStyles,
  tokens,
  DialogOpenChangeEvent,
  FluentProvider,
  webLightTheme,
} from '@fluentui/react-components';
import type { IInvoice } from './InvoiceHub';
//import type { WebPartContext } from '@microsoft/sp-webpart-base';

// Define styles
const useStyles = makeStyles({
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
});

interface DeleteInvoiceDialogProps {
  isOpen: boolean;
  invoiceToDelete?: IInvoice;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
  formatCurrency: (amount: number | undefined) => string;
  formatDate: (date: string) => string;
}

export const DeleteInvoiceDialog: React.FC<DeleteInvoiceDialogProps> = ({
  isOpen,
  invoiceToDelete,
  onClose,
  onConfirmDelete,
  formatCurrency,
  formatDate,
}) => {
  const styles = useStyles();

  const handleOpenChange = (_: DialogOpenChangeEvent, data: { open: boolean }): void => {
    if (!data.open) {
      onClose();
    }
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <div className={styles.dialogContent}>
              <p>Are you sure you want to delete this invoice? This action cannot be undone.</p>
              {invoiceToDelete && (
                <div className={styles.invoiceInfoSection}>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Invoice Number</span>
                      <span className={styles.infoValue}>
                        {invoiceToDelete.InvoiceNumber || '-'}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Customer Name</span>
                      <span className={styles.infoValue}>
                        {invoiceToDelete.CustomerName || '-'}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Invoice Date</span>
                      <span className={styles.infoValue}>
                        {formatDate(invoiceToDelete.InvoiceDate || '')}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Total Amount</span>
                      <span className={styles.infoValue}>
                        {formatCurrency(invoiceToDelete.TotalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>Cancel</Button>
            <Button appearance="primary" onClick={onConfirmDelete}>Delete</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
    </FluentProvider>
    
  );
};

export default DeleteInvoiceDialog;