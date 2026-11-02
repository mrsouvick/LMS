import React, { useState } from 'react';
import { ShieldCheck, GitFork, Database, AlertOctagon, CheckCircle2, Copy } from 'lucide-react';

export function OopDocModal() {
  const [activeTab, setActiveTab] = useState('inheritance');
  const [copied, setCopied] = useState(false);

  const sections = {
    inheritance: {
      title: '1. Inheritance (Person → Student)',
      icon: GitFork,
      color: 'blue',
      description: 'The Student class extends the base Person class, inheriting personal attributes (id, name, email) while adding student-specific properties and behaviors (department, borrow quotas, issued books).',
      code: `// Base Class
export class Person {
  #id; #name; #email;
  constructor(id, name, email) {
    this.setId(id);
    this.setName(name);
    this.setEmail(email);
  }
  getId() { return this.#id; }
  getDetails() { return { id: this.#id, name: this.#name, email: this.#email }; }
}

// Derived Class demonstrating OOP Inheritance
export class Student extends Person {
  #department;
  #issuedBooks = [];
  #maxBorrowLimit;

  constructor(id, name, email, department, maxBorrowLimit = 3) {
    super(id, name, email); // Calls parent Person constructor
    this.#department = department;
    this.#maxBorrowLimit = maxBorrowLimit;
  }

  // Polymorphic method override
  getDetails() {
    return {
      ...super.getDetails(),
      department: this.#department,
      borrowedCount: this.#issuedBooks.length
    };
  }
}`
    },
    encapsulation: {
      title: '2. Encapsulation (Data Hiding & Validation)',
      icon: ShieldCheck,
      color: 'emerald',
      description: 'Private class properties (#id, #status, #issuedTo) prevent unauthorized external mutation. Access and mutations are gated through validated getters and setters.',
      code: `export class Book {
  #id;
  #title;
  #status;   // 'Available' | 'Issued'
  #issuedTo; // Encapsulated borrower object

  constructor(id, title, author, genre) {
    this.setId(id);
    this.setTitle(title);
    this.#status = 'Available';
    this.#issuedTo = null;
  }

  // Encapsulated state transition method
  markAsIssued(studentId, studentName, issueDate, dueDate) {
    if (!this.isAvailable()) {
      throw new BookAlreadyIssuedException(this.#title);
    }
    this.#status = 'Issued';
    this.#issuedTo = { studentId, studentName, issueDate, dueDate };
  }

  isAvailable() {
    return this.#status === 'Available';
  }
}`
    },
    collections: {
      title: '3. Collections (In-Memory Maps & Arrays)',
      icon: Database,
      color: 'indigo',
      description: 'Demonstrates modern data structures (ES6 Map and Array) for managing Book and Student objects with O(1) lookups and transaction list streams.',
      code: `export class LibraryManager {
  // Collections of OOP Domain Objects
  #books = new Map();         // Map<string, Book> for O(1) catalog search
  #students = new Map();      // Map<string, Student> for member lookups
  #transactions = [];         // Array<Transaction> chronological audit log

  addBook(data) {
    if (this.#books.has(data.id)) {
      throw new DuplicateEntityException('Book', data.id);
    }
    const newBook = new Book(data.id, data.title, data.author, data.genre);
    this.#books.set(newBook.getId(), newBook);
    this.#saveToStorage();
  }

  getAllBooks() {
    return Array.from(this.#books.values()).map(b => b.getSummary());
  }
}`
    },
    exceptions: {
      title: '4. Custom Exception Hierarchy (Try/Catch)',
      icon: AlertOctagon,
      color: 'rose',
      description: 'Custom domain exceptions inherit from Javascript Error, enabling precise error handling when issuing books, validating limits, or looking up records.',
      code: `// Custom Domain Error Base
export class LibraryException extends Error {
  constructor(message, code) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

// Specific Subclasses
export class BookAlreadyIssuedException extends LibraryException {
  constructor(bookTitle) {
    super(\`Cannot issue "\${bookTitle}". Already checked out.\`, 'BOOK_ALREADY_ISSUED');
  }
}

// Exception Handling in Issue Workflow:
try {
  libraryManager.issueBook(bookId, studentId);
  showToast('Book issued successfully', 'success');
} catch (error) {
  if (error instanceof BookAlreadyIssuedException) {
    showToast(error.message, 'warning');
  } else {
    showToast(error.message, 'error');
  }
}`
    }
  };

  const current = sections[activeTab];
  const Icon = current.icon;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20">
            <GitFork className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Object-Oriented Programming (OOP) Architecture
            </h2>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              This system is built from the ground up to demonstrate all 4 pillars of Object-Oriented Programming:
              <strong> Inheritance</strong>, <strong>Encapsulation</strong>, <strong>Collections</strong>, and 
              <strong> Custom Exception Handling</strong>. Review the live code structures below for your project viva / documentation.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {Object.entries(sections).map(([key, sec]) => {
          const TabIcon = sec.icon;
          const isActive = activeTab === key;

          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-white border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <TabIcon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-blue-700' : 'text-slate-500'}`}>
                  {key}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-800 truncate">
                {sec.title.split(' ')[1]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Icon className="w-5 h-5 text-blue-600" />
              <span>{current.title}</span>
            </h3>
            <p className="text-sm text-slate-600 mt-1">{current.description}</p>
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg transition-all"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Snippet */}
        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto">
          <pre>{current.code}</pre>
        </div>
      </div>
    </div>
  );
}
