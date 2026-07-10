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

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  categoryId: z.string().uuid("Choose a category."),
  amount: z.coerce.number().positive("Enter an amount greater than zero."),
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
          date: toDateInputValue(transaction.date),
          note: transaction.note ?? "",
        }
      : defaultValues;

    reset(values);
    setAmountDisplay(formatAmount(values.amount));
  }, [reset, transaction]);

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
        <span className="text-sm font-medium text-slate-700">Type</span>
        <div className="grid grid-cols-2 gap-2">
          {(["income", "expense"] as const).map((transactionType) => (
            <button
              key={transactionType}
              type="button"
              className={cn(
                "h-10 rounded-md border text-sm font-semibold capitalize transition",
                selectedType === transactionType
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
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
        <span className="text-sm font-medium text-slate-700">Category</span>
        <select
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
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

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Amount</span>
        <input
          type="text"
          inputMode="decimal"
          value={amountDisplay}
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          placeholder="$0.00"
          onChange={(event) => handleAmountChange(event.target.value)}
        />
        <input type="hidden" {...register("amount")} />
        {errors.amount ? <FieldError message={errors.amount.message} /> : null}
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Date</span>
        <input
          type="date"
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          {...register("date")}
        />
        {futureDateWarning ? (
          <p className="flex items-center gap-2 text-xs font-medium text-amber-700">
            <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" />
            This date is in the future.
          </p>
        ) : null}
        {errors.date ? <FieldError message={errors.date.message} /> : null}
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Note</span>
        <textarea
          rows={4}
          maxLength={500}
          className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          placeholder="Optional"
          {...register("note")}
        />
        <div className="flex items-center justify-between gap-3">
          {errors.note ? <FieldError message={errors.note.message} /> : <span />}
          <span className="text-xs text-slate-500">{note.length}/500</span>
        </div>
      </label>

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-5">
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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

  return <p className="text-xs font-medium text-red-600">{message}</p>;
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
