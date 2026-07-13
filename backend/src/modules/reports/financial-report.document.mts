import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

export type FinancialReportTransaction = {
  date: Date;
  type: 'income' | 'expense';
  category: {
    name: string;
  };
  amountCents: number;
  note: string | null;
};

export type FinancialReportSummary = {
  totalIncomeCents: number;
  totalExpenseCents: number;
  savingsCents: number;
  transactionCount: number;
};

export type FinancialReportPeriod = {
  label: string;
  startDate?: Date | null;
  endDate?: Date | null;
};

export type FinancialReportDocumentProps = {
  transactions: FinancialReportTransaction[];
  summary: FinancialReportSummary;
  period: FinancialReportPeriod;
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    color: '#172033',
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    marginBottom: 6,
    fontFamily: 'Helvetica-Bold',
  },
  period: {
    color: '#667085',
    marginBottom: 22,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  summaryCard: {
    flexGrow: 1,
    padding: 12,
    border: '1px solid #d0d5dd',
  },
  summaryLabel: {
    color: '#667085',
    fontSize: 8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottom: '1px solid #98a2b3',
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    borderBottom: '1px solid #eaecf0',
  },
  dateCell: {
    width: '16%',
  },
  typeCell: {
    width: '14%',
    textTransform: 'capitalize',
  },
  categoryCell: {
    width: '22%',
  },
  noteCell: {
    width: '28%',
    color: '#475467',
  },
  amountCell: {
    width: '20%',
    textAlign: 'right',
  },
  emptyState: {
    paddingVertical: 24,
    color: '#667085',
    textAlign: 'center',
  },
});

export function FinancialReportDocument({
  transactions,
  summary,
  period,
}: FinancialReportDocumentProps) {
  return (
    <Document title="Financial Report" author="Personal Finance">
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Financial Report</Text>
        <Text style={styles.period}>{formatPeriod(period)}</Text>

        <View style={styles.summaryRow}>
          <SummaryCard label="Income" value={formatAmount(summary.totalIncomeCents)} />
          <SummaryCard
            label="Expenses"
            value={formatAmount(summary.totalExpenseCents)}
          />
          <SummaryCard label="Savings" value={formatAmount(summary.savingsCents)} />
          <SummaryCard
            label="Transactions"
            value={summary.transactionCount.toString()}
          />
        </View>

        <View style={styles.tableHeader} fixed>
          <Text style={styles.dateCell}>Date</Text>
          <Text style={styles.typeCell}>Type</Text>
          <Text style={styles.categoryCell}>Category</Text>
          <Text style={styles.noteCell}>Note</Text>
          <Text style={styles.amountCell}>Amount</Text>
        </View>

        {transactions.length === 0 ? (
          <Text style={styles.emptyState}>No transactions found for this period.</Text>
        ) : (
          transactions.map((transaction, index) => (
            <View
              key={`${transaction.date.toISOString()}-${index}`}
              style={styles.tableRow}
              wrap={false}
            >
              <Text style={styles.dateCell}>{formatDate(transaction.date)}</Text>
              <Text style={styles.typeCell}>{transaction.type}</Text>
              <Text style={styles.categoryCell}>{transaction.category.name}</Text>
              <Text style={styles.noteCell}>{transaction.note ?? ''}</Text>
              <Text style={styles.amountCell}>
                {formatAmount(transaction.amountCents)}
              </Text>
            </View>
          ))
        )}
      </Page>
    </Document>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function formatPeriod(period: FinancialReportPeriod) {
  const range =
    period.startDate || period.endDate
      ? ` (${period.startDate ? formatDate(period.startDate) : 'start'} to ${
          period.endDate ? formatDate(period.endDate) : 'end'
        })`
      : '';

  return `${period.label}${range}`;
}

function formatAmount(amountCents: number) {
  return `$${(amountCents / 100).toFixed(2)}`;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
