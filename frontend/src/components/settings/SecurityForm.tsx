"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";

export function SecurityForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [password, setPassword] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false);
  const [is2FAVerifying, setIs2FAVerifying] = useState(false);
  const [twoFACode, setTwoFACode] = useState(["", "", "", "", "", ""]);

  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length > 7) score++;
    if (pwd.length > 11) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthScore = calculateStrength(password);
  const strengthColors = ["bg-slate-200", "bg-red-400", "bg-orange-400", "bg-amber-400", "bg-lime-400", "bg-emerald-500"];
  const strengthLabels = ["", "Very Weak", "Weak", "Fair", "Good", "Strong"];

  const onSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setPassword("");
  };

  const handle2FAToggle = () => {
    if (is2FAEnabled) {
      setIs2FAEnabled(false);
      setIs2FASetupOpen(false);
    } else {
      setIs2FASetupOpen(!is2FASetupOpen);
    }
  };

  const verify2FA = async () => {
    setIs2FAVerifying(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIs2FAVerifying(false);
    setIs2FAEnabled(true);
    setIs2FASetupOpen(false);
    setTwoFACode(["", "", "", "", "", ""]);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...twoFACode];
    newCode[index] = value;
    setTwoFACode(newCode);

    // Auto focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`tfa-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Password Card */}
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-6 sm:p-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">Change Password</h2>
          <p className="text-slate-500 text-sm mt-1">Ensure your account stays secure with a strong password.</p>
        </div>

        <form onSubmit={onSubmitPassword} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Current Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-slate-400" />
              </div>
              <input
                type={showPassword.current ? "text" : "password"}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-800"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => ({ ...p, current: !p.current }))}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-slate-400" />
                </div>
                <input
                  type={showPassword.new ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-800"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => ({ ...p, new: !p.new }))}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {/* Strength Meter */}
              {password && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ease-out ${strengthColors[strengthScore]}`}
                      style={{ width: `${(strengthScore / 5) * 100}%` }}
                    />
                  </div>
                  <p className={`text-xs mt-1.5 font-medium ${strengthScore > 3 ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {strengthLabels[strengthScore]}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-slate-400" />
                </div>
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-800"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => ({ ...p, confirm: !p.confirm }))}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !password}
              className="relative overflow-hidden inline-flex items-center justify-center gap-2 px-6 py-2.5 font-medium text-white bg-indigo-600 rounded-xl shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* 2FA Card */}
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-6 sm:p-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">Two-Factor Authentication</h2>
          <p className="text-slate-500 text-sm mt-1">Add an extra layer of security to your account.</p>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl flex items-center justify-center transition-colors ${is2FAEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
              {is2FAEnabled ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{is2FAEnabled ? '2FA is Enabled' : '2FA is Disabled'}</h3>
              <p className="text-xs text-slate-500">{is2FAEnabled ? 'Your account is protected' : 'Your account is less secure'}</p>
            </div>
          </div>
          
          <button 
            onClick={handle2FAToggle}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${is2FAEnabled || is2FASetupOpen ? 'bg-indigo-600' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${is2FAEnabled || is2FASetupOpen ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* 2FA Setup Panel */}
        {is2FASetupOpen && !is2FAEnabled && (
          <div className="mt-4 p-5 bg-indigo-50/50 border border-indigo-100 border-dashed rounded-xl animate-in slide-in-from-top-4 fade-in duration-300">
            <p className="text-sm text-slate-600 mb-4 text-center">
              Enter the 6-digit code from your authenticator app to verify and enable 2FA.
            </p>
            
            <div className="flex justify-center gap-2 mb-6">
              {twoFACode.map((digit, i) => (
                <input
                  key={i}
                  id={`tfa-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !digit && i > 0) {
                      document.getElementById(`tfa-${i - 1}`)?.focus();
                    }
                  }}
                  className="w-10 h-12 text-center text-lg font-bold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                />
              ))}
            </div>

            <button
              onClick={verify2FA}
              disabled={is2FAVerifying || twoFACode.some(d => !d)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 font-medium text-white bg-indigo-600 rounded-xl shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {is2FAVerifying && <Loader2 size={18} className="animate-spin" />}
              Verify & Enable
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
