import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp, createActivityLog, Book } from '../store/AppContext';
import { ArrowLeft, Upload, X, Plus, GripVertical, Save, Eye } from 'lucide-react';

export default function BookForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const isEditing = !!id;
  const existingBook = id ? state.books.find(b => b.id === id && !b.deleted) : null;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [whatYouLearn, setWhatYouLearn] = useState<string[]>(['']);
  const [tableOfContents, setTableOfContents] = useState<string[]>(['']);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [bookFile, setBookFile] = useState<{ name: string; size: number } | null>(null);
  const [previewFile, setPreviewFile] = useState<{ name: string; size: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (existingBook) {
      setTitle(existingBook.title);
      setSlug(existingBook.slug);
      setAuthorId(existingBook.author_id);
      setCategoryId(existingBook.category_id);
      setShortDescription(existingBook.short_description);
      setDescription(existingBook.description);
      setPrice(existingBook.price);
      setOriginalPrice(existingBook.original_price || 0);
      setFeatured(existingBook.featured);
      setStatus(existingBook.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT');
      setTags(existingBook.tags);
      setWhatYouLearn(existingBook.what_you_learn.length > 0 ? existingBook.what_you_learn : ['']);
      setTableOfContents(existingBook.table_of_contents.length > 0 ? existingBook.table_of_contents : ['']);
      setCoverPreview(existingBook.cover_url || null);
    }
  }, [existingBook]);

  const generateSlug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) setSlug(generateSlug(val));
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setToast('Invalid file type. Use JPG, PNG, or WEBP.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setToast('File too large. Maximum 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
      setToast('');
    }
  };

  const handleBookFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/epub+zip'];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.epub')) {
        setToast('Invalid file type. Use PDF or EPUB.');
        return;
      }
      setBookFile({ name: file.name, size: file.size });
      setToast('');
    }
  };

  const handlePreviewFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewFile({ name: file.name, size: file.size });
      setToast('');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const addLearningPoint = () => setWhatYouLearn([...whatYouLearn, '']);
  const updateLearningPoint = (index: number, value: string) => {
    const updated = [...whatYouLearn];
    updated[index] = value;
    setWhatYouLearn(updated);
  };
  const removeLearningPoint = (index: number) => setWhatYouLearn(whatYouLearn.filter((_, i) => i !== index));

  const addChapter = () => setTableOfContents([...tableOfContents, '']);
  const updateChapter = (index: number, value: string) => {
    const updated = [...tableOfContents];
    updated[index] = value;
    setTableOfContents(updated);
  };
  const removeChapter = (index: number) => setTableOfContents(tableOfContents.filter((_, i) => i !== index));

  const moveItem = <T,>(arr: T[], from: number, to: number): T[] => {
    const result = [...arr];
    const [item] = result.splice(from, 1);
    result.splice(to, 0, item);
    return result;
  };

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) { setToast('Title is required'); return; }
    if (!authorId) { setToast('Author is required'); return; }
    if (!categoryId) { setToast('Category is required'); return; }
    if (price <= 0) { setToast('Price must be greater than 0'); return; }

    setSaving(true);
    await new Promise(r => setTimeout(r, 800));

    const bookData: Book = {
      id: existingBook?.id || crypto.randomUUID(),
      title: title.trim(),
      slug: slug || generateSlug(title),
      author_id: authorId,
      category_id: categoryId,
      short_description: shortDescription.trim(),
      description: description.trim(),
      cover_url: coverPreview || undefined,
      book_file_path: bookFile ? `/private/books/${bookFile.name}` : existingBook?.book_file_path,
      preview_file_path: previewFile ? `/public/previews/${previewFile.name}` : existingBook?.preview_file_path,
      price,
      original_price: originalPrice || undefined,
      featured,
      status: publish ? 'PUBLISHED' : status,
      what_you_learn: whatYouLearn.filter(w => w.trim()),
      table_of_contents: tableOfContents.filter(t => t.trim()),
      tags,
      published_at: publish ? new Date().toISOString() : existingBook?.published_at,
      created_at: existingBook?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isEditing) {
      dispatch({ type: 'UPDATE_BOOK', payload: bookData });
    } else {
      dispatch({ type: 'ADD_BOOK', payload: bookData });
    }

    if (state.user) {
      dispatch({
        type: 'ADD_ACTIVITY_LOG',
        payload: createActivityLog(
          state.user.id, state.user.name,
          `${isEditing ? 'Updated' : 'Created'} book "${title}"${publish ? ' and published' : ''}`,
          'book', bookData.id
        )
      });
    }

    setSaving(false);
    setToast(publish ? 'Book published successfully!' : 'Book saved as draft!');
    setTimeout(() => navigate('/admin/books'), 1000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/books" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Book' : 'Create New Book'}</h1>
            <p className="text-sm text-gray-500">{isEditing ? 'Update book details' : 'Fill in the details to create a new book'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleSave(false)} disabled={saving} className="btn-secondary flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary flex items-center gap-2">
            <Eye className="w-4 h-4" /> {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {toast && (
        <div className={`p-3 rounded-lg text-sm ${toast.includes('Invalid') || toast.includes('required') || toast.includes('too large') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {toast}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input type="text" className="input-field" value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Enter book title" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input type="text" className="input-field" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated-from-title" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
            <select className="input-field" value={authorId} onChange={(e) => setAuthorId(e.target.value)}>
              <option value="">Select author</option>
              {state.authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select className="input-field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Select category</option>
              {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
          <textarea className="input-field h-20 resize-none" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="Brief summary for listings" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
          <textarea className="input-field h-40 resize-y" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed book description" />
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦) *</label>
            <input type="number" className="input-field" value={price || ''} onChange={(e) => setPrice(Number(e.target.value))} placeholder="4000" min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₦) - optional</label>
            <input type="number" className="input-field" value={originalPrice || ''} onChange={(e) => setOriginalPrice(Number(e.target.value))} placeholder="5000" min="0" />
          </div>
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded border-gray-300" />
          <span className="text-sm text-gray-700">Featured book</span>
        </label>
      </div>

      {/* Cover Image */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Cover Image</h2>
        {coverPreview ? (
          <div className="relative w-48 h-64 mx-auto">
            <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover rounded-lg border border-gray-200" />
            <button onClick={() => setCoverPreview(null)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Click to upload cover image</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP • Max 5MB</p>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverUpload} />
          </label>
        )}
      </div>

      {/* Book File */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Ebook File</h2>
        <p className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-2">⚠️ Book files are stored in private storage and never exposed publicly.</p>
        {bookFile ? (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">{bookFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(bookFile.size)}</p>
            </div>
            <div className="flex gap-2">
              <label className="btn-secondary text-xs cursor-pointer">
                Replace
                <input type="file" accept=".pdf,.epub" className="hidden" onChange={handleBookFileUpload} />
              </label>
              <button onClick={() => setBookFile(null)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Upload ebook file</p>
            <p className="text-xs text-gray-400 mt-1">PDF, EPUB</p>
            <input type="file" accept=".pdf,.epub" className="hidden" onChange={handleBookFileUpload} />
          </label>
        )}
      </div>

      {/* Preview File */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Preview File (Optional)</h2>
        {previewFile ? (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">{previewFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(previewFile.size)}</p>
            </div>
            <div className="flex gap-2">
              <label className="btn-secondary text-xs cursor-pointer">
                Replace
                <input type="file" accept=".pdf,.epub" className="hidden" onChange={handlePreviewFileUpload} />
              </label>
              <button onClick={() => setPreviewFile(null)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors">
            <Upload className="w-6 h-6 text-gray-400 mb-1" />
            <p className="text-sm text-gray-500">Upload preview/sample file</p>
            <input type="file" accept=".pdf,.epub" className="hidden" onChange={handlePreviewFileUpload} />
          </label>
        )}
      </div>

      {/* What You'll Learn */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">What You'll Learn</h2>
          <button onClick={addLearningPoint} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add point
          </button>
        </div>
        <div className="space-y-2">
          {whatYouLearn.map((point, i) => (
            <div key={i} className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
              <input type="text" className="input-field flex-1" value={point} onChange={(e) => updateLearningPoint(i, e.target.value)} placeholder={`Learning point ${i + 1}`} />
              {whatYouLearn.length > 1 && (
                <button onClick={() => removeLearningPoint(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Table of Contents */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Table of Contents</h2>
          <button onClick={addChapter} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add chapter
          </button>
        </div>
        <div className="space-y-2">
          {tableOfContents.map((chapter, i) => (
            <div key={i} className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
              <span className="text-sm text-gray-500 w-20 flex-shrink-0">Chapter {i + 1}</span>
              <input type="text" className="input-field flex-1" value={chapter} onChange={(e) => updateChapter(i, e.target.value)} placeholder="Chapter title" />
              {tableOfContents.length > 1 && (
                <button onClick={() => removeChapter(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" className="input-field flex-1" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add a tag" />
          <button onClick={addTag} className="btn-secondary">Add</button>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-end gap-3 pb-8">
        <Link to="/admin/books" className="btn-secondary">Cancel</Link>
        <button onClick={() => handleSave(false)} disabled={saving} className="btn-secondary flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Draft
        </button>
        <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary flex items-center gap-2">
          <Eye className="w-4 h-4" /> {saving ? 'Publishing...' : 'Publish Book'}
        </button>
      </div>
    </div>
  );
}
