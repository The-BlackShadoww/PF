'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Shield, ShieldCheck, ShieldOff, CheckCircle2, KeyRound } from 'lucide-react';
import {
  useProfile,
  useChangePassword,
  useSetup2fa,
  useEnable2fa,
  useDisable2fa,
} from '@/lib/hooks/useProfile';
import { cn } from '@/lib/utils/cn';

// ─── Change Password form schema ─────────────────────────────────────────────

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password cannot exceed 72 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
    // path: ['confirmPassword'] means the error appears on the confirmPassword
    // field specifically, not on the whole form.
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

// ─── 2FA state machine ───────────────────────────────────────────────────────
// The 2FA section has several distinct UI states.
// We use a string union instead of boolean flags to make state transitions explicit.
type TwoFactorUIState =
  | 'idle'          // default — shows current status and action button
  | 'loading-setup' // waiting for /auth/2fa/setup response
  | 'show-qr'       // QR code is displayed, waiting for user to scan and enter code
  | 'verifying'     // waiting for /auth/2fa/enable response
  | 'enabled-success' // just enabled — show success message briefly
  | 'confirm-disable' // user clicked Disable — ask for code confirmation
  | 'disabling';    // waiting for /auth/2fa/disable response


// ─── PasswordField ───────────────────────────────────────────────────────────
// Reusable password input with show/hide toggle.
// Extracted as a local component — only used inside SecurityTab.
function PasswordField({
  label,
  registration,
  error,
  placeholder,
}: {
  label: string;
  registration: ReturnType<ReturnType<typeof useForm>['register']>;
  error?: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          {...registration}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          className={cn(
            'w-full pl-3 pr-10 py-2 border rounded-lg text-sm',
            'focus:outline-none focus:ring-2 focus:ring-gray-900',
            error ? 'border-red-400' : 'border-gray-300',
          )}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          tabIndex={-1}
          // tabIndex={-1} removes this button from the tab order.
          // The show/hide toggle is a cosmetic control — screen readers
          // and keyboard users should not have to tab through it.
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}


// ─── Main SecurityTab component ───────────────────────────────────────────────
export function SecurityTab() {
  const { data: profileResponse } = useProfile();
  const profile = profileResponse;

  // ── Change Password form ──
  const changePasswordMutation = useChangePassword();
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  async function onChangePassword(values: ChangePasswordValues) {
    setPasswordSuccess(false);
    await changePasswordMutation.mutateAsync({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    resetPasswordForm();
    setPasswordSuccess(true);
    setTimeout(() => setPasswordSuccess(false), 4000);
  }

  // ── 2FA state ──
  const [twoFactorState, setTwoFactorState] = useState<TwoFactorUIState>('idle');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

  const setup2faMutation = useSetup2fa();
  const enable2faMutation = useEnable2fa();
  const disable2faMutation = useDisable2fa();

  async function handleSetup2fa() {
    setTwoFactorError(null);
    setTwoFactorState('loading-setup');
    try {
      const result = await setup2faMutation.mutateAsync();
      // apiClient returns the raw response body.
      // The backend wraps in { data, meta }, so unwrap accordingly.
      const response = result as any;
      setQrCodeDataUrl(response.qrCodeDataUrl ?? response.data?.qrCodeDataUrl);
      setTwoFactorState('show-qr');
    } catch (err: any) {
      setTwoFactorError(err?.message ?? 'Failed to generate QR code');
      setTwoFactorState('idle');
    }
  }

  async function handleEnable2fa() {
    if (totpCode.length !== 6) {
      setTwoFactorError('Please enter the 6-digit code from your authenticator app');
      return;
    }
    setTwoFactorError(null);
    setTwoFactorState('verifying');
    try {
      await enable2faMutation.mutateAsync(totpCode);
      setTotpCode('');
      setQrCodeDataUrl(null);
      setTwoFactorState('enabled-success');
      setTimeout(() => setTwoFactorState('idle'), 3000);
    } catch (err: any) {
      setTwoFactorError(err?.message ?? 'Invalid code. Please try again.');
      setTwoFactorState('show-qr');
      // Stay on show-qr so the user can try again without re-scanning
    }
  }

  async function handleDisable2fa() {
    if (totpCode.length !== 6) {
      setTwoFactorError('Please enter the 6-digit code from your authenticator app');
      return;
    }
    setTwoFactorError(null);
    setTwoFactorState('disabling');
    try {
      await disable2faMutation.mutateAsync(totpCode);
      setTotpCode('');
      setTwoFactorState('idle');
    } catch (err: any) {
      setTwoFactorError(err?.message ?? 'Invalid code. 2FA was not disabled.');
      setTwoFactorState('confirm-disable');
    }
  }

  const is2faEnabled = profile?.twoFactorEnabled ?? false;

  return (
    <div className="space-y-10 max-w-md">

      {/* ── SECTION A: Change Password ── */}
      <section>
        <div className="flex items-center gap-2 mb-1">
          <KeyRound size={16} className="text-gray-600" />
          <h3 className="text-base font-semibold text-gray-900">Change Password</h3>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Update your password. You will remain logged in on this device.
        </p>

        {profile && profile.email && (
          <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">

            <PasswordField
              label="Current Password"
              registration={register('currentPassword')}
              error={passwordErrors.currentPassword?.message}
              placeholder="Your current password"
            />

            <PasswordField
              label="New Password"
              registration={register('newPassword')}
              error={passwordErrors.newPassword?.message}
              placeholder="At least 8 characters"
            />

            <PasswordField
              label="Confirm New Password"
              registration={register('confirmPassword')}
              error={passwordErrors.confirmPassword?.message}
              placeholder="Repeat your new password"
            />

            {/* API error */}
            {changePasswordMutation.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  {(changePasswordMutation.error as Error)?.message ?? 'Failed to change password'}
                </p>
              </div>
            )}

            {/* Success */}
            {passwordSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-700">Password changed successfully</p>
              </div>
            )}

            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
            </button>

          </form>
        )}
      </section>

      {/* Divider */}
      <hr className="border-gray-200" />

      {/* ── SECTION B: Two-Factor Authentication ── */}
      <section>
        <div className="flex items-center gap-2 mb-1">
          {is2faEnabled
            ? <ShieldCheck size={16} className="text-green-600" />
            : <Shield size={16} className="text-gray-600" />
          }
          <h3 className="text-base font-semibold text-gray-900">
            Two-Factor Authentication
          </h3>
          {/* Status badge */}
          <span className={cn(
            'ml-auto text-xs font-medium px-2 py-0.5 rounded-full',
            is2faEnabled
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500',
          )}>
            {is2faEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Add an extra layer of security. After enabling, you will need a code
          from your authenticator app every time you log in.
        </p>

        {/* State: idle */}
        {twoFactorState === 'idle' && (
          <div>
            {!is2faEnabled ? (
              <button
                onClick={handleSetup2fa}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <ShieldCheck size={15} />
                Enable Two-Factor Auth
              </button>
            ) : (
              <button
                onClick={() => {
                  setTwoFactorState('confirm-disable');
                  setTotpCode('');
                  setTwoFactorError(null);
                }}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
              >
                <ShieldOff size={15} />
                Disable Two-Factor Auth
              </button>
            )}
          </div>
        )}

        {/* State: loading-setup */}
        {twoFactorState === 'loading-setup' && (
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
            Generating QR code...
          </div>
        )}

        {/* State: show-qr */}
        {twoFactorState === 'show-qr' && qrCodeDataUrl && (
          <div className="space-y-5">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">

              <p className="text-sm font-medium text-gray-900 mb-1">
                Step 1 — Scan this QR code
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Open Google Authenticator, Authy, or any TOTP app and scan:
              </p>

              {/* QR code image */}
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-white border border-gray-200 rounded-lg inline-block">
                  <img
                    src={qrCodeDataUrl}
                    alt="2FA QR Code"
                    width={200}
                    height={200}
                    className="block"
                  />
                </div>
              </div>

              <p className="text-sm font-medium text-gray-900 mb-1">
                Step 2 — Enter the 6-digit code
              </p>
              <p className="text-xs text-gray-500 mb-3">
                After scanning, enter the code your app shows to confirm setup:
              </p>

              {/* TOTP code input */}
              <input
                type="text"
                inputMode="numeric"
                // inputMode="numeric" shows the number keyboard on mobile
                // without restricting input to only numbers (which would
                // prevent pasting from a password manager).
                maxLength={6}
                value={totpCode}
                onChange={(e) => {
                  // Strip non-digits as the user types
                  setTotpCode(e.target.value.replace(/\D/g, ''));
                  setTwoFactorError(null);
                }}
                placeholder="123456"
                className={cn(
                  'w-full px-4 py-3 border rounded-lg text-center text-2xl font-mono tracking-widest',
                  'focus:outline-none focus:ring-2 focus:ring-gray-900',
                  twoFactorError ? 'border-red-400' : 'border-gray-300',
                )}
              />
              {/* tracking-widest makes TOTP codes like "1 2 3 4 5 6" easier to read */}
            </div>

            {twoFactorError && (
              <p className="text-sm text-red-500">{twoFactorError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleEnable2fa}
                disabled={totpCode.length !== 6}
                className="flex-1 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify and Enable
              </button>
              <button
                onClick={() => {
                  setTwoFactorState('idle');
                  setTotpCode('');
                  setQrCodeDataUrl(null);
                  setTwoFactorError(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* State: verifying */}
        {twoFactorState === 'verifying' && (
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
            Verifying code...
          </div>
        )}

        {/* State: enabled-success */}
        {twoFactorState === 'enabled-success' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-700">
                Two-factor authentication is now active
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                You will be asked for a code from your authenticator app on every login.
              </p>
            </div>
          </div>
        )}

        {/* State: confirm-disable */}
        {twoFactorState === 'confirm-disable' && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm font-medium text-red-800 mb-1">
                Disable two-factor authentication?
              </p>
              <p className="text-xs text-red-600 mb-4">
                Your account will be less secure. Enter your current authenticator
                code to confirm.
              </p>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={totpCode}
                onChange={(e) => {
                  setTotpCode(e.target.value.replace(/\D/g, ''));
                  setTwoFactorError(null);
                }}
                placeholder="123456"
                className={cn(
                  'w-full px-4 py-3 border rounded-lg text-center text-2xl font-mono tracking-widest',
                  'focus:outline-none focus:ring-2 focus:ring-red-400',
                  twoFactorError ? 'border-red-400' : 'border-red-200',
                )}
              />
            </div>

            {twoFactorError && (
              <p className="text-sm text-red-500">{twoFactorError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleDisable2fa}
                disabled={totpCode.length !== 6}
                className="flex-1 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Disable
              </button>
              <button
                onClick={() => {
                  setTwoFactorState('idle');
                  setTotpCode('');
                  setTwoFactorError(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* State: disabling */}
        {twoFactorState === 'disabling' && (
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
            Disabling two-factor authentication...
          </div>
        )}

      </section>
    </div>
  );
}
