import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { BookOpen, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../utils/currency';

export function ReturnBookModal({
  isOpen,
  onClose,
  books = [],
  transactions = [],
  dailyFineRate = 1.0,
  preselectedBook = null,
  onConfirmReturn
}) {
  const [selectedBookId, setSelectedBookId] = useState('');
  const [returnDate, setReturnDate] = useState('');

  // Only currently issued books can be returned
  const issuedBooks = books.filter(b => !b.isAvailable);

  useEffect(() => {
    if (preselectedBook && !preselectedBook.isAvailable) {
      setSelectedBookId(preselectedBook.id);
    } else if (issuedBooks.length > 0 && !selectedBookId) {
      setSelectedBookId(issuedBooks[0].id);
    }
    setReturnDate(new Date().toISOString().split('T')[0]);
  }, [isOpen, preselectedBook, issuedBooks]);

  const currentBook = books.find(b => b.id === selectedBookId);
  const activeTxn = transactions.find(t => t.bookId === selectedBookId && t.status === 'ACTIVE');

  // Calculate live fine breakdown
  let isOverdue = false;
  let daysOverdue = 0;
  let totalFine = 0;

  if (activeTxn) {
    const dueObj = new Date(activeTxn.dueDate);
    const retObj = returnDate ? new Date(returnDate) : new Date();

    const d1 = new Date(dueObj.getFullYear(), dueObj.getMonth(), dueObj.getDate());
    const d2 = new Date(retObj.getFullYear(), retObj.getMonth(), retObj.getDate());

    const diffDays = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      isOverdue = true;
      daysOverdue = diffDays;
      totalFine = diffDays * dailyFineRate;
    }
  }

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!selectedBookId) return;
    onConfirmReturn(selectedBookId, returnDate);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Return Book & Process Fines"
      subtitle="Verify book inventory check-in and inspect automated late penalty fees."
    >
      <form onSubmit={handleReturnSubmit} className="space-y-4">
        {issuedBooks.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">All books are currently in the library!</p>
            <p className="text-xs text-slate-500 mt-1">There are no outstanding issued books to return.</p>
          </div>
        ) : (
          <>
            {/* Book Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Select Issued Book to Check-In
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {issuedBooks.map(b => (
                    <option key={b.id} value={b.id}>
                      [{b.id}] {b.title} (Issued to: {b.issuedTo?.studentName || 'Student'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Borrower Details Card */}
            {currentBook && currentBook.issuedTo && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Borrower:</span>
                  <span className="font-semibold text-slate-800">
                    {currentBook.issuedTo.studentName} ({currentBook.issuedTo.studentId})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Issue Date:</span>
                  <span className="font-mono text-slate-700">
                    {new Date(currentBook.issuedTo.issueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Expected Due Date:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {new Date(currentBook.issuedTo.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            {/* Return Date Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Effective Return Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Late Fine Assessment Box */}
            <div className={`p-4 rounded-xl border transition-all ${
              isOverdue 
                ? 'bg-rose-50 border-rose-200 text-rose-950' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-start gap-3">
                {isOverdue ? (
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-bold text-sm">
                    {isOverdue ? `Overdue Return Notice: ${daysOverdue} Days Late` : 'On-Time Return: No Fine Incurred'}
                  </div>
                  <div className="text-xs mt-1 leading-relaxed opacity-90">
                    {isOverdue ? (
                      <>
                        Book returned past the scheduled due date. Late fine is assessed at{' '}
                        <strong>{formatINR(dailyFineRate)}/day</strong>.
                      </>
                    ) : (
                      'This book was returned within the allowed loan period.'
                    )}
                  </div>

                  {isOverdue && (
                    <div className="mt-3 pt-2.5 border-t border-rose-200 flex items-center justify-between text-sm">
                      <span className="font-semibold text-rose-800">Total Penalty Fine Due:</span>
                      <span className="font-mono font-extrabold text-base text-rose-700">
                        {formatINR(totalFine)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm shadow-emerald-500/25 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Book Return</span>
              </button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
