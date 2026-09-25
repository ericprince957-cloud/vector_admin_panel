import { useState } from 'react';
import { useApp, createActivityLog, Category } from '../store/AppContext';
import { Plus, Edit, Trash2, FolderOpen, X } from 'lucide-react';
import { format } from 'date-fns';

export default function Categories() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingId) {
      const updated: Category = {
        ...state.categories.find(c => c.id === editingId)!,
        name: name.trim(),
        slug,
        description: description.trim(),
      };
      dispatch({ type: 'UPDATE_CATEGORY', payload: updated });
      if (state.user) {
        dispatch({ type: 'ADD_ACTIVITY_LOG', payload: createActivityLog(state.user.id, state.user.name, `Updated category "${name}"`, 'category', editingId) });
      }
    } else {
      const newCat: Category = {
        id: crypto.randomUUID(),
        name: name.trim(),
        slug,
        description: description.trim(),
        book_count: 0,
        created_at: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_CATEGORY', payload: newCat });
      if (state.user) {
        dispatch({ type: 'ADD_ACTIVITY_LOG', payload: createActivityLog(state.user.id, state.user.name, `Created category "${name}"`, 'category', newCat.id) });
      }
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    const cat = state.categories.find(c => c.id === id);
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
    if (state.user && cat) {
      dispatch({ type: 'ADD_ACTIVITY_LOG', payload: createActivityLog(state.user.id, state.user.name, `Deleted category "${cat.name}"`, 'category', id) });
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">{state.categories.length} categories</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingId ? 'Edit Category' : 'New Category'}</h3>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Technology" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input-field h-20 resize-none" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Category description" />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={resetForm} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary">{editingId ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.categories.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-xl border border-gray-200">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No categories yet</h3>
            <p className="text-sm text-gray-500">Create your first category to organize books.</p>
          </div>
        ) : (
          state.categories.map(cat => {
            const bookCount = state.books.filter(b => b.category_id === cat.id && !b.deleted).length;
            return (
              <div key={cat.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                      <p className="text-xs text-gray-500">{bookCount} books</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(cat)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteConfirm(cat.id)} className="p-1.5 hover:bg-red-50 rounded text-gray-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {cat.description && <p className="text-sm text-gray-500 mt-3 line-clamp-2">{cat.description}</p>}
                <p className="text-xs text-gray-400 mt-3">Created {format(new Date(cat.created_at), 'MMM d, yyyy')}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete category?</h3>
            <p className="text-sm text-gray-600 mb-4">Books in this category will become uncategorized. This action cannot be undone.</p>
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
