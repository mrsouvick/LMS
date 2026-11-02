import React, { useState } from 'react';
import { Search, Filter, BookOpen, Trash2, ArrowUpRight, ArrowLeftRight, CheckCircle2, Clock } from 'lucide-react';

export function BookTable({ books = [], onIssueBook, onReturnBook, onDeleteBook, onAddNewBook }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Extract unique genres for filter dropdown
  const genres = ['ALL', ...new Set(books.map(b => b.genre).filter(Boolean))];

  // Client-side filtering based on query, genre, and status
  const filteredBooks = books.filter(book => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = 
      !q ||
      book.id.toLowerCase().includes(q) ||
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      (book.isbn && book.isbn.toLowerCase().includes(q));

    const matchesGenre = selectedGenre === 'ALL' || book.genre === selectedGenre;
    const matchesStatus = selectedStatus === 'ALL' || book.status === selectedStatus;

    return matchesQuery && matchesGenre && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Book ID, Title, Author, or ISBN..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Dropdowns and Status Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Segmented Control */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            {['ALL', 'Available', 'Issued'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedStatus === st
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All' : st}
              </button>
            ))}
          </div>

          {/* Genre Dropdown */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {genres.map(genre => (
              <option key={genre} value={genre}>
                {genre === 'ALL' ? 'All Genres' : genre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-3.5">Book ID & Title</th>
              <th className="px-6 py-3.5">Author</th>
              <th className="px-6 py-3.5">Genre</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Current Holder</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredBooks.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <BookOpen className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                    <p className="text-sm font-semibold text-slate-600">No books found</p>
                    <p className="text-xs text-slate-400">Try adjusting your search criteria or add a new book.</p>
                    {onAddNewBook && (
                      <button
                        onClick={onAddNewBook}
                        className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        + Add a New Book
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredBooks.map((book) => {
                const isAvail = book.isAvailable;
                const issuedTo = book.issuedTo;

                return (
                  <tr key={book.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Book ID & Title */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 flex-shrink-0 mt-0.5">
                          {book.id}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900 leading-snug">{book.title}</div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">
                            ISBN: {book.isbn || 'N/A'} • {book.publishedYear}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Author */}
                    <td className="px-6 py-4 text-slate-700 whitespace-nowrap">
                      {book.author}
                    </td>

                    {/* Genre */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                        {book.genre}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isAvail ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                          <Clock className="w-3.5 h-3.5" />
                          Issued
                        </span>
                      )}
                    </td>

                    {/* Current Holder / Issue Info */}
                    <td className="px-6 py-4 text-xs whitespace-nowrap">
                      {issuedTo ? (
                        <div>
                          <div className="font-semibold text-slate-800">{issuedTo.studentName}</div>
                          <div className="text-slate-400 font-mono text-[11px]">
                            ID: {issuedTo.studentId}
                          </div>
                          {issuedTo.dueDate && (
                            <div className="text-amber-600 font-medium text-[11px] mt-0.5">
                              Due: {new Date(issuedTo.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">In Library Stack</span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {isAvail ? (
                          <button
                            onClick={() => onIssueBook(book)}
                            className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 rounded-lg transition-all flex items-center gap-1"
                          >
                            <ArrowLeftRight className="w-3 h-3 text-blue-600" />
                            Issue
                          </button>
                        ) : (
                          <button
                            onClick={() => onReturnBook(book)}
                            className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-lg transition-all flex items-center gap-1"
                          >
                            <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                            Return
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteBook(book.id, book.title, isAvail)}
                          title="Delete book"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Count */}
      <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 text-xs font-medium text-slate-500 flex items-center justify-between">
        <div>
          Showing <span className="font-bold text-slate-700">{filteredBooks.length}</span> of{' '}
          <span className="font-bold text-slate-700">{books.length}</span> books in catalog
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Available: {books.filter(b => b.isAvailable).length}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Issued: {books.filter(b => !b.isAvailable).length}
          </span>
        </div>
      </div>
    </div>
  );
}
