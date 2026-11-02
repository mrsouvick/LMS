import React, { useState } from 'react';
import { BookOpen, LockKeyhole, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export function LoginScreen({ onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 6) {
      setError('Enter a valid email address and a password of at least 6 characters.');
      return;
    }
    onSignIn();
  };

  return (
    <main className="min-h-screen bg-slate-950 p-4 sm:p-8 grid place-items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,.35),_transparent_32rem),radial-gradient(circle_at_bottom_left,_rgba(99,102,241,.25),_transparent_30rem)]" />
      <section className="relative w-full max-w-5xl grid overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/30 md:grid-cols-[1.05fr_.95fr]">
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 p-10 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20"><BookOpen className="h-6 w-6" /></div>
            <div><p className="font-extrabold text-xl">BBIT Library</p><p className="text-xs text-blue-100">Library Management System</p></div>
          </div>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/15"><ShieldCheck className="h-3.5 w-3.5" /> Secure access portal</span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight leading-tight">Your campus library, beautifully organized.</h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-blue-100">Sign in to manage catalogues, circulation, students, and fine records for Budge Budge Institute of Technology.</p>
          </div>
          <p className="text-xs text-blue-200">Budge Budge Institute of Technology</p>
        </div>

        <div className="p-7 sm:p-10 lg:p-12">
          <div className="md:hidden flex items-center gap-3 mb-9">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-700 text-white"><BookOpen className="h-5 w-5" /></div>
            <div><p className="font-extrabold text-lg text-slate-900">BBIT Library</p><p className="text-xs text-slate-500">Library Management System</p></div>
          </div>
          <div className="mb-8"><p className="text-sm font-bold text-blue-700">WELCOME BACK</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Sign in to continue</h2><p className="mt-2 text-sm text-slate-500">Use your institute email and password to access the library dashboard.</p></div>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">Email address</span><div className="relative"><Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@bbit.edu.in" autoComplete="email" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" /></div></label>
            <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">Password</span><div className="relative"><LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" /></div></label>
            {error && <p className="rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700">{error}</p>}
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200">Sign in to dashboard <ArrowRight className="h-4 w-4" /></button>
          </form>
          <p className="mt-6 text-center text-xs text-slate-400">For authorized BBIT library staff and students.</p>
        </div>
      </section>
    </main>
  );
}
