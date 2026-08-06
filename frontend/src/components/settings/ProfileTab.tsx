'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Image, CheckCircle2 } from 'lucide-react';
import { useProfile, useUpdateProfile } from '@/lib/hooks/useProfile';
import { cn } from '@/lib/utils/cn';

const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  avatarUrl: z
    .string()
    .url('Must be a valid URL starting with http:// or https://')
    .max(500)
    .optional()
    .or(z.literal('')),
  // .or(z.literal('')) allows the field to be blank (cleared).
  // Without this, an empty string fails .url() validation.
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileTab() {
  const { data: profileResponse, isLoading: isProfileLoading } = useProfile();
  const profile = profileResponse;
  const updateMutation = useUpdateProfile();
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', avatarUrl: '' },
  });

  // Populate form once profile data loads.
  // useEffect with reset() is the correct pattern for async default values
  // in react-hook-form — do NOT set defaultValues in useForm directly
  // when the data is fetched asynchronously.
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        avatarUrl: profile.avatarUrl ?? '',
      });
    }
  }, [profile, reset]);

  async function onSubmit(values: ProfileFormValues) {
    setShowSuccess(false);
    await updateMutation.mutateAsync({
      name: values.name,
      avatarUrl: values.avatarUrl || undefined,
      // Convert empty string back to undefined — we don't send an empty
      // avatarUrl to the backend; we simply omit it.
    });
    setShowSuccess(true);
    // Auto-hide the success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  }

  if (isProfileLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">

      {/* Avatar preview */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-300">
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // If the URL is broken, fall back to the initials placeholder
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <User size={28} className="text-gray-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{profile?.name}</p>
          <p className="text-xs text-gray-500">{profile?.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Email cannot be changed
          </p>
        </div>
      </div>

      {/* Email — read-only display, not a form field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
          <Mail size={15} className="text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-500">{profile?.email}</span>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Contact support to change your email address
        </p>
      </div>

      {/* Name field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <div className="relative">
          <User
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            {...register('name')}
            placeholder="Your full name"
            className={cn(
              'w-full pl-9 pr-3 py-2 border rounded-lg text-sm',
              'focus:outline-none focus:ring-2 focus:ring-gray-900',
              errors.name ? 'border-red-400' : 'border-gray-300',
            )}
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Avatar URL field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Avatar URL
          <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <div className="relative">
          <Image
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            {...register('avatarUrl')}
            placeholder="https://example.com/your-photo.jpg"
            className={cn(
              'w-full pl-9 pr-3 py-2 border rounded-lg text-sm',
              'focus:outline-none focus:ring-2 focus:ring-gray-900',
              errors.avatarUrl ? 'border-red-400' : 'border-gray-300',
            )}
          />
        </div>
        {errors.avatarUrl && (
          <p className="mt-1 text-xs text-red-500">{errors.avatarUrl.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Paste a link to any publicly accessible image
        </p>
      </div>

      {/* Error from API */}
      {updateMutation.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            {(updateMutation.error as Error)?.message ?? 'Failed to update profile'}
          </p>
        </div>
      )}

      {/* Success message */}
      {showSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700">Profile updated successfully</p>
        </div>
      )}

      {/* Submit */}
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
          {updateMutation.isPending ? 'Saving...' : 'Save Profile'}
        </button>
        {!isDirty && (
          <span className="text-xs text-gray-400">No changes to save</span>
        )}
      </div>

    </form>
  );
}
