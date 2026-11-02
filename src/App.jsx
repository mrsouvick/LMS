import React, { useState, useEffect, useCallback } from 'react';
import { libraryManager } from './services/LibraryManager';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { StatsCard } from './components/StatsCard';
import { BookTable } from './components/BookTable';
import { StudentTable } from './components/StudentTable';
import { TransactionTable } from './components/TransactionTable';
import { IssueBookModal } from './components/IssueBookModal';
import { ReturnBookModal } from './components/ReturnBookModal';
import { AddBookModal } from './components/AddBookModal';
import { AddStudentModal } from './components/AddStudentModal';
import { LoginScreen } from './components/LoginScreen';
import { formatINR } from './utils/currency';

import {
  BookOpen,
  CheckCircle2,
  Clock,
  Users,
  AlertTriangle,
  ArrowLeftRight,
  Plus,
  UserPlus,
  Coins,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data state
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);

  // Modal states
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isIssueBookOpen, setIsIssueBookOpen] = useState(false);
  const [isReturnBookOpen, setIsReturnBookOpen] = useState(false);
  const [preselectedBook, setPreselectedBook] = useState(null);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', title = '') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Reload data from LibraryManager singleton
  const refreshData = useCallback(() => {
    setBooks(libraryManager.getAllBooks());
    setStudents(libraryManager.getAllStudents());
    setTransactions(libraryManager.getAllTransactions());
    setStats(libraryManager.getDashboardStats());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // ==========================================
  // HANDLERS (OOP SERVICE INVOCATIONS WITH TRY/CATCH)
  // ==========================================

  const handleAddBook = (bookData) => {
    try {
      const newBook = libraryManager.addBook(bookData);
      refreshData();
      addToast(
        `"${newBook.getTitle()}" (ID: ${newBook.getId()}) was added to catalog.`,
        'success',
        'Book Added'
      );
    } catch (err) {
      addToast(err.message || 'Error adding book', 'error', 'Operation Failed');
      throw err;
    }
  };

  const handleAddStudent = (studentData) => {
    try {
      const newStudent = libraryManager.addStudent(studentData);
      refreshData();
      addToast(
        `${newStudent.getName()} (ID: ${newStudent.getId()}) is now enrolled.`,
        'success',
        'Student Enrolled'
      );
    } catch (err) {
      addToast(err.message || 'Error enrolling student', 'error', 'Operation Failed');
      throw err;
    }
  };

  const handleOpenIssue = (book = null) => {
    setPreselectedBook(book);
    setIsIssueBookOpen(true);
  };

  const handleOpenReturn = (book = null) => {
    setPreselectedBook(book);
    setIsReturnBookOpen(true);
  };

  const handleIssueBook = (bookId, studentId, dueDate) => {
    try {
      const res = libraryManager.issueBook(bookId, studentId, dueDate);
      refreshData();
      addToast(
        `Issued "${res.book.title}" to ${res.student.name}. Due on ${new Date(res.transaction.dueDate).toLocaleDateString()}.`,
        'success',
        'Book Issued Successfully'
      );
    } catch (err) {
      addToast(err.message || 'Could not issue book', 'error', 'Issue Failed');
      throw err;
    }
  };

  const handleReturnBook = (bookId, returnDate) => {
    try {
      const res = libraryManager.returnBook(bookId, returnDate);
      refreshData();

      if (res.fineBreakdown && res.fineBreakdown.isOverdue) {
        addToast(
          `"${res.book.title}" returned (${res.fineBreakdown.daysOverdue} days late). Assessed Fine: ${formatINR(res.fineBreakdown.fineAmount)}.`,
          'warning',
          'Returned with Overdue Penalty'
        );
      } else {
        addToast(
          `"${res.book.title}" has been returned to available catalog with ${formatINR(0)} fine.`,
          'success',
          'Return Successful'
        );
      }
    } catch (err) {
      addToast(err.message || 'Could not return book', 'error', 'Return Failed');
      throw err;
    }
  };

  const handleDeleteBook = (bookId, bookTitle, isAvail) => {
    if (!isAvail) {
      addToast(`Cannot delete "${bookTitle}" because it is currently issued to a student.`, 'error', 'Action Prevented');
      return;
    }
    if (window.confirm(`Are you sure you want to remove "${bookTitle}" (${bookId}) from catalog?`)) {
      try {
        libraryManager.deleteBook(bookId);
        refreshData();
        addToast(`"${bookTitle}" was deleted from inventory.`, 'info', 'Book Deleted');
      } catch (err) {
        addToast(err.message || 'Error deleting book', 'error', 'Delete Failed');
      }
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset database to clean university demo data (preloaded books and loans)?')) {
      libraryManager.resetToSampleData();
      refreshData();
      addToast('Reset catalog to sample university demonstration dataset.', 'info', 'Database Reset');
    }
  };

  // Tab Title helper
  const getTabTitle = () => {
    switch (currentTab) {
      case 'books': return 'Books Catalog & Inventory';
      case 'circulation': return 'Issue & Return Circulation Desk';
      case 'students': return 'Student & Member Directory';
      case 'transactions': return 'Loan Audit Trail & Transactions';
      default: return 'Library Overview & Dashboard';
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onSignIn={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Responsive Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        stats={stats}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          onMenuToggle={() => setSidebarOpen(true)}
          title={getTabTitle()}
          onOpenAddBook={() => setIsAddBookOpen(true)}
          onOpenIssueBook={() => handleOpenIssue(null)}
          onResetData={handleResetData}
          onLogout={() => setIsAuthenticated(false)}
        />

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* DASHBOARD TAB */}
          {currentTab === 'dashboard' && stats && (
            <div className="space-y-6">
              {/* Welcome / Quick Action Banner */}
              <div className="bg-gradient-to-br from-slate-950 via-blue-900 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-950/20 relative overflow-hidden border border-white/10">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100 mb-4 border border-white/10">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Budge Budge Institute of Technology</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                    A calmer, smarter library desk for every reader
                  </h2>
                  <p className="mt-2 text-sm text-blue-100/90 leading-relaxed max-w-xl">
                    Keep the Budge Budge Institute of Technology library organized with a clear view of books, borrowers, returns, and overdue fines.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => handleOpenIssue(null)}
                      className="px-5 py-2.5 text-xs sm:text-sm font-bold text-blue-900 bg-white hover:bg-blue-50 rounded-xl transition-all shadow-md flex items-center gap-2"
                    >
                      <ArrowLeftRight className="w-4 h-4 text-blue-700" />
                      <span>Issue a Book</span>
                    </button>

                    <button
                      onClick={() => setIsAddBookOpen(true)}
                      className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-500/40 hover:bg-blue-500/60 border border-white/20 rounded-xl transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Book</span>
                    </button>

                    <button
                      onClick={() => setIsAddStudentOpen(true)}
                      className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-500/40 hover:bg-blue-500/60 border border-white/20 rounded-xl transition-all flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Enroll Student</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Books"
                  value={stats.totalBooks}
                  subtitle="Cataloged in library"
                  icon={BookOpen}
                  color="blue"
                />
                <StatsCard
                  title="Available Books"
                  value={stats.availableBooks}
                  subtitle="Ready on shelves"
                  icon={CheckCircle2}
                  color="emerald"
                />
                <StatsCard
                  title="Active Loans"
                  value={stats.activeLoans}
                  subtitle={`${stats.overdueLoans} currently overdue`}
                  icon={Clock}
                  color={stats.overdueLoans > 0 ? 'rose' : 'amber'}
                />
                <StatsCard
                  title="Registered Students"
                  value={stats.totalStudents}
                  subtitle="Authorized borrowers"
                  icon={Users}
                  color="indigo"
                />
              </div>

              {/* Secondary Metrics / Quick Glance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Late Fine Rate</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{formatINR(stats.dailyFineRate)} <span className="text-sm font-semibold text-slate-500">/ day</span></div>
                    <p className="text-xs text-slate-400 mt-0.5">Applied on past-due returns</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                    <Coins className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fines Collected</span>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">{formatINR(stats.totalFinesCollected)}</div>
                    <p className="text-xs text-slate-400 mt-0.5">Cleared returned penalties</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue Alerts</span>
                    <div className="text-2xl font-bold text-rose-600 mt-1">{stats.overdueLoans} Loans</div>
                    <p className="text-xs text-rose-500 font-medium mt-0.5">{formatINR(stats.pendingFines)} pending fine</p>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Active Issued Books Section */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Active Library Loans</h3>
                    <p className="text-xs text-slate-500">Books currently in circulation with students</p>
                  </div>
                  <button
                    onClick={() => setCurrentTab('circulation')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>View Circulation Desk</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {books.filter(b => !b.isAvailable).length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    All books are currently in the library stacks.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {books.filter(b => !b.isAvailable).map(book => {
                      const issuedTo = book.issuedTo;
                      const dueDate = issuedTo ? new Date(issuedTo.dueDate) : null;
                      const isOverdue = dueDate && dueDate < new Date();

                      return (
                        <div
                          key={book.id}
                          className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-200">
                                {book.id}
                              </span>
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {isOverdue ? 'Overdue' : 'Active Loan'}
                              </span>
                            </div>
                            <div className="font-semibold text-slate-900 text-sm leading-snug">{book.title}</div>
                            <div className="text-xs text-slate-600">
                              Issued to: <strong>{issuedTo?.studentName}</strong> ({issuedTo?.studentId})
                            </div>
                            {dueDate && (
                              <div className={`text-xs font-mono ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                                Due: {dueDate.toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleOpenReturn(book)}
                            className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all flex items-center gap-1 flex-shrink-0"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>Return</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Books Inventory Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Books Catalog (Quick View)</h3>
                  <button
                    onClick={() => setCurrentTab('books')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Open Full Inventory Table →
                  </button>
                </div>
                <BookTable
                  books={books}
                  onIssueBook={handleOpenIssue}
                  onReturnBook={handleOpenReturn}
                  onDeleteBook={handleDeleteBook}
                  onAddNewBook={() => setIsAddBookOpen(true)}
                />
              </div>
            </div>
          )}

          {/* BOOKS INVENTORY TAB */}
          {currentTab === 'books' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Library Book Repository</h2>
                  <p className="text-xs text-slate-500">Search by Title, ID, Author, or filter by category & availability</p>
                </div>
                <button
                  onClick={() => setIsAddBookOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Book</span>
                </button>
              </div>

              <BookTable
                books={books}
                onIssueBook={handleOpenIssue}
                onReturnBook={handleOpenReturn}
                onDeleteBook={handleDeleteBook}
                onAddNewBook={() => setIsAddBookOpen(true)}
              />
            </div>
          )}

          {/* ISSUE & RETURN DESK TAB */}
          {currentTab === 'circulation' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Issue Desk Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                      <ArrowLeftRight className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Issue Book Desk</h3>
                      <p className="text-xs text-slate-500">Checkout a textbook to an eligible enrolled student</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Automates checking student quotas (maximum borrow limits), checks for availability exceptions, and schedules the return due date.
                  </p>
                  <button
                    onClick={() => handleOpenIssue(null)}
                    className="w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs"
                  >
                    Open Issue Book Terminal
                  </button>
                </div>

                {/* Return Desk Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                      <ArrowUpRight className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Return & Fines Desk</h3>
                      <p className="text-xs text-slate-500">Check-in returned books and calculate late fees</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Automatically compares return timestamp against the due date to compute overdue days and penalty amount at {formatINR(stats?.dailyFineRate)}/day.
                  </p>
                  <button
                    onClick={() => handleOpenReturn(null)}
                    className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs"
                  >
                    Open Return Book Terminal
                  </button>
                </div>
              </div>

              {/* Outstanding Loans Table */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">Current Outstanding Loans</h3>
                <TransactionTable
                  transactions={transactions.filter(t => t.status === 'ACTIVE')}
                  dailyFineRate={stats?.dailyFineRate || 1.0}
                />
              </div>
            </div>
          )}

          {/* STUDENTS / MEMBERS TAB */}
          {currentTab === 'students' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Student & Member Directory</h2>
                  <p className="text-xs text-slate-500">
                    Demonstrates OOP Inheritance: Student inherits from base Person class
                  </p>
                </div>
                <button
                  onClick={() => setIsAddStudentOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Enroll New Student</span>
                </button>
              </div>

              <StudentTable
                students={students}
                onAddNewStudent={() => setIsAddStudentOpen(true)}
              />
            </div>
          )}

          {/* TRANSACTIONS AUDIT TRAIL TAB */}
          {currentTab === 'transactions' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Transaction Audit History</h2>
                <p className="text-xs text-slate-500">
                  Unalterable chronological ledger of all checkout, return, and fine assessments
                </p>
              </div>

              <TransactionTable
                transactions={transactions}
                dailyFineRate={stats?.dailyFineRate || 1.0}
              />
            </div>
          )}

        </main>
      </div>

      {/* MODALS */}
      <AddBookModal
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
        onAddBook={handleAddBook}
        existingBooks={books}
      />

      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onAddStudent={handleAddStudent}
        existingStudents={students}
      />

      <IssueBookModal
        isOpen={isIssueBookOpen}
        onClose={() => {
          setIsIssueBookOpen(false);
          setPreselectedBook(null);
        }}
        books={books}
        students={students}
        preselectedBook={preselectedBook}
        onConfirmIssue={handleIssueBook}
      />

      <ReturnBookModal
        isOpen={isReturnBookOpen}
        onClose={() => {
          setIsReturnBookOpen(false);
          setPreselectedBook(null);
        }}
        books={books}
        transactions={transactions}
        dailyFineRate={stats?.dailyFineRate || 1.0}
        preselectedBook={preselectedBook}
        onConfirmReturn={handleReturnBook}
      />
    </div>
  );
}
