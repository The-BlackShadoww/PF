'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Globe, CheckCircle2 } from 'lucide-react';
import { useProfile, useUpdateProfile } from '../../../lib/hooks/useProfile';
import { cn } from '../../../lib/utils/cn';

// The IANA timezone database contains ~600 timezones.
// We expose a curated list of the most common ones grouped by region.
// Grouping makes the dropdown scannable without scrolling through all 600.
// Each entry: { value: IANA key, label: human-readable name }
const TIMEZONE_GROUPS: Array<{
  group: string;
  zones: Array<{ value: string; label: string }>;
}> = [
  {
    group: 'Asia',
    zones: [
      { value: 'Asia/Dhaka',     label: 'Dhaka (UTC+6)' },
      { value: 'Asia/Kolkata',   label: 'Mumbai, New Delhi (UTC+5:30)' },
      { value: 'Asia/Karachi',   label: 'Karachi, Islamabad (UTC+5)' },
      { value: 'Asia/Dubai',     label: 'Dubai, Abu Dhabi (UTC+4)' },
      { value: 'Asia/Singapore', label: 'Singapore, Kuala Lumpur (UTC+8)' },
      { value: 'Asia/Bangkok',   label: 'Bangkok, Jakarta (UTC+7)' },
      { value: 'Asia/Tokyo',     label: 'Tokyo, Seoul (UTC+9)' },
      { value: 'Asia/Shanghai',  label: 'Beijing, Shanghai (UTC+8)' },
    ],
  },
  {
    group: 'Europe',
    zones: [
      { value: 'Europe/London',   label: 'London (UTC+0/+1)' },
      { value: 'Europe/Paris',    label: 'Paris, Berlin, Rome (UTC+1/+2)' },
      { value: 'Europe/Moscow',   label: 'Moscow (UTC+3)' },
      { value: 'Europe/Istanbul', label: 'Istanbul (UTC+3)' },
    ],
  },
  {
    group: 'Americas',
    zones: [
      { value: 'America/New_York',    label: 'New York, Miami (UTC-5/-4)' },
      { value: 'America/Chicago',     label: 'Chicago, Dallas (UTC-6/-5)' },
      { value: 'America/Denver',      label: 'Denver, Phoenix (UTC-7/-6)' },
      { value: 'America/Los_Angeles', label: 'Los Angeles, Seattle (UTC-8/-7)' },
      { value: 'America/Toronto',     label: 'Toronto, Montreal (UTC-5/-4)' },
      { value: 'America/Sao_Paulo',   label: 'São Paulo (UTC-3)' },
    ],
  },
  {
    group: 'Africa',
    zones: [
      { value: 'Africa/Cairo',    label: 'Cairo (UTC+2)' },
      { value: 'Africa/Lagos',    label: 'Lagos, Accra (UTC+1)' },
      { value: 'Africa/Nairobi',  label: 'Nairobi (UTC+3)' },
    ],
  },
  {
    group: 'Pacific',
    zones: [
      { value: 'Australia/Sydney',   label: 'Sydney, Melbourne (UTC+10/+11)' },
      { value: 'Pacific/Auckland',   label: 'Auckland (UTC+12/+13)' },
    ],
  },
  {
    group: 'Universal',
    zones: [
      { value: 'UTC', label: 'UTC (Universal Coordinated Time)' },
    ],
  },
];

// Flatten all zones into a single array for the dropdown
// and for looking up the current label by value.
const ALL_ZONES = TIMEZONE_GROUPS.flatMap((g) => g.zones);

const preferencesSchema = z.object({
  timezone: z.string().min(1, 'Please select a timezone'),
});

type PreferencesFormValues = z.infer<typeof preferencesSchema>;

export function PreferencesTab() {
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: { timezone: 'UTC' },
  });

  // Populate with current timezone once profile loads
  useEffect(() => {
    if (profile) {
      reset({ timezone: profile.timezone ?? 'UTC' });
    }
  }, [profile, reset]);

  const selectedTimezone = watch('timezone');

  // Find the human-readable label for the currently selected timezone.
  // Falls back to the raw IANA value if the zone is not in our curated list
  // (possible if the user's timezone was set directly via the API or DB).
  const selectedLabel =
    ALL_ZONES.find((z) => z.value === selectedTimezone)?.label ?? selectedTimezone;

  async function onSubmit(values: PreferencesFormValues) {
    setShowSuccess(false);
    await updateMutation.mutateAsync({ timezone: values.timezone });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    // Reset isDirty after a successful save so the button goes back to disabled
    reset({ timezone: values.timezone });
  }

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-md">
        <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-10 bg-gray-100 rounded-lg animate-pulse w-2/3" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">

      {/* Timezone field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Timezone
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Used to correctly group transactions by day and month in your reports
          and summaries. Choose the timezone where you make most of your transactions.
        </p>

        <div className="relative">
          <Globe
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
          />
          <select
            {...register('timezone')}
            className={cn(
              'w-full pl-9 pr-8 py-2 border rounded-lg text-sm bg-white',
              'focus:outline-none focus:ring-2 focus:ring-gray-900',
              'appearance-none cursor-pointer',
              // appearance-none removes the browser's default dropdown arrow
              // so we can style our own. The custom arrow below is positioned absolutely.
              errors.timezone ? 'border-red-400' : 'border-gray-300',
            )}
          >
            {TIMEZONE_GROUPS.map((group) => (
              <optgroup key={group.group} label={group.group}>
                {group.zones.map((zone) => (
                  <option key={zone.value} value={zone.value}>
                    {zone.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {/* Custom dropdown chevron */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {errors.timezone && (
          <p className="mt-1 text-xs text-red-500">{errors.timezone.message}</p>
        )}
      </div>

      {/* Current selection display */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
        <Globe size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-medium text-blue-800">Currently selected</p>
          <p className="text-xs text-blue-600 mt-0.5">{selectedLabel}</p>
          <p className="text-xs text-blue-500 mt-1">
            Your financial summaries will show months and days in this timezone.
          </p>
        </div>
      </div>

      {/* API error */}
      {updateMutation.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            {(updateMutation.error as Error)?.message ?? 'Failed to save preferences'}
          </p>
        </div>
      )}

      {/* Success */}
      {showSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700">Timezone saved successfully</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={updateMutation.isPending || !isDirty}
          className={cn(
            'px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg',
            'hover:bg-gray-800 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {updateMutation.isPending ? 'Saving...' : 'Save Preferences'}
        </button>
        {!isDirty && (
          <span className="text-xs text-gray-400">No changes to save</span>
        )}
      </div>

    </form>
  );
}
