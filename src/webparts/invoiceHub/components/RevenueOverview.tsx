import * as React from 'react';
import { useMemo } from 'react';
import {
  Card,
  Title3,
  Body1,
  makeStyles,
  tokens,
  //PresenceBadgeStatus,
  //Badge,
} from '@fluentui/react-components';
import {
  DocumentRegular,
  DocumentMultipleRegular,
  MoneyRegular,
} from '@fluentui/react-icons';
import { IInvoice } from './InvoiceHub';
import * as _ from 'lodash';

const useStyles = makeStyles({
  container: {
    marginBottom: '24px',
  },
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '20px',
  },
  card: {
    padding: '20px',
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '8px',
  },
  cardContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  },
  cardIcon: {
    padding: '12px',
    backgroundColor: tokens.colorBrandBackground2,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    color: tokens.colorNeutralForeground2,
    marginBottom: '8px',
    fontSize: '14px',
  },
  cardValue: {
    color: tokens.colorNeutralForeground1,
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
  },
  graphContainer: {
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '8px',
    padding: '20px',
  },
  graphTitle: {
    marginBottom: '16px',
    color: tokens.colorNeutralForeground1,
  },
  monthlyDataGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gap: '8px',
    marginTop: '16px',
  },
  barContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  bar: {
    width: '100%',
    backgroundColor: tokens.colorBrandBackground,
    borderRadius: '4px 4px 0 0',
    minHeight: '4px',
    transition: 'height 0.3s ease',
  },
  monthLabel: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
    textAlign: 'center',
  },
  valueLabel: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
    textAlign: 'center',
    writingMode: 'vertical-rl',
    transform: 'rotate(180deg)',
    height: '60px',
  }
});

interface IMonthlyData {
    month: string;
    revenue: number;
  }

interface IRevenueOverviewProps {
  invoices: IInvoice[];
  formatCurrency: (amount: number | undefined) => string;
}

interface ITotals {
    totalRevenue: number;
    totalInvoices: number;
    unpaidInvoices: number;
  }

  
const RevenueOverview: React.FC<IRevenueOverviewProps> = ({ invoices, formatCurrency }) => {
  const styles = useStyles();
  const currentYear = new Date().getFullYear();

  // Calculate monthly revenue data
  const monthlyData = useMemo(() => {
    const thisYearInvoices = invoices.filter(invoice => {
      const invoiceYear = new Date(invoice.InvoiceDate).getFullYear();
      return invoiceYear === currentYear;
    });

    const groupedByMonth = _.groupBy(thisYearInvoices, (invoice: IInvoice) => 
      new Date(invoice.InvoiceDate).getMonth()
    );

    return Array.from({ length: 12 }, (_, month) => {
      const monthInvoices = groupedByMonth[month] || [];
      return {
        month: new Date(0, month).toLocaleString('default', { month: 'short' }),
        revenue: monthInvoices.reduce((sum:number, inv:IInvoice) => sum + (inv.TotalAmount || 0), 0)
      };
    });
  }, [invoices]);

  // Calculate max revenue for scaling
  const maxRevenue = Math.max(...monthlyData.map((d: IMonthlyData) => d.revenue));

  // Calculate totals for cards
  const totals: ITotals = useMemo(() => {
    const thisYearInvoices = invoices.filter((invoice: IInvoice) => 
      new Date(invoice.InvoiceDate).getFullYear() === currentYear
    );

    return {
      totalRevenue: thisYearInvoices.reduce(
        (sum: number, inv: IInvoice) => sum + (inv.TotalAmount || 0), 
        0
      ),
      totalInvoices: thisYearInvoices.length,
      unpaidInvoices: thisYearInvoices.filter((inv: IInvoice) => inv.Status !== 'Paid').length
    };
  }, [invoices]);

  return (
    <div className={styles.container}>
      <div className={styles.cardsContainer}>
        <Card className={styles.card}>
          <div className={styles.cardContent}>
            <div className={styles.cardIcon}>
              <MoneyRegular fontSize={24} />
            </div>
            <div className={styles.cardInfo}>
              <Title3 className={styles.cardTitle}>Total Revenue YTD</Title3>
              <Body1 className={styles.cardValue}>{formatCurrency(totals.totalRevenue)}</Body1>
            </div>
          </div>
        </Card>
        <Card className={styles.card}>
          <div className={styles.cardContent}>
            <div className={styles.cardIcon}>
              <DocumentRegular fontSize={24} />
            </div>
            <div className={styles.cardInfo}>
              <Title3 className={styles.cardTitle}>Count Invoices</Title3>
              <Body1 className={styles.cardValue}>{totals.totalInvoices}</Body1>
            </div>
          </div>
        </Card>
        <Card className={styles.card}>
          <div className={styles.cardContent}>
            <div className={styles.cardIcon}>
              <DocumentMultipleRegular fontSize={24} />
            </div>
            <div className={styles.cardInfo}>
              <Title3 className={styles.cardTitle}>Invoices Yet to Pay</Title3>
              <Body1 className={styles.cardValue}>{totals.unpaidInvoices}</Body1>
            </div>
          </div>
        </Card>
      </div>
      <div className={styles.graphContainer}>
        <Title3 className={styles.graphTitle}>Overview</Title3>
        <div style={{ position: 'relative', height: '300px', marginLeft: '40px' }}>
          <div className={styles.monthlyDataGrid} style={{ height: '100%' }}>
            {monthlyData.map((data) => (
              <div key={data.month} className={styles.barContainer}>
                <div 
                  className={styles.bar} 
                  style={{ 
                    height: `${(data.revenue / maxRevenue) * 100}%`,
                    marginTop: 'auto'
                  }}
                  title={formatCurrency(data.revenue)}
                />
                <div className={styles.monthLabel}>{data.month}</div>
              </div>
            ))}
          </div>
          <div 
            style={{ 
              position: 'absolute', 
              left: '-40px', 
              top: '50%', 
              transform: 'translateY(-50%)'
            }}
          >
            <div className={styles.valueLabel}>Revenue</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueOverview;