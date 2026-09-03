"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { Transaction } from "@/lib/api/transactions";
import { useCategories } from "@/lib/hooks/useCategories";
import { useCreateTransaction } from "@/lib/hooks/useCreateTransaction";
import { useUpdateTransaction } from "@/lib/hooks/useUpdateTransaction";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/components/ui/Toast";
import { apiClient } from "@/lib/api/client";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  categoryId: z.string().uuid("Choose a category."),
  amount: z.coerce.number().positive("Enter an amount greater than zero."),
  transactionMonth: z.number().int().min(1).max(12),
  transactionYear: z.number().int().min(2000).max(2100),
  date: z
    .string()
    .min(1, "Choose a date.")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: "Choose a valid date.",
    }),
  note: z.string().max(500, "Keep notes under 500 characters.").optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

type TransactionFormProps = {
  transaction?: Transaction | null;
  onSuccess: () => void;
  onCancel: () => void;
};

const defaultValues: TransactionFormValues = {
  type: "expense",
  categoryId: "",
  amount: 0,
  transactionMonth: new Date().getMonth() + 1,
  transactionYear: new Date().getFullYear(),
  date: toDateInputValue(new Date().toISOString()),
  note: "",
};

export function TransactionForm({
  transaction,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const toast = useToast();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const isEditing = Boolean(transaction);
  const [amountDisplay, setAmountDisplay] = useState("");
  const [projectedBalance, setProjectedBalance] = useState<number | null>(null);
  const [isProjectedLow, setIsProjectedLow] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues,
  });

  const selectedType = watch("type");
  const amountValue = watch("amount");
  const selectedDate = watch("date");
  const note = watch("note") ?? "";
  const futureDateWarning =
    selectedDate && new Date(`${selectedDate}T00:00:00`) > startOfToday();
  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === selectedType),
    [categories, selectedType],
  );
  const submitting =
    createTransaction.isPending || updateTransaction.isPending;

  useEffect(() => {
    const values = transaction
      ? {
          type: transaction.type,
          categoryId: transaction.categoryId,
          amount: transaction.amountCents / 100,
          transactionMonth: transaction.transactionMonth,
          transactionYear: transaction.transactionYear,
          date: toDateInputValue(transaction.date),
          note: transaction.note ?? "",
        }
      : defaultValues;

    reset(values);
    setAmountDisplay(formatAmount(values.amount));
  }, [reset, transaction]);

  useEffect(() => {
    if (!amountValue || amountValue <= 0) { setProjectedBalance(null); return; }
    const amountCents = Math.round(amountValue * 100);
    apiClient<{ data?: { projectedBalanceCents: number; isLowBalance: boolean }; projectedBalanceCents: number; isLowBalance: boolean }>(`/transactions/projected-balance?amount=${amountCents}&type=${selectedType}`)
      .then((response) => { const result = response.data ?? response; setProjectedBalance(result.projectedBalanceCents); setIsProjectedLow(result.isLowBalance); })
      .catch(() => setProjectedBalance(null));
  }, [amountValue, selectedType]);

  function handleTypeChange(nextType: "income" | "expense") {
    setValue("type", nextType, { shouldDirty: true, shouldValidate: true });

    if (nextType !== selectedType) {
      setValue("categoryId", "", { shouldDirty: true, shouldValidate: true });
    }
  }

  function handleAmountChange(value: string) {
    const cents = Number(value.replace(/\D/g, ""));
    const amount = cents / 100;

    setAmountDisplay(cents ? formatAmount(amount) : "");
    setValue("amount", amount, { shouldDirty: true, shouldValidate: true });
  }

  function submit(values: TransactionFormValues) {
    const payload = {
      ...values,
      note: values.note?.trim() || undefined,
    };

    if (transaction) {
      updateTransaction.mutate(
        { id: transaction.id, payload },
        {
          onSuccess: () => {
            toast.success("Transaction updated.");
            onSuccess();
          },
        },
      );
      return;
    }

    createTransaction.mutate(payload, {
      onSuccess: () => {
        toast.success("Transaction created.");
        onSuccess();
      },
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(submit)}>
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-muted">
          Transaction For <span className="text-xs font-normal text-muted">Which month does this belong to?</span>
        </label>
        <p className="text-xs text-muted">Choose the month and year this income or expense belongs to, not necessarily when money changed hands.</p>
        <div className="flex gap-2">
          <select value={watch("transactionMonth")} onChange={(event) => setValue("transactionMonth", parseInt(event.target.value, 10), { shouldValidate: true })} className="h-11 flex-1 rounded-panel border border-ink bg-surface px-4 text-sm">
            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
          </select>
          <select value={watch("transactionYear")} onChange={(event) => setValue("transactionYear", parseInt(event.target.value, 10), { shouldValidate: true })} className="h-11 w-28 rounded-panel border border-ink bg-surface px-3 text-sm">
            {Array.from({ length: 6 }, (_, index) => new Date().getFullYear() - index).map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
        <p className="text-xs font-semibold text-success">This transaction will be counted in: {new Date(watch("transactionYear"), watch("transactionMonth") - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" })}</p>
      </div>
      <div className="border-t border-line" />
      <div className="space-y-2">
        <span className="text-sm font-semibold text-muted">Type</span>
        <div className="grid grid-cols-2 gap-2">
          {(["income", "expense"] as const).map((transactionType) => (
            <button
              key={transactionType}
              type="button"
              className={cn(
                "h-11 rounded-card text-sm font-semibold capitalize transition",
                selectedType === transactionType
                  ? "bg-primary text-ink"
                  : "border border-ink bg-surface text-ink hover:bg-canvas",
              )}
              onClick={() => handleTypeChange(transactionType)}
            >
              {transactionType}
            </button>
          ))}
        </div>
        <input type="hidden" {...register("type")} />
        {errors.type ? <FieldError message={errors.type.message} /> : null}
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-muted">Category</span>
        <select
          className="h-11 w-full rounded-panel border border-ink bg-surface px-4 text-sm text-ink outline-none transition focus:ring-2 focus:ring-primary"
          disabled={categoriesLoading}
          {...register("categoryId")}
        >
          <option value="">
            {categoriesLoading ? "Loading categories..." : "Choose a category"}
          </option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId ? (
          <FieldError message={errors.categoryId.message} />
        ) : null}
      </label>

      {selectedType === "expense" && projectedBalance !== null && isProjectedLow ? (
        <div className="flex items-start gap-2 rounded-panel bg-amber-50 p-3 text-xs text-amber-800">
          <AlertTriangle aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>This expense will bring your balance to <strong>{projectedBalance < 0 ? "-" : ""}${(Math.abs(projectedBalance) / 100).toFixed(2)}</strong>{projectedBalance < 0 ? " (negative)" : ""} — below your low-balance threshold.</p>
        </div>
      ) : null}

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-muted">Amount</span>
        <input
          type="text"
          inputMode="decimal"
          value={amountDisplay}
          className="h-11 w-full rounded-panel border border-ink px-4 text-sm text-ink outline-none transition focus:ring-2 focus:ring-primary"
          placeholder="$0.00"
          onChange={(event) => handleAmountChange(event.target.value)}
        />
        <input type="hidden" {...register("amount")} />
        {errors.amount ? <FieldError message={errors.amount.message} /> : null}
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-muted">Date Received / Paid</span>
        <p className="text-xs text-muted">When did the money actually change hands? This is for your records only — it does not affect which month this transaction appears in.</p>
        <input
          type="date"
          className="h-11 w-full rounded-panel border border-ink px-4 text-sm text-ink outline-none transition focus:ring-2 focus:ring-primary"
          {...register("date")}
        />
        {futureDateWarning ? (
          <p className="flex items-center gap-2 text-xs font-semibold text-warning-ink">
            <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" />
            This date is in the future.
          </p>
        ) : null}
        {errors.date ? <FieldError message={errors.date.message} /> : null}
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-muted">Note</span>
        <textarea
          rows={4}
          maxLength={500}
          className="w-full resize-none rounded-panel border border-ink px-4 py-3 text-sm text-ink outline-none transition focus:ring-2 focus:ring-primary"
          placeholder="Optional"
          {...register("note")}
        />
        <div className="flex items-center justify-between gap-3">
          {errors.note ? <FieldError message={errors.note.message} /> : <span />}
          <span className="text-xs text-muted">{note.length}/500</span>
        </div>
      </label>

      <div className="flex justify-end gap-2 border-t border-line pt-5">
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center rounded-card border border-ink px-5 text-sm font-semibold text-ink transition hover:bg-canvas"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-card bg-primary px-5 text-sm font-semibold text-ink transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
        >
          {submitting
            ? "Saving..."
            : isEditing
              ? "Save Transaction"
              : "Add Transaction"}
        </button>
      </div>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs font-semibold text-danger">{message}</p>;
}

function formatAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return "";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function toDateInputValue(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
