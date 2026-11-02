import { Book } from '../models/Book';
import { Student } from '../models/Student';
import { Transaction } from '../models/Transaction';
import {
  BookNotFoundException,
  BookAlreadyIssuedException,
  BookNotIssuedException,
  MemberNotFoundException,
  DuplicateEntityException,
  ValidationException
} from '../models/Exceptions';

const STORAGE_KEYS = {
  BOOKS: 'libricore_books_v1',
  STUDENTS: 'libricore_students_v1',
  TRANSACTIONS: 'libricore_transactions_v1',
  CONFIG: 'libricore_config_v1'
};

/**
 * Service Class: LibraryManager
 * Central Controller demonstrating OOP Collections, Domain Services, and Data Layer Abstraction.
 * Manages the in-memory Object collection while synchronizing with LocalStorage.
 */
export class LibraryManager {
  #books = new Map();         // Key: bookId (string) -> Book instance
  #students = new Map();      // Key: studentId (string) -> Student instance
  #transactions = [];         // Array of Transaction instances
  #dailyFineRate = 1.0;       // ₹1.00 per day overdue

  constructor() {
    this.#loadFromStorage();
    if (this.#books.size === 0 && this.#students.size === 0) {
      this.#seedInitialData();
    }
  }

  // ==========================================
  // CONFIGURATION & FINES
  // ==========================================
  getDailyFineRate() {
    return this.#dailyFineRate;
  }

  setDailyFineRate(rate) {
    const parsed = parseFloat(rate);
    if (isNaN(parsed) || parsed < 0) {
      throw new ValidationException('fineRate', 'Fine rate must be a positive number.');
    }
    this.#dailyFineRate = parsed;
    this.#saveToStorage();
  }

  // ==========================================
  // BOOK MANAGEMENT
  // ==========================================

  /**
   * Adds a new Book to the library catalog.
   * Throws DuplicateEntityException if ID is already registered.
   */
  addBook({ id, title, author, genre, isbn, publishedYear }) {
    const cleanId = (id || '').trim().toUpperCase();
    if (!cleanId) {
      throw new ValidationException('id', 'Book ID is required.');
    }
    if (this.#books.has(cleanId)) {
      throw new DuplicateEntityException('Book', cleanId);
    }

    const newBook = new Book(cleanId, title, author, genre, 'Available', isbn, publishedYear);
    this.#books.set(cleanId, newBook);
    this.#saveToStorage();
    return newBook;
  }

  /**
   * Returns all books as summaries for UI consumption
   */
  getAllBooks() {
    return Array.from(this.#books.values()).map(book => book.getSummary());
  }

  /**
   * Search and filter books by ID, Title, Author, Genre, or Status
   */
  searchBooks(query = '', genre = 'ALL', status = 'ALL') {
    const q = query.trim().toLowerCase();
    
    return Array.from(this.#books.values())
      .filter(book => {
        // Text search across ID, Title, Author
        const matchesQuery = !q || 
          book.getId().toLowerCase().includes(q) ||
          book.getTitle().toLowerCase().includes(q) ||
          book.getAuthor().toLowerCase().includes(q);

        // Genre filter
        const matchesGenre = genre === 'ALL' || book.getGenre().toLowerCase() === genre.toLowerCase();

        // Status filter
        const matchesStatus = status === 'ALL' || book.getStatus().toLowerCase() === status.toLowerCase();

        return matchesQuery && matchesGenre && matchesStatus;
      })
      .map(book => book.getSummary());
  }

  /**
   * Retrieves a single Book instance by its unique identifier
   */
  findBook(bookId) {
    const cleanId = (bookId || '').trim().toUpperCase();
    const book = this.#books.get(cleanId);
    if (!book) {
      throw new BookNotFoundException(cleanId);
    }
    return book;
  }

  /**
   * Deletes a book from the catalog.
   * Throws exception if book is currently issued.
   */
  deleteBook(bookId) {
    const book = this.findBook(bookId);
    if (!book.isAvailable()) {
      throw new ValidationException(
        'delete',
        `Cannot delete "${book.getTitle()}" because it is currently issued to a student.`
      );
    }
    this.#books.delete(book.getId());
    this.#saveToStorage();
    return true;
  }

  // ==========================================
  // STUDENT / MEMBER MANAGEMENT
  // ==========================================

  /**
   * Enrolls a new student member.
   */
  addStudent({ id, name, email, department, maxBorrowLimit }) {
    const cleanId = (id || '').trim().toUpperCase();
    if (!cleanId) {
      throw new ValidationException('id', 'Student ID is required.');
    }
    if (this.#students.has(cleanId)) {
      throw new DuplicateEntityException('Student', cleanId);
    }

    const student = new Student(cleanId, name, email, department, maxBorrowLimit);
    this.#students.set(cleanId, student);
    this.#saveToStorage();
    return student;
  }

  /**
   * Returns all registered students
   */
  getAllStudents() {
    return Array.from(this.#students.values()).map(student => student.getDetails());
  }

  /**
   * Retrieves a single student instance
   */
  findStudent(studentId) {
    const cleanId = (studentId || '').trim().toUpperCase();
    const student = this.#students.get(cleanId);
    if (!student) {
      throw new MemberNotFoundException(cleanId);
    }
    return student;
  }

  // ==========================================
  // ISSUE & RETURN WORKFLOWS (CORE OOP)
  // ==========================================

  /**
   * Issues a book to a registered student.
   * Demonstrates complete business logic and validation:
   * 1. Validates book existence
   * 2. Checks book availability status (throws BookAlreadyIssuedException)
   * 3. Validates student existence
   * 4. Enforces student borrowing quota (throws MaxBorrowLimitExceededException)
   * 5. Atomically updates book, student, and creates audit Transaction record.
   */
  issueBook(bookId, studentId, customDueDate = null) {
    // 1. Locate and validate Book
    const book = this.findBook(bookId);
    if (!book.isAvailable()) {
      const currentIssue = book.getIssuedTo();
      throw new BookAlreadyIssuedException(
        book.getTitle(),
        currentIssue ? `${currentIssue.studentName} (${currentIssue.studentId})` : 'another student'
      );
    }

    // 2. Locate and validate Student
    const student = this.findStudent(studentId);
    if (!student.canBorrow()) {
      throw new ValidationException(
        'borrowLimit',
        `${student.getName()} has reached the maximum borrowing limit of ${student.getMaxBorrowLimit()} books.`
      );
    }

    // 3. Calculate Dates
    const issueDate = new Date().toISOString();
    let dueDateISO;
    if (customDueDate) {
      dueDateISO = new Date(customDueDate).toISOString();
    } else {
      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 14); // 14-day standard borrowing period
      dueDateISO = defaultDue.toISOString();
    }

    // 4. Update Book Model state
    book.markAsIssued(student.getId(), student.getName(), issueDate, dueDateISO);

    // 5. Update Student Model state
    student.borrowBook(book.getId());

    // 6. Create Transaction Audit Record
    const transactionId = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const transaction = new Transaction({
      transactionId,
      bookId: book.getId(),
      bookTitle: book.getTitle(),
      memberId: student.getId(),
      memberName: student.getName(),
      issueDate,
      dueDate: dueDateISO,
      status: 'ACTIVE'
    });

    this.#transactions.unshift(transaction); // Prepend so most recent is first
    this.#saveToStorage();

    return {
      success: true,
      transaction: transaction.getSummary(this.#dailyFineRate),
      book: book.getSummary(),
      student: student.getDetails()
    };
  }

  /**
   * Returns an issued book back into library circulation.
   * Calculates late return penalty if returned past due date.
   */
  returnBook(bookId, returnDate = new Date().toISOString()) {
    // 1. Validate Book
    const book = this.findBook(bookId);
    if (book.isAvailable()) {
      throw new BookNotIssuedException(book.getTitle());
    }

    const issuedInfo = book.getIssuedTo();
    const studentId = issuedInfo ? issuedInfo.studentId : null;

    // 2. Update Student Record
    if (studentId && this.#students.has(studentId)) {
      const student = this.#students.get(studentId);
      student.returnBook(book.getId());
    }

    // 3. Locate Active Transaction
    const activeTxn = this.#transactions.find(
      txn => txn.getBookId() === book.getId() && txn.isActive()
    );

    let fineBreakdown = { isOverdue: false, daysOverdue: 0, fineAmount: 0 };
    if (activeTxn) {
      fineBreakdown = activeTxn.closeTransaction(returnDate, this.#dailyFineRate);
    }

    // 4. Update Book Model state
    book.markAsReturned();

    this.#saveToStorage();

    return {
      success: true,
      book: book.getSummary(),
      fineBreakdown,
      transaction: activeTxn ? activeTxn.getSummary(this.#dailyFineRate) : null
    };
  }

  // ==========================================
  // TRANSACTIONS & AUDIT TRAIL
  // ==========================================
  getAllTransactions() {
    return this.#transactions.map(txn => txn.getSummary(this.#dailyFineRate));
  }

  // ==========================================
  // DASHBOARD ANALYTICS
  // ==========================================
  getDashboardStats() {
    const books = Array.from(this.#books.values());
    const students = Array.from(this.#students.values());
    
    const totalBooks = books.length;
    const issuedBooks = books.filter(b => !b.isAvailable()).length;
    const availableBooks = totalBooks - issuedBooks;
    const totalStudents = students.length;

    let activeLoans = 0;
    let overdueLoans = 0;
    let totalFinesCollected = 0;
    let pendingFines = 0;

    for (const txn of this.#transactions) {
      if (txn.isActive()) {
        activeLoans++;
        const fine = txn.calculateFine(this.#dailyFineRate);
        if (fine.isOverdue) {
          overdueLoans++;
          pendingFines += fine.fineAmount;
        }
      } else {
        totalFinesCollected += txn.getFineAmount();
      }
    }

    return {
      totalBooks,
      availableBooks,
      issuedBooks,
      totalStudents,
      activeLoans,
      overdueLoans,
      totalFinesCollected,
      pendingFines,
      dailyFineRate: this.#dailyFineRate
    };
  }

  // ==========================================
  // LOCALSTORAGE PERSISTENCE & HYDRATION
  // ==========================================
  #saveToStorage() {
    try {
      const serializedBooks = Array.from(this.#books.values()).map(b => b.toJSON());
      const serializedStudents = Array.from(this.#students.values()).map(s => s.toJSON());
      const serializedTxns = this.#transactions.map(t => t.toJSON());

      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(serializedBooks));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(serializedStudents));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(serializedTxns));
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify({ dailyFineRate: this.#dailyFineRate }));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  #loadFromStorage() {
    try {
      const rawBooks = localStorage.getItem(STORAGE_KEYS.BOOKS);
      const rawStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      const rawTxns = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const rawConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);

      if (rawConfig) {
        const config = JSON.parse(rawConfig);
        if (config.dailyFineRate) this.#dailyFineRate = config.dailyFineRate;
      }

      if (rawBooks) {
        const parsed = JSON.parse(rawBooks);
        this.#books.clear();
        parsed.forEach(item => {
          const bookInstance = Book.fromJSON(item);
          if (bookInstance) {
            this.#books.set(bookInstance.getId(), bookInstance);
          }
        });
      }

      if (rawStudents) {
        const parsed = JSON.parse(rawStudents);
        this.#students.clear();
        parsed.forEach(item => {
          const studentInstance = Student.fromJSON(item);
          if (studentInstance) {
            this.#students.set(studentInstance.getId(), studentInstance);
          }
        });
      }

      if (rawTxns) {
        const parsed = JSON.parse(rawTxns);
        this.#transactions = parsed
          .map(item => Transaction.fromJSON(item))
          .filter(Boolean);
      }
    } catch (e) {
      console.warn('Could not parse stored library data, starting fresh.', e);
    }
  }

  /**
   * Resets and populates initial sample data for demonstration
   */
  resetToSampleData() {
    localStorage.removeItem(STORAGE_KEYS.BOOKS);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    this.#books.clear();
    this.#students.clear();
    this.#transactions = [];
    this.#seedInitialData();
  }

  #seedInitialData() {
    // 1. Initial Books
    const sampleBooks = [
      new Book('BK-101', 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', 'Computer Science', 'Available', '978-0132350884', 2008),
      new Book('BK-102', 'Introduction to Algorithms (CLRS)', 'Thomas H. Cormen', 'Algorithms', 'Available', '978-0262033848', 2009),
      new Book('BK-103', 'Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma et al.', 'Software Engineering', 'Available', '978-0201633610', 1994),
      new Book('BK-104', 'Artificial Intelligence: A Modern Approach', 'Stuart Russell & Peter Norvig', 'AI & Robotics', 'Available', '978-0136042594', 2020),
      new Book('BK-105', 'Database System Concepts (7th Edition)', 'Abraham Silberschatz', 'Database Systems', 'Available', '978-0078022159', 2019),
      new Book('BK-106', 'Operating System Concepts', 'Abraham Silberschatz & Peter B. Galvin', 'Operating Systems', 'Available', '978-1118063330', 2018),
      new Book('BK-107', 'Computer Networking: A Top-Down Approach', 'James F. Kurose', 'Networking', 'Available', '978-0132856201', 2017),
      new Book('BK-108', 'Cracking the Coding Interview', 'Gayle Laakmann McDowell', 'Career & Prep', 'Available', '978-0984782857', 2015),
    ];

    sampleBooks.forEach(b => this.#books.set(b.getId(), b));

    // 2. Initial Students (Member instances inheriting from Person)
    const sampleStudents = [
      new Student('STU-2024-001', 'Alex Rivera', 'alex.rivera@university.edu', 'Computer Science', 3),
      new Student('STU-2024-002', 'Sophia Chen', 'sophia.chen@university.edu', 'Information Technology', 3),
      new Student('STU-2024-003', 'Marcus Johnson', 'marcus.j@university.edu', 'Software Engineering', 4),
      new Student('STU-2024-004', 'Priya Sharma', 'priya.sharma@university.edu', 'Data Science', 3),
      new Student('STU-2024-005', 'Liam Gallagher', 'liam.g@university.edu', 'Cybersecurity', 3)
    ];

    sampleStudents.forEach(s => this.#students.set(s.getId(), s));

    // 3. Issue a couple books for realistic active state and demonstration
    // Loan 1: Clean Code issued to Alex Rivera (Active, normal due date)
    const alex = sampleStudents[0];
    const cleanCode = sampleBooks[0];
    const issueDate1 = new Date();
    issueDate1.setDate(issueDate1.getDate() - 5);
    const dueDate1 = new Date();
    dueDate1.setDate(dueDate1.getDate() + 9);

    cleanCode.markAsIssued(alex.getId(), alex.getName(), issueDate1.toISOString(), dueDate1.toISOString());
    alex.borrowBook(cleanCode.getId());
    this.#transactions.push(
      new Transaction({
        transactionId: 'TXN-INIT-001',
        bookId: cleanCode.getId(),
        bookTitle: cleanCode.getTitle(),
        memberId: alex.getId(),
        memberName: alex.getName(),
        issueDate: issueDate1.toISOString(),
        dueDate: dueDate1.toISOString(),
        status: 'ACTIVE'
      })
    );

    // Loan 2: Database System Concepts issued to Sophia Chen (Overdue loan to showcase fine calculation!)
    const sophia = sampleStudents[1];
    const dbBook = sampleBooks[4];
    const issueDate2 = new Date();
    issueDate2.setDate(issueDate2.getDate() - 20); // issued 20 days ago
    const dueDate2 = new Date();
    dueDate2.setDate(dueDate2.getDate() - 6); // overdue by 6 days!

    dbBook.markAsIssued(sophia.getId(), sophia.getName(), issueDate2.toISOString(), dueDate2.toISOString());
    sophia.borrowBook(dbBook.getId());
    this.#transactions.push(
      new Transaction({
        transactionId: 'TXN-INIT-002',
        bookId: dbBook.getId(),
        bookTitle: dbBook.getTitle(),
        memberId: sophia.getId(),
        memberName: sophia.getName(),
        issueDate: issueDate2.toISOString(),
        dueDate: dueDate2.toISOString(),
        status: 'ACTIVE'
      })
    );

    // Loan 3: Returned transaction to show completed log
    const returnTxn = new Transaction({
      transactionId: 'TXN-INIT-000',
      bookId: 'BK-102',
      bookTitle: 'Introduction to Algorithms (CLRS)',
      memberId: 'STU-2024-003',
      memberName: 'Marcus Johnson',
      issueDate: new Date(Date.now() - 30 * 86400000).toISOString(),
      dueDate: new Date(Date.now() - 16 * 86400000).toISOString(),
      returnDate: new Date(Date.now() - 14 * 86400000).toISOString(),
      fineAmount: 2.0, // 2 days late fine
      status: 'RETURNED'
    });
    this.#transactions.push(returnTxn);

    this.#saveToStorage();
  }
}

// Export singleton instance for seamless app state management
export const libraryManager = new LibraryManager();
