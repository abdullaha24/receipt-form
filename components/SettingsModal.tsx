import React, { useState } from 'react';
import { Upload, X, Check, AlertCircle, FileSpreadsheet } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateSuccess: () => void; // Callback to trigger re-fetch of products
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
      // Clear file input
      setFile(null);
      // Trigger parent refresh
      onUpdateSuccess();
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileSpreadsheet className="text-blue-600" size={24} />
            Manage Products
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => { setActiveTab('receipt'); setStatus({ type: null, message: '' }); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'receipt' ? 'text-blue-600 border-blue-600 bg-blue-50/50' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
          >
            Receipt & Issuance
          </button>
          <button
            onClick={() => { setActiveTab('production'); setStatus({ type: null, message: '' }); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'production' ? 'text-blue-600 border-blue-600 bg-blue-50/50' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
          >
            Production
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase">Sheet Name</label>
                    <input 
                        type="text" 
                        value={sheetName} 
                        onChange={(e) => setSheetName(e.target.value)}
                        placeholder="e.g. Sheet1"
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase">Column (Letter)</label>
                    <input 
                        type="text" 
                        value={columnRef} 
                        onChange={(e) => setColumnRef(e.target.value.toUpperCase())}
                        placeholder="e.g. A"
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
             </div>

             <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Excel File</label>
                <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 hover:bg-gray-50 hover:border-blue-300 transition-colors text-center cursor-pointer group">
                    <input 
                        type="file" 
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-2">
                        {file ? (
                             <>
                                <FileSpreadsheet className="text-green-500" size={24} />
                                <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{file.name}</span>
                                <span className="text-xs text-blue-500 group-hover:underline">Click to change</span>
                             </>
                        ) : (
                            <>
                                <Upload className="text-gray-400 group-hover:text-blue-500 transition-colors" size={24} />
                                <span className="text-sm text-gray-500">Click to upload Excel file</span>
                            </>
                        )}
                    </div>
                </div>
             </div>
          </div>

          {/* Status Message */}
          {status.message && (
            <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {status.type === 'success' ? <Check size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5" />}
                {status.message}
            </div>
          )}

          <div className="pt-2">
            <button
                type="submit"
                disabled={isUploading}
                className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isUploading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        Update Product List
                    </>
                )}
            </button>
          </div>
          
           <p className="text-xs text-gray-400 text-center">
              Target: {activeTab === 'receipt' ? 'receipt/issuance' : 'production'} forms
           </p>

        </form>
      </div>
    </div>
  );
}
