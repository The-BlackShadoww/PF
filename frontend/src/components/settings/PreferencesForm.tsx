"use client";

import { useState, useEffect } from "react";
import { Globe, Clock, Calendar, Loader2 } from "lucide-react";

export function PreferencesForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [timezones, setTimezones] = useState<string[]>([]);
  const [detectedTz, setDetectedTz] = useState("");
  const [selectedTz, setSelectedTz] = useState("");

  useEffect(() => {
    // Client-side execution for Intl API
    try {
      const allTZ = Intl.supportedValuesOf('timeZone');
      setTimezones(allTZ);
      
      const current = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setDetectedTz(current);
      setSelectedTz(current);
    } catch (e) {
      // Fallback
      setTimezones(['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo']);
      setDetectedTz('UTC');
      setSelectedTz('UTC');
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-6 sm:p-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="mb-8">
        <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Preferences</h2>
        <p className="text-slate-500 text-sm mt-1">Customise your experience and regional settings.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Detected Timezone Indicator */}
        <div className="flex items-center gap-3 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl text-sm text-slate-700">
          <Clock className="text-indigo-500" size={18} />
          <span>Your detected timezone: <strong className="font-semibold text-slate-900">{detectedTz.replace(/_/g, ' ')}</strong></span>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Timezone</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe size={16} className="text-slate-400" />
            </div>
            <select
              value={selectedTz}
              onChange={(e) => setSelectedTz(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-800 appearance-none cursor-pointer"
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Date Format</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={16} className="text-slate-400" />
            </div>
            <select
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-800 appearance-none cursor-pointer"
              defaultValue="YYYY-MM-DD"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Language</label>
          <div className="relative">
            <select
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-800 appearance-none cursor-pointer"
              defaultValue="en"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="relative overflow-hidden inline-flex items-center justify-center gap-2 px-6 py-2.5 font-medium text-white bg-indigo-600 rounded-xl shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
