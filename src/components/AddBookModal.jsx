import React, { useState } from 'react';
import { Modal } from './Modal';
import { BookPlus, Hash, BookOpen, User, Tag, Calendar, Barcode, AlertTriangle } from 'lucide-react';

export function AddBookModal({ isOpen, onClose, onAddBook, existingBooks = [] }) {
  // Suggest next ID based on count
  const nextIdNum = existingBooks.length + 101;
  const suggestedId = `BK-${nextIdNum}`;

  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('Computer Science');
  const [publishedYear, setPublishedYear] = useState(new Date().getFullYear());
  const [isbn, setIsbn] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Reset or preset ID on open
  React.useEffect(() => {
    if (isOpen) {
      setId(suggestedId);
      setTitle('');
      setAuthor('');
      setGenre('Computer Science');
      setPublishedYear(new Date().getFullYear());
      setIsbn(`978-0${Math.floor(100000000 + Math.random() * 900000000)}`);
      setErrorMsg('');
    }
  }, [isOpen, suggestedId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!id.trim()) {
      setErrorMsg('Book ID is required.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Book Title is required.');
      return;
    }
    if (!author.trim()) {
      setErrorMsg('Author name is required.');
      return;
    }

    try {
      onAddBook({
        id: id.trim().toUpperCase(),
        title: title.trim(),
        author: author.trim(),
        genre: genre.trim(),
        publishedYear: parseInt(publishedYear, 10) || new Date().getFullYear(),
        isbn: isbn.trim()
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add book.');
    }
  };

  const commonGenres = [
    'Computer Science',
    'Software Engineering',
    'Algorithms',
    'AI & Robotics',
    'Database Systems',
    'Operating Systems',
    'Networking',
    'Cybersecurity',
    'Data Science',
    'Mathematics',
    'Physics',
    'Literature'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Book to Catalog"
      subtitle="Enter details for the new textbook or publication record."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Book ID */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Book ID / Call Number
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={id}
                onChange={(e) => setId(e.target.value.toUpperCase())}
                placeholder="e.g. BK-109"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Genre */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Genre / Subject
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {commonGenres.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Book Title
          </label>
          <div className="relative">
            <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Structure and Interpretation of Computer Programs"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Author */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Author / Creator
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Harold Abelson & Gerald Jay Sussman"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Published Year */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Publication Year
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="1800"
                max="2099"
                value={publishedYear}
                onChange={(e) => setPublishedYear(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* ISBN */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              ISBN Number
            </label>
            <div className="relative">
              <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="978-0..."
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
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
            className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-sm shadow-blue-500/25 flex items-center gap-1.5"
          >
            <BookPlus className="w-4 h-4" />
            <span>Save to Catalog</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
