import * as React from 'react';
import {
  TableRow,
  TableCell,
  Button,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  makeStyles,
  tokens,
  
  //FluentProvider,
  //webLightTheme
} from '@fluentui/react-components';
import {
  Document24Regular,
  MoreHorizontalRegular,
  EditRegular,
  DeleteRegular
} from '@fluentui/react-icons';
import { IInvoice } from './InvoiceHub';

// Define styles
const useStyles = makeStyles({
  tableRow: {
    position: 'relative',
    transition: 'background-color 0.2s ease-in-out',
    height: '40px',
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
  moreCell: {
    width: '20px',
    padding: '0 4px',
    position: 'relative',
  },
  moreContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
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
  tableCell: {
    padding: '8px',
    verticalAlign: 'middle',
  },
  tableCellAmount: {
    padding: '8px 12px',
    textAlign: 'right',
  },
  link: {
    color: '#0066cc',
    textDecoration: 'none',
    padding: '8px 0',
    display: 'block',
    '&:hover': {
      textDecoration: 'underline'
    },    
  },
});

interface InvoiceTableRowProps {
  invoice: IInvoice;
  isSelected: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  formatCurrency: (amount: number | undefined) => string;
  formatDate: (date: string) => string;
}

export const InvoiceTableRow: React.FC<InvoiceTableRowProps> = ({
  invoice,
  isSelected,
  onEdit,
  onDelete,
  formatCurrency,
  formatDate
}) => {
  const styles = useStyles();

  return (
    <TableRow 
    key={invoice.Id} 
    className={`${styles.tableRow} ${styles.hoverRow} ${isSelected ? styles.selectedRow : ''}`}
  >
    <TableCell className={styles.moreCell}>
      <div className={styles.moreContainer}>
        <Menu>
          <MenuTrigger>
            <Button
              appearance="subtle"
              icon={<MoreHorizontalRegular />}
              aria-label="More options"
              style={{
                minWidth: '28px',
                padding: '4px'
              }}
            />
          </MenuTrigger>
          <MenuPopover>
            <MenuList style={{ minWidth: '120px', padding: '4px 0' }}>
              <MenuItem 
                onClick={() => onEdit(invoice.Id)}
                style={{ padding: '6px 12px' }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  width: '100%' 
                }}>
                  <EditRegular style={{ fontSize: '16px' }} />
                  <span>Update</span>
                </div>
              </MenuItem>
              <MenuItem 
                onClick={() => onDelete(invoice.Id)}
                style={{ padding: '6px 12px' }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  width: '100%' 
                }}>
                  <DeleteRegular style={{ fontSize: '16px' }} />
                  <span>Delete</span>
                </div>
              </MenuItem>
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

export default InvoiceTableRow;