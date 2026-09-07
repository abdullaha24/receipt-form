import React, { useState, useEffect } from 'react';
import { X, Plus, Pencil, Check, AlertCircle, Search, Lock, Package } from 'lucide-react';

interface ProductManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ListType = 'receipt' | 'production';
type Mode = 'add' | 'edit';

export default function ProductManagerModal({ isOpen, onClose }: ProductManagerModalProps) {
  const [password, setPassword] = useState('');
  const [activeList, setActiveList] = useState<ListType>('receipt');
  const [mode, setMode] = useState<Mode>('add');

  // Add state
  const [productName, setProductName] = useState('');
  const [unit, setUnit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit state
  const [products, setProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Status
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'warning' | null; message: string }>({
    type: null,
    message: '',
  });

  useEffect(() => {
    if (isOpen && mode === 'edit') {
      fetchProducts();
    }
  }, [isOpen, mode, activeList]);

  useEffect(() => {
    if (!isOpen) {
      setMode('add');
      setProductName('');
      setUnit('');
      setStatus({ type: null, message: '' });
      setEditingIndex(null);
      setSearchQuery('');
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetch(`/api/products?type=${activeList}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch {
      setStatus({ type: 'error', message: 'Failed to load products' });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setStatus({ type: 'error', message: 'Password is required' });
      return;
    }
    if (!productName.trim()) {
      setStatus({ type: 'error', message: 'Product name is required' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/admin/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          productName: productName.trim(),
          unit: unit.trim(),
          list: activeList,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) setPassword('');
        throw new Error(data.message || 'Failed to add product');
      }

      const gitMsg = data.gitStatus === 'synced' ? '' : ' (saved locally, GitHub sync failed)';
      setStatus({
        type: data.gitStatus === 'synced' ? 'success' : 'warning',
        message: `Added: ${data.product}${gitMsg}`,
      });
      setProductName('');
      setUnit('');
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (oldProduct: string) => {
    if (!password) {
      setStatus({ type: 'error', message: 'Password is required' });
      return;
    }
    if (!editValue.trim()) {
      setStatus({ type: 'error', message: 'Product name cannot be empty' });
      return;
    }
    if (editValue.trim() === oldProduct) {
      setEditingIndex(null);
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/admin/edit-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          oldProduct,
          newProduct: editValue.trim(),
          list: activeList,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) setPassword('');
        throw new Error(data.message || 'Failed to edit product');
      }

      const gitMsg = data.gitStatus === 'synced' ? '' : ' (saved locally, GitHub sync failed)';
      setStatus({
        type: data.gitStatus === 'synced' ? 'success' : 'warning',
        message: `Renamed to: ${data.newProduct}${gitMsg}`,
      });
      setEditingIndex(null);
      fetchProducts();
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[var(--shadow-modal)] w-full max-w-md overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-[var(--apple-gray-200)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-xl">
              <Package className="text-orange-500" size={22} strokeWidth={1.75} />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--apple-text)] tracking-tight">
              Manage Products
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--apple-text-secondary)] hover:text-[var(--apple-text)]
              bg-[var(--apple-gray-100)] hover:bg-[var(--apple-gray-200)] p-2.5 rounded-full transition-all duration-200"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--apple-text)]">Admin Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full py-3 px-4 pl-11 bg-[var(--apple-gray-100)] border-2 border-transparent rounded-xl
                  text-sm text-[var(--apple-text)] font-medium
                  focus:bg-white focus:border-[var(--apple-blue)] focus:ring-4 focus:ring-[var(--apple-blue)]/10
                  transition-all duration-200 outline-none placeholder-[var(--apple-text-secondary)]"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--apple-text-secondary)]" size={16} strokeWidth={1.75} />
            </div>
          </div>

          {/* List Type Tabs */}
          <div className="flex bg-[var(--apple-gray-100)] p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveList('receipt');
                setStatus({ type: null, message: '' });
                setEditingIndex(null);
              }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                ${activeList === 'receipt'
                  ? 'bg-white text-[var(--apple-text)] shadow-sm'
                  : 'text-[var(--apple-text-secondary)] hover:text-[var(--apple-text)]'
                }`}
            >
              Receipt & Issuance
            </button>
            <button
              onClick={() => {
                setActiveList('production');
                setStatus({ type: null, message: '' });
                setEditingIndex(null);
              }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                ${activeList === 'production'
                  ? 'bg-white text-[var(--apple-text)] shadow-sm'
                  : 'text-[var(--apple-text-secondary)] hover:text-[var(--apple-text)]'
                }`}
            >
              Production
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMode('add');
                setStatus({ type: null, message: '' });
                setEditingIndex(null);
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5
                ${mode === 'add'
                  ? 'bg-[var(--apple-blue)] text-white shadow-sm'
                  : 'bg-[var(--apple-gray-100)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text)]'
                }`}
            >
              <Plus size={16} /> Add
            </button>
            <button
              onClick={() => {
                setMode('edit');
                setStatus({ type: null, message: '' });
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5
                ${mode === 'edit'
                  ? 'bg-[var(--apple-blue)] text-white shadow-sm'
                  : 'bg-[var(--apple-gray-100)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text)]'
                }`}
            >
              <Pencil size={14} /> Edit
            </button>
          </div>

          {/* Add Mode */}
          {mode === 'add' && (
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--apple-text)]">Product Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. CEMENT GREY 50KG"
                  className="w-full py-3 px-4 bg-[var(--apple-gray-100)] border-2 border-transparent rounded-xl
                    text-sm text-[var(--apple-text)] font-medium
                    focus:bg-white focus:border-[var(--apple-blue)] focus:ring-4 focus:ring-[var(--apple-blue)]/10
                    transition-all duration-200 outline-none placeholder-[var(--apple-text-secondary)]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--apple-text)]">Unit</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. KG, BAG, EA, ROLL, M"
                  className="w-full py-3 px-4 bg-[var(--apple-gray-100)] border-2 border-transparent rounded-xl
                    text-sm text-[var(--apple-text)] font-medium
                    focus:bg-white focus:border-[var(--apple-blue)] focus:ring-4 focus:ring-[var(--apple-blue)]/10
                    transition-all duration-200 outline-none placeholder-[var(--apple-text-secondary)]"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-[var(--apple-blue)] hover:bg-[var(--apple-blue-hover)] text-white
                  rounded-xl font-semibold text-[15px] shadow-sm hover:shadow-lg transition-all duration-200
                  active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} strokeWidth={2} />
                    <span>Add Product</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Edit Mode */}
          {mode === 'edit' && (
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full py-2.5 px-4 pl-10 bg-[var(--apple-gray-100)] border-2 border-transparent rounded-xl
                    text-sm text-[var(--apple-text)]
                    focus:bg-white focus:border-[var(--apple-blue)] focus:ring-4 focus:ring-[var(--apple-blue)]/10
                    transition-all duration-200 outline-none placeholder-[var(--apple-text-secondary)]"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--apple-text-secondary)]" size={15} />
              </div>

              <div className="border border-[var(--apple-gray-200)] rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                {isLoadingProducts ? (
                  <div className="p-6 text-center text-sm text-[var(--apple-text-secondary)]">Loading...</div>
                ) : filteredProducts.length === 0 ? (
                  <div className="p-6 text-center text-sm text-[var(--apple-text-secondary)]">
                    {searchQuery ? 'No products match' : 'No products found'}
                  </div>
                ) : (
                  filteredProducts.map((product, idx) => {
                    const realIndex = products.indexOf(product);
                    const isEditing = editingIndex === realIndex;

                    return (
                      <div
                        key={`${product}-${idx}`}
                        className={`px-4 py-2.5 border-b border-[var(--apple-gray-200)] last:border-b-0
                          ${isEditing ? 'bg-[var(--apple-blue)]/5' : 'hover:bg-[var(--apple-gray-50)]'}`}
                      >
                        {isEditing ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleEdit(product);
                                if (e.key === 'Escape') setEditingIndex(null);
                              }}
                              autoFocus
                              className="flex-1 py-1.5 px-3 bg-white border-2 border-[var(--apple-blue)] rounded-lg
                                text-sm text-[var(--apple-text)] outline-none"
                            />
                            <button
                              onClick={() => handleEdit(product)}
                              disabled={isSubmitting}
                              className="px-3 py-1.5 bg-[var(--apple-blue)] text-white rounded-lg text-sm font-medium
                                hover:bg-[var(--apple-blue-hover)] transition-all disabled:opacity-50"
                            >
                              {isSubmitting ? '...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingIndex(null)}
                              className="px-3 py-1.5 bg-[var(--apple-gray-100)] text-[var(--apple-text-secondary)] rounded-lg text-sm
                                hover:bg-[var(--apple-gray-200)] transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between group">
                            <span className="text-sm text-[var(--apple-text)] truncate flex-1">{product}</span>
                            <button
                              onClick={() => {
                                setEditingIndex(realIndex);
                                setEditValue(product);
                              }}
                              className="ml-2 p-1.5 text-[var(--apple-text-secondary)] hover:text-[var(--apple-blue)]
                                hover:bg-[var(--apple-blue)]/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Pencil size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <p className="text-xs text-[var(--apple-text-secondary)] text-center">
                {products.length} products in {activeList === 'receipt' ? 'Receipt & Issuance' : 'Production'} list
              </p>
            </div>
          )}

          {/* Status Message */}
          {status.message && (
            <div
              className={`p-3.5 rounded-xl text-sm flex items-start gap-2.5 animate-slide-up
              ${status.type === 'success'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : status.type === 'warning'
                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}
            >
              {status.type === 'success' ? (
                <Check size={18} className="mt-0.5 flex-shrink-0" strokeWidth={2} />
              ) : (
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" strokeWidth={2} />
              )}
              <span className="font-medium">{status.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
