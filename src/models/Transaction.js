import { ValidationException } from './Exceptions';

/**
 * Class: Transaction
 * Demonstrates:
 * 1. Business Logic Encapsulation: Handles issue timestamps, return timestamps, and late fine calculation.
 * 2. Audit Trail: Implements unalterable transaction history for all library loans.
 */
export class Transaction {
  #transactionId;
  #bookId;
  #bookTitle;
  #memberId;
  #memberName;
  #issueDate;
  #dueDate;
  #returnDate; // null if still active
  #fineAmount; // Late return fine in currency units
  #status; // 'ACTIVE' | 'RETURNED'

  constructor({
    transactionId,
    bookId,
    bookTitle = '',
    memberId,
    memberName = '',
    issueDate = new Date().toISOString(),
    dueDate,
    returnDate = null,
    fineAmount = 0,
    status = 'ACTIVE'
  }) {
    if (!transactionId) {
      throw new ValidationException('transactionId', 'Transaction ID is required.');
    }
    if (!bookId || !memberId) {
      throw new ValidationException('entities', 'Both Book ID and Member ID are required.');
    }

    this.#transactionId = transactionId;
    this.#bookId = bookId;
    this.#bookTitle = bookTitle;
    this.#memberId = memberId;
    this.#memberName = memberName;
    this.#issueDate = issueDate;
    
    // Default due date: 14 days from issue date if not provided
    if (!dueDate) {
      const due = new Date(issueDate);
      due.setDate(due.getDate() + 14);
      this.#dueDate = due.toISOString();
    } else {
      this.#dueDate = dueDate;
    }

    this.#returnDate = returnDate;
    this.#fineAmount = Number(fineAmount) || 0;
    this.#status = status;
  }

  // --- Getters ---

  getTransactionId() {
    return this.#transactionId;
  }

  getBookId() {
    return this.#bookId;
  }

  getBookTitle() {
    return this.#bookTitle;
  }

  getMemberId() {
    return this.#memberId;
  }

  getMemberName() {
    return this.#memberName;
  }

  getIssueDate() {
    return this.#issueDate;
  }

  getDueDate() {
    return this.#dueDate;
  }

  getReturnDate() {
    return this.#returnDate;
  }

  getFineAmount() {
    return this.#fineAmount;
  }

  getStatus() {
    return this.#status;
  }

  isActive() {
    return this.#status === 'ACTIVE';
  }

  /**
   * Calculates the late fine based on daily penalty rate.
   * Fine formula: Math.max(0, daysOverdue * dailyFineRate)
   * @param {number} dailyFineRate - Cost per overdue day (default: ₹1.00 / day)
   * @param {Date|string} asOfDate - Date to calculate fine for (defaults to returnDate or now)
   */
  calculateFine(dailyFineRate = 1.0, asOfDate = null) {
    const dueDateObj = new Date(this.#dueDate);
    const effectiveReturnDate = asOfDate 
      ? new Date(asOfDate) 
      : (this.#returnDate ? new Date(this.#returnDate) : new Date());

    // Reset times to midnight for clean full-day calculations
    const d1 = new Date(dueDateObj.getFullYear(), dueDateObj.getMonth(), dueDateObj.getDate());
    const d2 = new Date(effectiveReturnDate.getFullYear(), effectiveReturnDate.getMonth(), effectiveReturnDate.getDate());

    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return {
        isOverdue: true,
        daysOverdue: diffDays,
        fineAmount: diffDays * dailyFineRate
      };
    }

    return {
      isOverdue: false,
      daysOverdue: 0,
      fineAmount: 0
    };
  }

  /**
   * Completes the transaction when the book is returned
   */
  closeTransaction(returnDate = new Date().toISOString(), dailyFineRate = 1.0) {
    this.#returnDate = returnDate;
    this.#status = 'RETURNED';
    const fineCalculation = this.calculateFine(dailyFineRate, returnDate);
    this.#fineAmount = fineCalculation.fineAmount;
    return fineCalculation;
  }

  /**
   * UI summary object
   */
  getSummary(dailyFineRate = 1.0) {
    const fineInfo = this.calculateFine(dailyFineRate);
    return {
      transactionId: this.#transactionId,
      bookId: this.#bookId,
      bookTitle: this.#bookTitle,
      memberId: this.#memberId,
      memberName: this.#memberName,
      issueDate: this.#issueDate,
      dueDate: this.#dueDate,
      returnDate: this.#returnDate,
      fineAmount: this.#fineAmount,
      status: this.#status,
      isOverdue: fineInfo.isOverdue,
      daysOverdue: fineInfo.daysOverdue,
      currentPotentialFine: this.isActive() ? fineInfo.fineAmount : this.#fineAmount
    };
  }

  /**
   * Serialization for LocalStorage
   */
  toJSON() {
    return {
      transactionId: this.#transactionId,
      bookId: this.#bookId,
      bookTitle: this.#bookTitle,
      memberId: this.#memberId,
      memberName: this.#memberName,
      issueDate: this.#issueDate,
      dueDate: this.#dueDate,
      returnDate: this.#returnDate,
      fineAmount: this.#fineAmount,
      status: this.#status
    };
  }

  /**
   * Factory method to hydrate a Transaction instance from plain JSON
   */
  static fromJSON(data) {
    if (!data) return null;
    return new Transaction(data);
  }
}
