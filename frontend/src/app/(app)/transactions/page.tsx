"use client";

import {
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

import { TransactionForm } from "@/components/forms/TransactionForm";
import { PageHeader } from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/Button";
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
import { useDeleteTransaction } from "@/lib/hooks/useDeleteTransaction";
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
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);
  const reduceMotion = useReducedMotion();

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
  const deleteTransaction = useDeleteTransaction();
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

  function confirmDelete() {
    if (!transactionToDelete) {
      return;
    }

    deleteTransaction.mutate(transactionToDelete.id, {
      onSuccess: () => {
        if (transactions.length === 1 && page > 1) {
          setPage((current) => current - 1);
        }
        setTransactionToDelete(null);
      },
    });
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Transactions"
          description="Review and filter your income and expenses."
        />
        <Button
          type="button"
          onClick={openAddModal}
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      <motion.section initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .2 }} className="app-panel p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-[-.03em]">Find a transaction</h2>
            <p className="mt-1 text-sm text-muted">Narrow your activity by time, type, or category.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setFilterMonth(undefined);
              setFilterYear(undefined);
              setType("all");
              setCategoryId("");
              setPage(1);
            }}
            className="w-fit text-xs font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            Reset filters
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Show period</span>
            <select
              value={filterMonth ?? ""}
              className="h-10 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              onChange={(event) => resetPage(setFilterMonth, event.target.value ? Number(event.target.value) : undefined)}
            >
              <option value="">All months</option>
              {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Year</span>
            <select
              value={filterYear ?? ""}
              className="h-10 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              onChange={(event) => resetPage(setFilterYear, event.target.value ? Number(event.target.value) : undefined)}
            >
              <option value="">All years</option>
              {Array.from({ length: 6 }, (_, index) => new Date().getFullYear() - index).map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Start date
            </span>
            <input
              type="date"
              value={startDate}
              className="h-10 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              onChange={(event) => resetPage(setStartDate, event.target.value)}
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">End date</span>
            <input
              type="date"
              value={endDate}
              className="h-10 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              onChange={(event) => resetPage(setEndDate, event.target.value)}
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Type</span>
            <select
              value={type}
              className="h-10 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
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
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Category</span>
            <select
              value={categoryId}
              className="h-10 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
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
      </motion.section>

      <AnimatePresence mode="wait">{isLoading ? (
        <TransactionTableSkeleton />
      ) : transactions.length === 0 ? (
        <EmptyState onAdd={openAddModal} />
      ) : (
        <motion.div key="transactions-table" initial={reduceMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0 }} transition={{ duration: .18 }}><Table aria-busy={isFetching}>
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
                <TableCell><span className="text-xs text-muted">{new Date(transaction.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                      backgroundColor: transaction.category.color ?? "#868685",
                      }}
                    />
                    <span className="font-semibold text-ink">
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
                      ? "text-right font-semibold text-success"
                      : "text-right font-semibold text-danger"
                  }
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amountCents)}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                      transaction.type === "income"
                        ? "border border-success/20 bg-success/10 text-success"
                        : "border border-danger/20 bg-danger/10 text-danger",
                    )}
                  >
                    {transaction.type}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      aria-label="Edit transaction"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-control text-muted transition-colors hover:bg-canvas hover:text-ink"
                      onClick={() => openEditModal(transaction)}
                    >
                      <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete transaction"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-control text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                      onClick={() => setTransactionToDelete(transaction)}
                    >
                      <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></motion.div>
      )}</AnimatePresence>

      <div className="app-panel flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-medium text-muted">
          Page {page} of {totalPages} · {total} total transactions
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!canGoPrevious}
            className="inline-flex h-9 items-center gap-1.5 rounded-control border border-line bg-surface px-3.5 text-xs font-medium text-foreground transition-all hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft aria-hidden="true" className="h-3.5 w-3.5" />
            Previous
          </button>
          <button
            type="button"
            disabled={!canGoNext}
            className="inline-flex h-9 items-center gap-1.5 rounded-control border border-line bg-surface px-3.5 text-xs font-medium text-foreground transition-all hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setPage((current) => current + 1)}
          >
            Next
            <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
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

      <Modal
        open={transactionToDelete !== null}
        title="Delete transaction?"
        onClose={() => {
          if (!deleteTransaction.isPending) {
            setTransactionToDelete(null);
          }
        }}
      >
        <p className="text-sm text-muted">
          This will remove the {transactionToDelete?.type} transaction for{" "}
          {transactionToDelete
            ? formatCurrency(transactionToDelete.amountCents)
            : ""}. This action cannot be undone from the app.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="h-10 rounded-card border border-ink px-4 text-sm font-semibold text-ink transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50"
            disabled={deleteTransaction.isPending}
            onClick={() => setTransactionToDelete(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="h-10 rounded-card bg-danger px-4 text-sm font-semibold text-white transition hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={deleteTransaction.isPending}
            onClick={confirmDelete}
          >
            {deleteTransaction.isPending ? "Deleting..." : "Delete transaction"}
          </button>
        </div>
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
                <div className="h-4 animate-pulse rounded bg-canvas" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function EmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-surface px-6 py-14 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-control bg-accent text-primary">
        <ArrowRightLeft className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-ink">
        No transactions found
      </h2>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted">
        Adjust the filters above or add a new transaction to record your activity.
      </p>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-5 inline-flex items-center gap-1.5 rounded-control bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Add transaction
        </button>
      )}
    </div>
  );
}
