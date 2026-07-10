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
      type: type === "all" ? undefined : type,
      categoryId: categoryId || undefined,
    }),
    [categoryId, endDate, page, startDate, type],
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
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          onClick={openAddModal}
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add Transaction
        </button>
      </div>

      <section className="rounded-md border border-slate-200 bg-white p-4">
        <div className="grid gap-4 md:grid-cols-4">
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">
              Start date
            </span>
            <input
              type="date"
              value={startDate}
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              onChange={(event) => resetPage(setStartDate, event.target.value)}
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">End date</span>
            <input
              type="date"
              value={endDate}
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              onChange={(event) => resetPage(setEndDate, event.target.value)}
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Type</span>
            <select
              value={type}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
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
            <span className="text-sm font-medium text-slate-700">Category</span>
            <select
              value={categoryId}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
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
              <TableHead>Date</TableHead>
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
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: transaction.category.color ?? "#64748b",
                      }}
                    />
                    <span className="font-medium text-slate-900">
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
                      ? "text-right font-semibold text-emerald-600"
                      : "text-right font-semibold text-red-600"
                  }
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amountCents)}
                </TableCell>
                <TableCell>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium capitalize text-slate-700">
                    {transaction.type}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      aria-label="Edit transaction"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                      onClick={() => openEditModal(transaction)}
                    >
                      <Pencil aria-hidden="true" className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete transaction"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
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

      <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Page {page} of {totalPages} · {total} total transactions
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!canGoPrevious}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            Previous
          </button>
          <button
            type="button"
            disabled={!canGoNext}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
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
          {["Date", "Category", "Note", "Amount", "Type", "Actions"].map(
            (heading) => (
              <TableHead key={heading}>{heading}</TableHead>
            ),
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 6 }).map((_, index) => (
          <TableRow key={index}>
            {Array.from({ length: 6 }).map((__, cellIndex) => (
              <TableCell key={cellIndex}>
                <div className="h-4 animate-pulse rounded bg-slate-200" />
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
    <div className="rounded-md border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <h2 className="text-base font-semibold text-slate-950">
        No transactions found
      </h2>
      <p className="mt-2 text-sm text-slate-600">
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
