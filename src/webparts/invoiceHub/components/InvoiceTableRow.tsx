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
  FluentProvider,
  webLightTheme,
  mergeClasses,
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
  menuButton: {
    minWidth: '28px',
    padding: '4px',
    margin: '0',
    height: '28px',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    }
  },
  menuList: {
    minWidth: '160px',
    padding: '4px 0',
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow4,
  },
  menuItem: {
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    color: tokens.colorNeutralForeground1,
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground2,
      color: tokens.colorNeutralForeground1Hover,
    }
  },
  menuItemContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
  },
  menuIcon: {
    fontSize: '16px',
    color: 'inherit',
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
    color: tokens.colorBrandForeground1,
    textDecoration: 'none',
    padding: '8px 0',
    display: 'block',
    '&:hover': {
      textDecoration: 'underline',
      color: tokens.colorBrandForegroundLinkHover,
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
      className={mergeClasses(
        styles.tableRow,
        styles.hoverRow,
        isSelected && styles.selectedRow
      )}
    >
      <TableCell className={styles.moreCell}>
        <FluentProvider theme={webLightTheme}>
          <div className={styles.moreContainer}>       
            <Menu>
              <MenuTrigger>
                <Button
                  appearance="subtle"
                  icon={<MoreHorizontalRegular />}
                  aria-label="More options"
                  className={styles.menuButton}
                />
              </MenuTrigger>

              <MenuPopover>
                <MenuList className={styles.menuList}>
                  <MenuItem
                    className={styles.menuItem}
                    onClick={() => onEdit(invoice.Id)}
                  >
                    <div className={styles.menuItemContent}>
                      <EditRegular className={styles.menuIcon} />
                      <span>Update</span>
                    </div>
                  </MenuItem>
                  <MenuItem
                    className={styles.menuItem}
                    onClick={() => onDelete(invoice.Id)}
                  >
                    <div className={styles.menuItemContent}>
                      <DeleteRegular className={styles.menuIcon} />
                      <span>Delete</span>
                    </div>
                  </MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </div>
        </FluentProvider>
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