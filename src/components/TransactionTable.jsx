import React, { useState } from 'react';
import { Search, History, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatINR } from '../utils/currency';

export function TransactionTable({ transactions = [], dailyFineRate = 1.0 }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredTxns = transactions.filter(txn => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = 
      !q ||
      txn.transactionId.toLowerCase().includes(q) ||
      txn.bookId.toLowerCase().includes(q) ||
      txn.bookTitle.toLowerCase().includes(q) ||
      txn.memberId.toLowerCase().includes(q) ||
      txn.memberName.toLowerCase().includes(q);

    const matchesStatus = filterStatus === 'ALL' || txn.status === filterStatus;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Header Toolbar */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Txn ID, Book, or Student..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
          {['ALL', 'ACTIVE', 'RETURNED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === st
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              {st === 'ALL' ? 'All Loans' : st === 'ACTIVE' ? 'Active Loans' : 'Completed Returns'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-3.5">Txn ID & Status</th>
              <th className="px-6 py-3.5">Book Details</th>
              <th className="px-6 py-3.5">Student</th>
              <th className="px-6 py-3.5">Issue Date</th>
              <th className="px-6 py-3.5">Due Date</th>
              <th className="px-6 py-3.5">Return Date</th>
              <th className="px-6 py-3.5 text-right">Fine Incurred</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredTxns.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <History className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                    <p className="text-sm font-semibold text-slate-600">No transaction records found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTxns.map((txn) => {
                const isActive = txn.status === 'ACTIVE';
                const isOverdue = txn.isOverdue;

                return (
                  <tr key={txn.transactionId} className="hover:bg-slate-50/70 transition-colors">
                    {/* Txn ID & Status */}
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs font-bold text-slate-800">{txn.transactionId}</div>
                      <div className="mt-1">
                        {isActive ? (
                          isOverdue ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertCircle className="w-3 h-3" />
                              Active (Overdue)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              <Clock className="w-3 h-3" />
                              Active Loan
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Returned
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Book Details */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 leading-snug">{txn.bookTitle || 'Book'}</div>
                      <div className="text-xs font-mono text-slate-400">ID: {txn.bookId}</div>
                    </td>

                    {/* Student */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{txn.memberName}</div>
                      <div className="text-xs font-mono text-slate-400">{txn.memberId}</div>
                    </td>

                    {/* Issue Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-600">
                      {new Date(txn.issueDate).toLocaleDateString()}
                    </td>

                    {/* Due Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono">
                      <span className={isOverdue && isActive ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                        {new Date(txn.dueDate).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Return Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-600">
                      {txn.returnDate ? (
                        new Date(txn.returnDate).toLocaleDateString()
                      ) : (
                        <span className="text-slate-400 italic">Not yet returned</span>
                      )}
                    </td>

                    {/* Fine Amount */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {txn.fineAmount > 0 ? (
                        <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                          {formatINR(txn.fineAmount)}
                        </span>
                      ) : isActive && txn.currentPotentialFine > 0 ? (
                        <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs border border-amber-200" title="Accrued pending fine">
                          {formatINR(txn.currentPotentialFine)} (accruing)
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">{formatINR(0)}</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
