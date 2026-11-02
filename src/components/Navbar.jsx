import React from 'react';
import { Menu, Plus, ArrowLeftRight, RotateCcw, Calendar, LogOut } from 'lucide-react';

export function Navbar({ 
  onMenuToggle, 
  title, 
  onOpenAddBook, 
  onOpenIssueBook, 
  onResetData,
  onLogout
}) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="hidden sm:block text-xs text-slate-500 font-medium">Budge Budge Institute of Technology • Central Library</p>
        </div>
      </div>

      {/* Right: Quick Actions & Date indicator */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>{today}</span>
        </div>

        {/* Quick Reset Sample Data Button */}
        <button
          onClick={onResetData}
          title="Reset database to initial BBIT demo records"
          className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-slate-600 hover:text-blue-700 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>

        <button
          onClick={onLogout}
          title="Sign out"
          className="p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>

        {/* Quick Issue Book Button */}
        <button
          onClick={onOpenIssueBook}
          className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
        >
          <ArrowLeftRight className="w-4 h-4 text-blue-600" />
          <span className="hidden xs:inline">Issue Book</span>
        </button>

        {/* Add Book Primary Accent Button */}
        <button
          onClick={onOpenAddBook}
          className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-blue-500/25"
        >
          <Plus className="w-4 h-4" />
          <span>New Book</span>
        </button>
      </div>
    </header>
  );
}
