import React, { useState } from 'react';
import { Search, UserPlus, GraduationCap, Mail, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

export function StudentTable({ students = [], onAddNewStudent }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const departments = ['ALL', ...new Set(students.map(s => s.department).filter(Boolean))];

  const filteredStudents = students.filter(student => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = 
      !q ||
      student.id.toLowerCase().includes(q) ||
      student.name.toLowerCase().includes(q) ||
      student.email.toLowerCase().includes(q);

    const matchesDept = selectedDept === 'ALL' || student.department === selectedDept;

    return matchesQuery && matchesDept;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Header Toolbar */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student by name, ID, or email..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {departments.map(d => (
              <option key={d} value={d}>
                {d === 'ALL' ? 'All Departments' : d}
              </option>
            ))}
          </select>

          <button
            onClick={onAddNewStudent}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-3.5">Student ID & Name</th>
              <th className="px-6 py-3.5">Email</th>
              <th className="px-6 py-3.5">Department</th>
              <th className="px-6 py-3.5">Active Loans</th>
              <th className="px-6 py-3.5">Borrowing Quota</th>
              <th className="px-6 py-3.5">Currently Checked-Out</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                  No registered students found.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const isMaxed = student.borrowedCount >= student.maxBorrowLimit;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* ID & Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{student.name}</div>
                          <div className="text-xs font-mono text-slate-400">{student.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{student.email}</span>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {student.department}
                      </span>
                    </td>

                    {/* Borrowing Count */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{student.borrowedCount}</span>
                        <span className="text-xs text-slate-400">/ {student.maxBorrowLimit} allowed</span>
                      </div>
                    </td>

                    {/* Quota Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isMaxed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                          <AlertCircle className="w-3 h-3" />
                          Limit Reached
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <CheckCircle2 className="w-3 h-3" />
                          Eligible ({student.maxBorrowLimit - student.borrowedCount} left)
                        </span>
                      )}
                    </td>

                    {/* Currently Checked Out Book IDs */}
                    <td className="px-6 py-4">
                      {student.issuedBooks && student.issuedBooks.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {student.issuedBooks.map((bId) => (
                            <span
                              key={bId}
                              className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200"
                            >
                              {bId}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No books held</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
