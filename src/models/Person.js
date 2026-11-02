import { ValidationException } from './Exceptions';

/**
 * Base Class: Person
 * Demonstrates:
 * 1. Encapsulation: Private properties (#id, #name, #email) with validated getters/setters.
 * 2. Foundation for OOP Inheritance (extended by Student/Member).
 */
export class Person {
  #id;
  #name;
  #email;
  #createdAt;

  constructor(id, name, email, createdAt = new Date().toISOString()) {
    this.setId(id);
    this.setName(name);
    this.setEmail(email);
    this.#createdAt = createdAt;
  }

  // --- Encapsulated Getters & Setters ---

  getId() {
    return this.#id;
  }

  setId(id) {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new ValidationException('id', 'Person ID must be a non-empty string.');
    }
    this.#id = id.trim().toUpperCase();
  }

  getName() {
    return this.#name;
  }

  setName(name) {
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      throw new ValidationException('name', 'Name must have at least 2 characters.');
    }
    this.#name = name.trim();
  }

  getEmail() {
    return this.#email;
  }

  setEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      throw new ValidationException('email', 'A valid email address is required.');
    }
    this.#email = email.trim().toLowerCase();
  }

  getCreatedAt() {
    return this.#createdAt;
  }

  /**
   * Polymorphic method to get person details.
   */
  getDetails() {
    return {
      id: this.#id,
      name: this.#name,
      email: this.#email,
      createdAt: this.#createdAt,
      role: 'Person'
    };
  }

  /**
   * Serialization helper for LocalStorage persistence
   */
  toJSON() {
    return {
      id: this.#id,
      name: this.#name,
      email: this.#email,
      createdAt: this.#createdAt
    };
  }
}
