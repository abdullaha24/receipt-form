import React, { useState } from 'react';
import { Upload, X, Check, AlertCircle, FileSpreadsheet } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateSuccess: () => void;
}

type FormType = 'receipt' | 'production';

export default function SettingsModal({ isOpen, onClose, onUpdateSuccess }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<FormType>('receipt');
  const [sheetName, setSheetName] = useState('');
  const [columnRef, setColumnRef] = useState('A');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !sheetName || !columnRef) {
      setStatus({ type: 'error', message: 'Please fill all fields and select a file.' });
      return;
    }

    setIsUploading(true);
    setStatus({ type: null, message: '' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', activeTab);
    formData.append('sheetName', sheetName);
    formData.append('columnRef', columnRef);

    try {
      const res = await fetch('/api/admin/update-products', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setStatus({ type: 'success', message: `Success! Loaded ${data.count} products.` });
      setFile(null);
      onUpdateSuccess();
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[var(--shadow-modal)] w-full max-w-md overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-[var(--apple-gray-200)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--apple-blue)]/10 rounded-xl">
              <FileSpreadsheet className="text-[var(--apple-blue)]" size={22} strokeWidth={1.75} />
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

        {/* Segmented Control */}
        <div className="px-5 sm:px-6 pt-5 sm:pt-6">
          <div className="flex bg-[var(--apple-gray-100)] p-1 rounded-xl">
            <button
              onClick={() => { setActiveTab('receipt'); setStatus({ type: null, message: '' }); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                ${activeTab === 'receipt' 
                  ? 'bg-white text-[var(--apple-text)] shadow-sm' 
                  : 'text-[var(--apple-text-secondary)] hover:text-[var(--apple-text)]'
                }`}
            >
              Receipt & Issuance
            </button>
            <button
              onClick={() => { setActiveTab('production'); setStatus({ type: null, message: '' }); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                ${activeTab === 'production' 
                  ? 'bg-white text-[var(--apple-text)] shadow-sm' 
                  : 'text-[var(--apple-text-secondary)] hover:text-[var(--apple-text)]'
                }`}
            >
              Production
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--apple-text)]">Sheet Name</label>
              <input 
                type="text" 
                value={sheetName} 
                onChange={(e) => setSheetName(e.target.value)}
                placeholder="e.g. Sheet1"
                className="w-full py-3 px-4 bg-[var(--apple-gray-100)] border-2 border-transparent rounded-xl 
                  text-sm text-[var(--apple-text)] font-medium
                  focus:bg-white focus:border-[var(--apple-blue)] focus:ring-4 focus:ring-[var(--apple-blue)]/10 
                  transition-all duration-200 outline-none placeholder-[var(--apple-text-secondary)]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--apple-text)]">Column</label>
              <input 
                type="text" 
                value={columnRef} 
                onChange={(e) => setColumnRef(e.target.value.toUpperCase())}
                placeholder="e.g. A"
                className="w-full py-3 px-4 bg-[var(--apple-gray-100)] border-2 border-transparent rounded-xl 
                  text-sm text-[var(--apple-text)] font-medium
                  focus:bg-white focus:border-[var(--apple-blue)] focus:ring-4 focus:ring-[var(--apple-blue)]/10 
                  transition-all duration-200 outline-none placeholder-[var(--apple-text-secondary)]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--apple-text)]">Excel File</label>
            <div className="relative border-2 border-dashed border-[var(--apple-gray-300)] rounded-2xl p-6 
              hover:bg-[var(--apple-gray-50)] hover:border-[var(--apple-blue)]/40 
              transition-all duration-200 text-center cursor-pointer group">
              <input 
                type="file" 
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2.5">
                {file ? (
                  <>
                    <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                      <FileSpreadsheet size={24} strokeWidth={1.75} />
                    </div>
                    <span className="text-sm font-medium text-[var(--apple-text)] truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <span className="text-xs text-[var(--apple-blue)] font-medium">Click to replace</span>
                  </>
                ) : (
                  <>
                    <div className="bg-[var(--apple-gray-100)] p-3 rounded-xl text-[var(--apple-text-secondary)] 
                      group-hover:bg-white group-hover:shadow-sm group-hover:text-[var(--apple-blue)] transition-all duration-200">
                      <Upload size={24} strokeWidth={1.75} />
                    </div>
                    <span className="text-sm text-[var(--apple-text-secondary)] font-medium">
                      Click to upload Excel file
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status Message */}
          {status.message && (
            <div className={`p-3.5 rounded-xl text-sm flex items-start gap-2.5 animate-slide-up
              ${status.type === 'success' 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                : 'bg-red-50 text-red-600 border border-red-200'
              }`}
            >
              {status.type === 'success' 
                ? <Check size={18} className="mt-0.5 flex-shrink-0" strokeWidth={2} /> 
                : <AlertCircle size={18} className="mt-0.5 flex-shrink-0" strokeWidth={2} />
              }
              <span className="font-medium">{status.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3.5 px-4 bg-[var(--apple-blue)] hover:bg-[var(--apple-blue-hover)] text-white 
              rounded-xl font-semibold text-[15px] shadow-sm hover:shadow-lg transition-all duration-200 
              active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed 
              flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Update Product List</span>
            )}
          </button>
          
          <p className="text-xs text-[var(--apple-text-secondary)] text-center">
            Updates the dropdown list for {activeTab === 'receipt' ? 'Receipt & Issuance' : 'Production Entry'} forms.
          </p>

        </form>
      </div>
    </div>
  );
}
