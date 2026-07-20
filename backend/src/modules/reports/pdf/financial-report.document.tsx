import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

export interface ReportData {
  period: {
    startDate: string;
    endDate: string;
    label: string;
  };
  user: {
    name: string;
    email: string;
  };
  summary: {
    totalIncomeCents: number;
    totalExpenseCents: number;
    savingsCents: number;
    savingsRate: string;
    transactionCount: number;
  };
  transactions: Array<{
    date: string;
    type: 'income' | 'expense';
    categoryName: string;
    amountCents: number;
    note: string | null;
  }>;
  generatedAt: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 12,
  },
  summaryLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: '8 10',
    borderRadius: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    padding: '7 10',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tableRowAlt: {
    backgroundColor: '#fafafa',
  },
  colDate: {
    width: '18%',
  },
  colCategory: {
    width: '22%',
  },
  colNote: {
    width: '35%',
    color: '#6b7280',
  },
  colType: {
    width: '12%',
  },
  colAmount: {
    width: '13%',
    textAlign: 'right',
  },
  incomeText: {
    color: '#16a34a',
  },
  expenseText: {
    color: '#dc2626',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#9ca3af',
  },
});

function formatCents(cents: number): string {
  const dollars = Math.abs(cents) / 100;
  const formatted = dollars.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `$${formatted}`;
}

export default function FinancialReportDocument({
  data,
}: {
  data: ReportData;
}) {
  return (
    <Document title={`Financial Report – ${data.period.label}`}>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Financial Report</Text>
          <Text style={styles.subtitle}>{data.period.label}</Text>
          <Text style={styles.subtitle}>
            Prepared for: {data.user.name} ({data.user.email})
          </Text>
        </View>

        {/* SUMMARY SECTION */}
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.summaryGrid}>
          {/* Card 1: Total Income */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={[styles.summaryValue, styles.incomeText]}>
              {formatCents(data.summary.totalIncomeCents)}
            </Text>
          </View>
          {/* Card 2: Total Expenses */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={[styles.summaryValue, styles.expenseText]}>
              {formatCents(data.summary.totalExpenseCents)}
            </Text>
          </View>
          {/* Card 3: Net Savings */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Net Savings</Text>
            <Text
              style={[
                styles.summaryValue,
                data.summary.savingsCents >= 0
                  ? styles.incomeText
                  : styles.expenseText,
              ]}
            >
              {formatCents(data.summary.savingsCents)}
            </Text>
          </View>
          {/* Card 4: Savings Rate */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Savings Rate</Text>
            <Text style={styles.summaryValue}>
              {data.summary.savingsRate}%
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: 9, color: '#6b7280', marginBottom: 4 }}>
          {data.summary.transactionCount} transactions in this period
        </Text>

        {/* TRANSACTIONS SECTION */}
        <Text style={styles.sectionTitle}>Transactions</Text>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.colDate}>Date</Text>
          <Text style={styles.colCategory}>Category</Text>
          <Text style={styles.colNote}>Note</Text>
          <Text style={styles.colType}>Type</Text>
          <Text style={styles.colAmount}>Amount</Text>
        </View>

        {/* Table Rows */}
        {data.transactions.map((tx, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              index % 2 === 1 ? styles.tableRowAlt : {},
            ]}
          >
            <Text style={styles.colDate}>{tx.date}</Text>
            <Text style={styles.colCategory}>{tx.categoryName}</Text>
            <Text style={styles.colNote}>{tx.note ?? '—'}</Text>
            <Text
              style={[
                styles.colType,
                tx.type === 'income' ? styles.incomeText : styles.expenseText,
              ]}
            >
              {tx.type === 'income' ? 'Income' : 'Expense'}
            </Text>
            <Text
              style={[
                styles.colAmount,
                tx.type === 'income' ? styles.incomeText : styles.expenseText,
              ]}
            >
              {tx.type === 'expense' ? '-' : ''}
              {formatCents(tx.amountCents)}
            </Text>
          </View>
        ))}

        {/* FOOTER — appears on every page */}
        <View style={styles.footer} fixed>
          <Text>Generated on {data.generatedAt}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
