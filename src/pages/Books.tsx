import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp, createActivityLog, Book } from '../store/AppContext';
import { Search, Filter, Plus, Edit, Trash2, Eye, Copy, MoreVertical, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

export default function Books() {
  const { state, dispatch } = useApp();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  const books = state.books.filter(b => !b.deleted);

  const filteredBooks = books.filter(book => {
    const matchSearch = book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || book.status.toLowerCase() === statusFilter;
    const matchCategory = categoryFilter === 'all' || book.category_id === categoryFilter;
    const matchAuthor = authorFilter === 'all' || book.author_id === authorFilter;
    return matchSearch && matchStatus && matchCategory && matchAuthor;
  });

  const handleDelete = (id: string) => {
    const book = books.find(b => b.id === id);
    if (book && state.user) {
      dispatch({ type: 'DELETE_BOOK', payload: id });
      dispatch({ type: 'ADD_ACTIVITY_LOG', payload: createActivityLog(state.user.id, state.user.name, `Deleted book "${book.title}"`, 'book', id) });
    }
    setDeleteConfirm(null);
  };

  const handleDuplicate = (book: Book) => {
    const newBook: Book = {
      ...book,
      id: crypto.randomUUID(),
      title: `${book.title} (Copy)`,
      slug: `${book.slug}-copy`,
      status: 'DRAFT',
      featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_BOOK', payload: newBook });
    if (state.user) {
      dispatch({ type: 'ADD_ACTIVITY_LOG', payload: createActivityLog(state.user.id, state.user.name, `Duplicated book "${book.title}"`, 'book', newBook.id) });
    }
    setActionMenu(null);
  };

  const handlePublishToggle = (book: Book) => {
    const newStatus = book.status === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED';
    const updatedBook = { ...book, status: newStatus as Book['status'], updated_at: new Date().toISOString(), published_at: newStatus === 'PUBLISHED' ? new Date().toISOString() : undefined };
    dispatch({ type: 'UPDATE_BOOK', payload: updatedBook });
    if (state.user) {
      dispatch({ type: 'ADD_ACTIVITY_LOG', payload: createActivityLog(state.user.id, state.user.name, `${newStatus === 'PUBLISHED' ? 'Published' : 'Unpublished'} book "${book.title}"`, 'book', book.id) });
    }
    setActionMenu(null);
  };

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Books</h1>
          <p className="text-sm text-gray-500 mt-1">{filteredBooks.length} of {books.length} books</p>
        </div>
        <Link to="/admin/books/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Book
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search books..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <select className="input-field w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="unpublished">Unpublished</option>
            </select>
            <select className="input-field w-auto" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="input-field w-auto" value={authorFilter} onChange={(e) => setAuthorFilter(e.target.value)}>
              <option value="all">All Authors</option>
              {state.authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredBooks.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No books found</h3>
            <p className="text-sm text-gray-500 mb-4">Get started by creating your first book.</p>
            <Link to="/admin/books/new" className="btn-primary">+ Add New Book</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">Book</th>
                  <th className="table-header">Author</th>
                  <th className="table-header">Category</th>
                  <th className="table-header">Price</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Featured</th>
                  <th className="table-header">Updated</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBooks.map(book => {
                  const author = state.authors.find(a => a.id === book.author_id);
                  const category = state.categories.find(c => c.id === book.category_id);
                  return (
                    <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded flex items-center justify-center flex-shrink-0">
                            {book.cover_url ? (
                              <img src={book.cover_url} alt="" className="w-full h-full object-cover rounded" />
                            ) : (
                              <BookOpen className="w-5 h-5 text-indigo-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{book.title}</p>
                            <p className="text-xs text-gray-500 truncate">{book.short_description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">{author?.name || '—'}</td>
                      <td className="table-cell">{category?.name || '—'}</td>
                      <td className="table-cell font-medium">{formatCurrency(book.price)}</td>
                      <td className="table-cell">
                        <span className={`badge ${book.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : book.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>
                          {book.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        {book.featured && <span className="badge bg-yellow-100 text-yellow-700">★ Featured</span>}
                      </td>
                      <td className="table-cell text-gray-500 text-xs">{format(new Date(book.updated_at), 'MMM d, yyyy')}</td>
                      <td className="table-cell">
                        <div className="relative">
                          <button onClick={() => setActionMenu(actionMenu === book.id ? null : book.id)} className="p-1 rounded hover:bg-gray-100">
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                          {actionMenu === book.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                              <Link to={`/admin/books/${book.id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <Eye className="w-4 h-4" /> View
                              </Link>
                              <Link to={`/admin/books/${book.id}/edit`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <Edit className="w-4 h-4" /> Edit
                              </Link>
                              <button onClick={() => handlePublishToggle(book)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                {book.status === 'PUBLISHED' ? '⏸ Unpublish' : '🚀 Publish'}
                              </button>
                              <button onClick={() => handleDuplicate(book)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <Copy className="w-4 h-4" /> Duplicate
                              </button>
                              <button onClick={() => setDeleteConfirm(book.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete this book?</h3>
            <p className="text-sm text-gray-600 mb-4">This will soft-delete the book. Associated files and records may be affected. If this book has previous purchases, the purchase records will be preserved.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger">Delete Book</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
