/**
 * Custom OOP Exception Classes for Library Management System
 * Demonstrates proper error inheritance and specialized domain exceptions.
 */

export class LibraryException extends Error {
  constructor(message, code = 'LIBRARY_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date();
    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BookNotFoundException extends LibraryException {
  constructor(bookId) {
    super(`Book with ID "${bookId}" was not found in the library catalog.`, 'BOOK_NOT_FOUND');
    this.bookId = bookId;
  }
}

export class BookAlreadyIssuedException extends LibraryException {
  constructor(bookTitle, issuedTo) {
    super(
      `Cannot issue "${bookTitle}". It is currently issued to ${issuedTo || 'another student'}.`,
      'BOOK_ALREADY_ISSUED'
    );
    this.bookTitle = bookTitle;
    this.issuedTo = issuedTo;
  }
}

export class BookNotIssuedException extends LibraryException {
  constructor(bookTitle) {
    super(`Book "${bookTitle}" cannot be returned because it is currently marked as Available.`, 'BOOK_NOT_ISSUED');
    this.bookTitle = bookTitle;
  }
}

export class MemberNotFoundException extends LibraryException {
  constructor(memberId) {
    super(`Student/Member with ID "${memberId}" is not registered in the system.`, 'MEMBER_NOT_FOUND');
    this.memberId = memberId;
  }
}

export class MaxBorrowLimitExceededException extends LibraryException {
  constructor(memberName, limit) {
    super(
      `Borrow limit exceeded for ${memberName}. Maximum allowed active books is ${limit}.`,
      'LIMIT_EXCEEDED'
    );
    this.memberName = memberName;
    this.limit = limit;
  }
}

export class DuplicateEntityException extends LibraryException {
  constructor(entityType, id) {
    super(`${entityType} with ID "${id}" already exists in the system.`, 'DUPLICATE_ENTITY');
    this.entityType = entityType;
    this.id = id;
  }
}

export class ValidationException extends LibraryException {
  constructor(field, message) {
    super(`Validation Error on "${field}": ${message}`, 'VALIDATION_ERROR');
    this.field = field;
  }
}
