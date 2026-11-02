import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { BookOpen, User, Calendar, AlertTriangle } from 'lucide-react';

export function IssueBookModal({
  isOpen,
  onClose,
  books = [],
  students = [],
  preselectedBook = null,
  onConfirmIssue
}) {
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Filter only available books for issue
  const availableBooks = books.filter(b => b.isAvailable);

  useEffect(() => {
    if (preselectedBook) {
      setSelectedBookId(preselectedBook.id);
    } else if (availableBooks.length > 0 && !selectedBookId) {
      setSelectedBookId(availableBooks[0].id);
    }

    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }

    // Default due date: 14 days from today
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setDueDate(d.toISOString().split('T')[0]);
    setErrorMsg('');
  }, [isOpen, preselectedBook, students, availableBooks]);

  const currentStudent = students.find(s => s.id === selectedStudentId);
  const currentBook = books.find(b => b.id === selectedBookId);
  const studentAtLimit = currentStudent && currentStudent.borrowedCount >= currentStudent.maxBorrowLimit;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedBookId) {
      setErrorMsg('Please select a book to issue.');
      return;
    }
    if (!selectedStudentId) {
      setErrorMsg('Please select a registered student.');
      return;
    }
    if (studentAtLimit) {
      setErrorMsg(`${currentStudent.name} has already reached their maximum borrow limit (${currentStudent.maxBorrowLimit} books).`);
      return;
    }

    try {
      onConfirmIssue(selectedBookId, selectedStudentId, dueDate);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to issue book');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Book to Student"
      subtitle="Complete book checkout with automated due date and borrowing limit tracking."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Book Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Select Book to Issue
          </label>
          <div className="relative">
            <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {availableBooks.length === 0 ? (
                <option value="">No available books to issue</option>
              ) : (
                availableBooks.map(b => (
                  <option key={b.id} value={b.id}>
                    [{b.id}] {b.title} ({b.author})
                  </option>
                ))
              )}
            </select>
          </div>
          {currentBook && (
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Genre: {currentBook.genre} • Published: {currentBook.publishedYear}
            </p>
          )}
        </div>

        {/* Student Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Select Student (Member)
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  [{s.id}] {s.name} — {s.department} (Active: {s.borrowedCount}/{s.maxBorrowLimit})
                </option>
              ))}
            </select>
          </div>

          {currentStudent && (
            <div className={`mt-2 p-2.5 rounded-xl border text-xs flex items-center justify-between ${
              studentAtLimit 
                ? 'bg-rose-50 border-rose-200 text-rose-700' 
                : 'bg-blue-50/60 border-blue-100 text-blue-800'
            }`}>
              <span>Current Loans: <strong>{currentStudent.borrowedCount} of {currentStudent.maxBorrowLimit}</strong></span>
              <span>Quota remaining: <strong>{Math.max(0, currentStudent.maxBorrowLimit - currentStudent.borrowedCount)} books</strong></span>
            </div>
          )}
        </div>

        {/* Due Date Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Return Due Date (Default: 14 Days)
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              value={dueDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
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
            disabled={availableBooks.length === 0 || studentAtLimit}
            className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm shadow-blue-500/25"
          >
            Confirm Issue Book
          </button>
        </div>
      </form>
    </Modal>
  );
}
