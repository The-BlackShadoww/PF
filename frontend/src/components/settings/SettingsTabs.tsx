"use client";

import { useState } from "react";
import { User, Shield, Settings, Tags } from "lucide-react";
import { ProfileForm } from "./ProfileForm";
import { SecurityForm } from "./SecurityForm";
import { PreferencesForm } from "./PreferencesForm";
import { CategoriesManager } from "./CategoriesManager";

type Tab = "profile" | "security" | "preferences" | "categories";

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const tabs = [
    { id: "profile" as Tab, label: "Profile", icon: User },
    { id: "security" as Tab, label: "Security", icon: Shield },
    { id: "preferences" as Tab, label: "Preferences", icon: Settings },
    { id: "categories" as Tab, label: "Categories", icon: Tags },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-wrap gap-1 sm:gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-300
                ${isActive 
                  ? "bg-white text-indigo-600 shadow-[0_2px_10px_rgb(0,0,0,0.06)] border border-slate-100/50" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/80"}
              `}
            >
              <Icon size={18} className={isActive ? "text-indigo-600" : "text-slate-400"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="relative">
        {activeTab === "profile" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
            <ProfileForm />
          </div>
        )}
        {activeTab === "security" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
            <SecurityForm />
          </div>
        )}
        {activeTab === "preferences" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
            <PreferencesForm />
          </div>
        )}
        {activeTab === "categories" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-6 sm:p-8">
            <CategoriesManager />
          </div>
        )}
      </div>
    </div>
  );
}
