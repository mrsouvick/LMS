import { Person } from './Person';
import { MaxBorrowLimitExceededException, ValidationException } from './Exceptions';

/**
 * Derived Class: Student (Member)
 * Demonstrates:
 * 1. OOP Inheritance: Extends the base Person class (`class Student extends Person`).
 * 2. Polymorphism: Overrides `getDetails()` to add student-specific attributes.
 * 3. Encapsulation: Manages student's issued books list and enforces borrow quotas.
 */
export class Student extends Person {
  #department;
  #issuedBooks; // Array of Book IDs currently borrowed
  #maxBorrowLimit;

  constructor(id, name, email, department = 'Computer Science', maxBorrowLimit = 3, issuedBooks = [], createdAt) {
    super(id, name, email, createdAt);
    this.setDepartment(department);
    this.#maxBorrowLimit = Number(maxBorrowLimit) || 3;
    this.#issuedBooks = Array.isArray(issuedBooks) ? [...issuedBooks] : [];
  }

  // --- Getters & Setters ---

  getDepartment() {
    return this.#department;
  }

  setDepartment(dept) {
    if (!dept || typeof dept !== 'string') {
      throw new ValidationException('department', 'Department must be a valid string.');
    }
    this.#department = dept.trim();
  }

  getMaxBorrowLimit() {
    return this.#maxBorrowLimit;
  }

  setMaxBorrowLimit(limit) {
    const parsed = parseInt(limit, 10);
    if (isNaN(parsed) || parsed < 1) {
      throw new ValidationException('maxBorrowLimit', 'Borrow limit must be at least 1.');
    }
    this.#maxBorrowLimit = parsed;
  }

  getIssuedBooks() {
    // Return a shallow copy to prevent external mutation (encapsulation)
    return [...this.#issuedBooks];
  }

  getBorrowedCount() {
    return this.#issuedBooks.length;
  }

  canBorrow() {
    return this.#issuedBooks.length < this.#maxBorrowLimit;
  }

  /**
   * Enforces borrow limit and adds book to student's record
   */
  borrowBook(bookId) {
    if (!this.canBorrow()) {
      throw new MaxBorrowLimitExceededException(this.getName(), this.#maxBorrowLimit);
    }
    if (this.#issuedBooks.includes(bookId)) {
      throw new ValidationException('bookId', `Student already has a copy of book ID "${bookId}" checked out.`);
    }
    this.#issuedBooks.push(bookId);
  }

  /**
   * Removes book from student's record upon return
   */
  returnBook(bookId) {
    const index = this.#issuedBooks.indexOf(bookId);
    if (index === -1) {
      return false; // Student did not have this book
    }
    this.#issuedBooks.splice(index, 1);
    return true;
  }

  /**
   * Polymorphic override of Person.getDetails()
   */
  getDetails() {
    return {
      ...super.getDetails(),
      role: 'Student',
      department: this.#department,
      maxBorrowLimit: this.#maxBorrowLimit,
      borrowedCount: this.getBorrowedCount(),
      issuedBooks: this.getIssuedBooks()
    };
  }

  /**
   * Serialization helper for LocalStorage persistence
   */
  toJSON() {
    return {
      ...super.toJSON(),
      role: 'Student',
      department: this.#department,
      maxBorrowLimit: this.#maxBorrowLimit,
      issuedBooks: this.#issuedBooks
    };
  }

  /**
   * Factory method to hydrate a Student instance from plain object
   */
  static fromJSON(data) {
    if (!data) return null;
    return new Student(
      data.id,
      data.name,
      data.email,
      data.department,
      data.maxBorrowLimit,
      data.issuedBooks,
      data.createdAt
    );
  }
}
