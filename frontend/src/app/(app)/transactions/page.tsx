"use client";

import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { TransactionForm } from "@/components/forms/TransactionForm";
import { PageHeader } from "@/components/layouts/PageHeader";
import { Modal } from "@/components/ui/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import type {
  Transaction,
  TransactionFilters,
  TransactionType,
} from "@/lib/api/transactions";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { formatCurrency } from "@/lib/utils/currency";

const PAGE_SIZE = 10;

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterMonth, setFilterMonth] = useState<number | undefined>();
  const [filterYear, setFilterYear] = useState<number | undefined>();
  const [type, setType] = useState<"all" | TransactionType>("all");
  const [categoryId, setCategoryId] = useState("");
  const [formTransaction, setFormTransaction] = useState<Transaction | null>(
    null,
  );
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const filters = useMemo<TransactionFilters>(
    () => ({
      page,
      limit: PAGE_SIZE,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      month: filterMonth,
      year: filterYear,
      type: type === "all" ? undefined : type,
      categoryId: categoryId || undefined,
    }),
    [categoryId, endDate, filterMonth, filterYear, page, startDate, type],
  );

  const { data, isLoading, isFetching } = useTransactions(filters);
  const transactions = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  const categories = useMemo(() => {
    const uniqueCategories = new Map<string, string>();

    transactions.forEach((transaction) => {
      uniqueCategories.set(transaction.category.id, transaction.category.name);
    });

    if (categoryId && !uniqueCategories.has(categoryId)) {
      uniqueCategories.set(categoryId, "Selected category");
    }

    return Array.from(uniqueCategories, ([id, name]) => ({ id, name }));
  }, [categoryId, transactions]);

  function resetPage<T>(setter: (value: T) => void, value: T) {
    setPage(1);
    setter(value);
  }

  function openAddModal() {
    setFormTransaction(null);
    setIsFormModalOpen(true);
  }

  function openEditModal(transaction: Transaction) {
    setFormTransaction(transaction);
    setIsFormModalOpen(true);
  }

  function closeFormModal() {
    setIsFormModalOpen(false);
    setFormTransaction(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Transactions"
          description="Review and filter your income and expenses."
        />
        <button
          type="button"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-3xl bg-[#9fe870] px-5 text-sm font-semibold text-[#0e0f0c] transition hover:bg-[#cdffad]"
          onClick={openAddModal}
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add Transaction
        </button>
      </div>

      <section className="rounded-3xl bg-white p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-[#454745]">Show period</span>
            <select value={filterMonth ?? ""} className="h-11 w-full rounded-xl border border-[#0e0f0c] bg-white px-4 text-sm" onChange={(event) => resetPage(setFilterMonth, event.target.value ? Number(event.target.value) : undefined)}>
              <option value="">All months</option>
              {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-[#454745]">Year</span>
            <select value={filterYear ?? ""} className="h-11 w-full rounded-xl border border-[#0e0f0c] bg-white px-4 text-sm" onChange={(event) => resetPage(setFilterYear, event.target.value ? Number(event.target.value) : undefined)}>
              <option value="">All years</option>
              {Array.from({ length: 6 }, (_, index) => new Date().getFullYear() - index).map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-[#454745]">
              Start date
            </span>
            <input
              type="date"
              value={startDate}
              className="h-11 w-full rounded-xl border border-[#0e0f0c] px-4 text-sm text-[#0e0f0c] outline-none transition focus:ring-2 focus:ring-[#9fe870]"
              onChange={(event) => resetPage(setStartDate, event.target.value)}
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-[#454745]">End date</span>
            <input
              type="date"
              value={endDate}
              className="h-11 w-full rounded-xl border border-[#0e0f0c] px-4 text-sm text-[#0e0f0c] outline-none transition focus:ring-2 focus:ring-[#9fe870]"
              onChange={(event) => resetPage(setEndDate, event.target.value)}
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-[#454745]">Type</span>
            <select
              value={type}
              className="h-11 w-full rounded-xl border border-[#0e0f0c] bg-white px-4 text-sm text-[#0e0f0c] outline-none transition focus:ring-2 focus:ring-[#9fe870]"
              onChange={(event) =>
                resetPage(
                  setType,
                  event.target.value as "all" | TransactionType,
                )
              }
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-[#454745]">Category</span>
            <select
              value={categoryId}
              className="h-11 w-full rounded-xl border border-[#0e0f0c] bg-white px-4 text-sm text-[#0e0f0c] outline-none transition focus:ring-2 focus:ring-[#9fe870]"
              onChange={(event) => resetPage(setCategoryId, event.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {isLoading ? (
        <TransactionTableSkeleton />
      ) : transactions.length === 0 ? (
        <EmptyState />
      ) : (
        <Table aria-busy={isFetching}>
          <TableHeader>
            <TableRow>
              <TableHead title="The month and year this transaction is attributed to">Period</TableHead>
              <TableHead title="Date money was physically received or paid">Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{new Date(transaction.transactionYear, transaction.transactionMonth - 1, 1).toLocaleString("en-US", { month: "short", year: "numeric" })}</TableCell>
                <TableCell><span className="text-xs text-[#868685]">{new Date(transaction.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                      backgroundColor: transaction.category.color ?? "#868685",
                      }}
                    />
                    <span className="font-semibold text-[#0e0f0c]">
                      {transaction.category.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[280px] truncate">
                  {transaction.note || "No note"}
                </TableCell>
                <TableCell
                  className={
                    transaction.type === "income"
                      ? "text-right font-semibold text-[#054d28]"
                      : "text-right font-semibold text-[#a7000d]"
                  }
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amountCents)}
                </TableCell>
                <TableCell>
                  <span className="rounded-full bg-[#e8ebe6] px-3 py-1 text-xs font-semibold capitalize text-[#454745]">
                    {transaction.type}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      aria-label="Edit transaction"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#454745] transition hover:bg-[#e8ebe6] hover:text-[#0e0f0c]"
                      onClick={() => openEditModal(transaction)}
                    >
                      <Pencil aria-hidden="true" className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete transaction"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#454745] transition hover:bg-[#320707] hover:text-white"
                    >
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex flex-col gap-3 rounded-3xl bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#454745]">
          Page {page} of {totalPages} · {total} total transactions
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!canGoPrevious}
            className="inline-flex h-10 items-center gap-2 rounded-3xl border border-[#0e0f0c] px-4 text-sm font-semibold text-[#0e0f0c] transition hover:bg-[#e8ebe6] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            Previous
          </button>
          <button
            type="button"
            disabled={!canGoNext}
            className="inline-flex h-10 items-center gap-2 rounded-3xl border border-[#0e0f0c] px-4 text-sm font-semibold text-[#0e0f0c] transition hover:bg-[#e8ebe6] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setPage((current) => current + 1)}
          >
            Next
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Modal
        open={isFormModalOpen}
        title={formTransaction ? "Edit Transaction" : "Add Transaction"}
        onClose={closeFormModal}
      >
        <TransactionForm
          transaction={formTransaction}
          onCancel={closeFormModal}
          onSuccess={closeFormModal}
        />
      </Modal>
    </div>
  );
}

function TransactionTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {["Period", "Date", "Category", "Note", "Amount", "Type", "Actions"].map(
            (heading) => (
              <TableHead key={heading}>{heading}</TableHead>
            ),
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 6 }).map((_, index) => (
          <TableRow key={index}>
            {Array.from({ length: 7 }).map((__, cellIndex) => (
              <TableCell key={cellIndex}>
                <div className="h-4 animate-pulse rounded bg-[#e8ebe6]" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-[#868685] bg-white px-6 py-12 text-center">
      <h2 className="text-base font-black text-[#0e0f0c]">
        No transactions found
      </h2>
      <p className="mt-2 text-sm text-[#454745]">
        Adjust the filters or add a new transaction to start tracking activity.
      </p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
