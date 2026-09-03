"use client";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ColorPicker } from "@/components/categories/ColorPicker";
import { IconPicker, LucideIcon } from "@/components/categories/IconPicker";
import type { SectorAllocation } from "@/lib/api/account";
import {
  useAccountSummary,
  useCreateSector,
  useDeleteSector,
  useSetupAccount,
  useUpdateSector,
} from "@/lib/hooks/useAccount";

type SectorValues = {
  name: string;
  percentage: number;
  color: string;
  icon: string;
  targetAmount: string;
};
const blank: SectorValues = {
  name: "",
  percentage: 5,
  color: "#6b7280",
  icon: "piggy-bank",
  targetAmount: "",
};
export function AccountSettingsTab() {
  const { data: summary, isLoading } = useAccountSummary();
  const setup = useSetupAccount();
  const create = useCreateSector();
  const update = useUpdateSector();
  const remove = useDeleteSector();
  const [initialBalance, setInitialBalance] = useState(0);
  const [threshold, setThreshold] = useState(5000);
  const [sector, setSector] = useState<SectorValues | null>(null);
  const [editing, setEditing] = useState<SectorAllocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (summary) {
      setInitialBalance(summary.initialBalanceCents / 100);
      setThreshold(summary.lowBalanceThresholdCents / 100);
    }
  }, [summary]);
  if (isLoading)
    return <div className="h-48 animate-pulse rounded-card bg-canvas" />;
  const total =
    summary?.sectors.reduce((sum, item) => sum + item.percentage, 0) ?? 0;
  const available = 99 - total + (editing?.percentage ?? 0);
  async function saveConfig(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await setup.mutateAsync({
        initialBalance: Math.round(initialBalance),
        lowBalanceThreshold: Math.round(threshold),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save configuration",
      );
    }
  }
  async function saveSector(e: React.FormEvent) {
    e.preventDefault();
    if (!sector) return;
    setError(null);
    try {
      const data = {
        ...sector,
        targetAmount: sector.targetAmount
          ? Math.round(Number(sector.targetAmount))
          : undefined,
      };
      if (editing) await update.mutateAsync({ id: editing.id, data });
      else await create.mutateAsync(data);
      setSector(null);
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save sector");
    }
  }
  return (
    <div className="max-w-2xl space-y-10">
      <section>
        <h2 className="text-lg font-black">Account configuration</h2>
        <p className="mt-1 text-sm text-muted">
          Your running balance is recalculated from this starting balance and
          every transaction.
        </p>
        <form onSubmit={saveConfig} className="mt-5 grid gap-4 sm:grid-cols-2">
          <NumberInput
            label="Initial balance ($)"
            value={initialBalance}
            onChange={setInitialBalance}
          />
          <NumberInput
            label="Low-balance threshold ($)"
            value={threshold}
            onChange={setThreshold}
          />
          <button
            disabled={setup.isPending}
            className="w-fit rounded-card bg-primary px-5 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {setup.isPending ? "Saving…" : "Save configuration"}
          </button>
        </form>
      </section>
      <section className="border-t border-line pt-8">
        <div className="flex items-start justify-between p-3 gap-3">
          <div>
            <h2 className="text-lg font-black">Savings sectors</h2>
            <p className="mt-1 text-sm text-muted">
              Cash is calculated as the remainder.
            </p>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setSector(blank);
            }}
            disabled={available <= 0}
            className="inline-flex items-center gap-2 rounded-card bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            <Plus size={16} />
            New sector
          </button>
        </div>
        <div className="mt-4 rounded-panel bg-canvas p-3 text-sm">
          Allocated: <strong>{total}% / 99%</strong> · Cash receives{" "}
          {100 - total}%
        </div>
        <div className="mt-4 space-y-2">
          {summary?.sectors.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-panel border border-line p-3"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: item.color }}
              >
                <LucideIcon name={item.icon} size={16} />
              </span>
              <span className="flex-1 text-sm font-semibold">
                {item.name}{" "}
                <small className="font-normal text-muted">
                  {item.percentage}%
                </small>
              </span>
              <button
                aria-label={`Edit ${item.name}`}
                onClick={() => {
                  setEditing(item);
                  setSector({
                    name: item.name,
                    percentage: item.percentage,
                    color: item.color,
                    icon: item.icon,
                    targetAmount: item.targetAmountCents
                      ? String(item.targetAmountCents / 100)
                      : "",
                  });
                }}
              >
                <Pencil size={16} />
              </button>
              <button
                aria-label={`Delete ${item.name}`}
                onClick={() => remove.mutate(item.id)}
              >
                <Trash2 size={16} className="text-red-600" />
              </button>
            </div>
          ))}
        </div>
        {sector && (
          <form
            onSubmit={saveSector}
            className="mt-5 space-y-4 rounded-card bg-canvas p-5"
          >
            <h3 className="font-black">
              {editing ? `Edit ${editing.name}` : "New savings sector"}
            </h3>
            <label className="block text-sm font-semibold">
              Name
              <input
                required
                maxLength={100}
                value={sector.name}
                onChange={(e) => setSector({ ...sector, name: e.target.value })}
                className="mt-1 h-11 w-full rounded-panel border border-ink bg-surface px-3"
              />
            </label>
            <NumberInput
              label={`Percentage (available: ${available}%)`}
              value={sector.percentage}
              onChange={(value) => setSector({ ...sector, percentage: value })}
              max={available}
              min={1}
            />
            <label className="block text-sm font-semibold">
              Savings goal ($, optional)
              <input
                type="number"
                min="1"
                value={sector.targetAmount}
                onChange={(e) =>
                  setSector({ ...sector, targetAmount: e.target.value })
                }
                className="mt-1 h-11 w-full rounded-panel border border-ink bg-surface px-3"
              />
            </label>
            <ColorPicker
              value={sector.color}
              onChange={(color) => setSector({ ...sector, color })}
            />
            <IconPicker
              value={sector.icon}
              onChange={(icon) => setSector({ ...sector, icon })}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSector(null);
                  setEditing(null);
                }}
                className="rounded-card border border-ink px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={create.isPending || update.isPending}
                className="rounded-card bg-primary px-4 py-2 text-sm font-semibold"
              >
                Save sector
              </button>
            </div>
          </form>
        )}
      </section>
      {error && (
        <p className="rounded-panel bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}
function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        type="number"
        required
        min={min}
        max={max}
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 h-11 w-full rounded-panel border border-ink px-3"
      />
    </label>
  );
}
