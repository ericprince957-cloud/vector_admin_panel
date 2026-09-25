import { useState } from 'react';
import { useApp, createActivityLog, Author } from '../store/AppContext';
import { Plus, Edit, Trash2, Users, X, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

export default function Authors() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewAuthor, setViewAuthor] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setBio('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (author: Author) => {
    setEditingId(author.id);
    setName(author.name);
    setBio(author.bio);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    if (editingId) {
      const updated: Author = { ...state.authors.find(a => a.id === editingId)!, name: name.trim(), bio: bio.trim() };
      dispatch({ type: 'UPDATE_AUTHOR', payload: updated });
      if (state.user) {
        dispatch({ type: 'ADD_ACTIVITY_LOG', payload: createActivityLog(state.user.id, state.user.name, `Updated author "${name}"`, 'author', editingId) });
      }
    } else {
      const newAuthor: Author = { id: crypto.randomUUID(), name: name.trim(), bio: bio.trim(), created_at: new Date().toISOString() };
      dispatch({ type: 'ADD_AUTHOR', payload: newAuthor });
      if (state.user) {
        dispatch({ type: 'ADD_ACTIVITY_LOG', payload: createActivityLog(state.user.id, state.user.name, `Created author "${name}"`, 'author', newAuthor.id) });
      }
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    const author = state.authors.find(a => a.id === id);
    dispatch({ type: 'DELETE_AUTHOR', payload: id });
    if (state.user && author) {
      dispatch({ type: 'ADD_ACTIVITY_LOG', payload: createActivityLog(state.user.id, state.user.name, `Deleted author "${author.name}"`, 'author', id) });
    }
    setDeleteConfirm(null);
  };

  const authorBooks = viewAuthor ? state.books.filter(b => b.author_id === viewAuthor && !b.deleted) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Authors</h1>
          <p className="text-sm text-gray-500 mt-1">{state.authors.length} authors</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Author
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingId ? 'Edit Author' : 'New Author'}</h3>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Author name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
                <textarea className="input-field h-24 resize-none" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Author biography" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-500">{name.charAt(0) || '?'}</span>
                  </div>
                  <label className="btn-secondary text-xs cursor-pointer">
                    Upload Photo
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={resetForm} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary">{editingId ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Authors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.authors.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-xl border border-gray-200">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No authors yet</h3>
            <p className="text-sm text-gray-500">Add your first author.</p>
          </div>
        ) : (
          state.authors.map(author => {
            const bookCount = state.books.filter(b => b.author_id === author.id && !b.deleted).length;
            return (
              <div key={author.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-indigo-600">{author.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{author.name}</h3>
                      <p className="text-xs text-gray-500">{bookCount} books</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(author)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteConfirm(author.id)} className="p-1.5 hover:bg-red-50 rounded text-gray-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {author.bio && <p className="text-sm text-gray-500 mt-3 line-clamp-2">{author.bio}</p>}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">{format(new Date(author.created_at), 'MMM d, yyyy')}</p>
                  <button onClick={() => setViewAuthor(author.id)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> View books
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View Author Books Modal */}
      {viewAuthor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Books by {state.authors.find(a => a.id === viewAuthor)?.name}</h3>
              <button onClick={() => setViewAuthor(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            {authorBooks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No books by this author.</p>
            ) : (
              <div className="space-y-3">
                {authorBooks.map(book => (
                  <div key={book.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{book.title}</p>
                      <p className="text-xs text-gray-500">₦{book.price.toLocaleString()} • {book.status}</p>
                    </div>
                    <span className={`badge ${book.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{book.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete author?</h3>
            <p className="text-sm text-gray-600 mb-4">Books by this author will become uncategorized. This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
