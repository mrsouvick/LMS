import { BookAlreadyIssuedException, BookNotIssuedException, ValidationException } from './Exceptions';

/**
 * Class: Book
 * Demonstrates:
 * 1. Encapsulation: Internal status and book metadata protected by getters/setters.
 * 2. Domain behavior methods: `markAsIssued()`, `markAsReturned()`, `isAvailable()`.
 * 3. Robust validation on initialization.
 */
export class Book {
  #id;
  #title;
  #author;
  #genre;
  #isbn;
  #publishedYear;
  #status; // 'Available' | 'Issued'
  #issuedTo; // null | { studentId: string, studentName: string, issueDate: string, dueDate: string }

  constructor(
    id,
    title,
    author,
    genre = 'General',
    status = 'Available',
    isbn = '',
    publishedYear = new Date().getFullYear(),
    issuedTo = null
  ) {
    this.setId(id);
    this.setTitle(title);
    this.setAuthor(author);
    this.setGenre(genre);
    this.#isbn = isbn || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    this.#publishedYear = publishedYear;
    this.#status = status === 'Issued' ? 'Issued' : 'Available';
    this.#issuedTo = issuedTo;
  }

  // --- Getters & Setters ---

  getId() {
    return this.#id;
  }

  setId(id) {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new ValidationException('id', 'Book ID must be provided.');
    }
    this.#id = id.trim().toUpperCase();
  }

  getTitle() {
    return this.#title;
  }

  setTitle(title) {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw new ValidationException('title', 'Book title is required.');
    }
    this.#title = title.trim();
  }

  getAuthor() {
    return this.#author;
  }

  setAuthor(author) {
    if (!author || typeof author !== 'string' || author.trim().length === 0) {
      throw new ValidationException('author', 'Author name is required.');
    }
    this.#author = author.trim();
  }

  getGenre() {
    return this.#genre;
  }

  setGenre(genre) {
    this.#genre = (genre && genre.trim()) || 'General';
  }

  getIsbn() {
    return this.#isbn;
  }

  getPublishedYear() {
    return this.#publishedYear;
  }

  getStatus() {
    return this.#status;
  }

  getIssuedTo() {
    return this.#issuedTo ? { ...this.#issuedTo } : null;
  }

  isAvailable() {
    return this.#status === 'Available';
  }

  /**
   * Issues the book to a student with status and metadata tracking.
   * Throws BookAlreadyIssuedException if already borrowed.
   */
  markAsIssued(studentId, studentName, issueDate = new Date().toISOString(), dueDate = '') {
    if (!this.isAvailable()) {
      throw new BookAlreadyIssuedException(
        this.#title,
        this.#issuedTo ? `${this.#issuedTo.studentName} (${this.#issuedTo.studentId})` : 'another student'
      );
    }
    this.#status = 'Issued';
    this.#issuedTo = {
      studentId,
      studentName,
      issueDate,
      dueDate
    };
  }

  /**
   * Returns the book to the library inventory.
   * Throws BookNotIssuedException if trying to return an available book.
   */
  markAsReturned() {
    if (this.isAvailable()) {
      throw new BookNotIssuedException(this.#title);
    }
    const previousBorrower = this.#issuedTo;
    this.#status = 'Available';
    this.#issuedTo = null;
    return previousBorrower;
  }

  /**
   * Formatted object for UI / tables
   */
  getSummary() {
    return {
      id: this.#id,
      title: this.#title,
      author: this.#author,
      genre: this.#genre,
      status: this.#status,
      isbn: this.#isbn,
      publishedYear: this.#publishedYear,
      isAvailable: this.isAvailable(),
      issuedTo: this.getIssuedTo()
    };
  }

  /**
   * Serialization for LocalStorage
   */
  toJSON() {
    return {
      id: this.#id,
      title: this.#title,
      author: this.#author,
      genre: this.#genre,
      status: this.#status,
      isbn: this.#isbn,
      publishedYear: this.#publishedYear,
      issuedTo: this.#issuedTo
    };
  }

  /**
   * Factory method to hydrate a Book instance from plain JSON
   */
  static fromJSON(data) {
    if (!data) return null;
    return new Book(
      data.id,
      data.title,
      data.author,
      data.genre,
      data.status,
      data.isbn,
      data.publishedYear,
      data.issuedTo
    );
  }
}
