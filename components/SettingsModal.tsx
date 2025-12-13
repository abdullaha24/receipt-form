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
        <div className="flex justify-between items-center p-6 border-b border-gray-100/50">
          <h2 className="text-xl font-semibold text-[#1d1d1f] flex items-center gap-2 tracking-tight">
            <FileSpreadsheet className="text-[#0071e3]" size={22} />
            Manage Products
          </h2>
          <button onClick={onClose} className="text-[#86868b] hover:text-[#1d1d1f] bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Apple Style Segmented Control */}
        <div className="px-6 pt-6">
            <div className="flex bg-[#f5f5f7] p-1 rounded-xl">
            <button
                onClick={() => { setActiveTab('receipt'); setStatus({ type: null, message: '' }); }}
                className={`flex-1 py-1.5 text-[13px] font-medium rounded-lg transition-all shadow-sm ${activeTab === 'receipt' ? 'bg-white text-[#1d1d1f] shadow' : 'bg-transparent text-[#86868b] shadow-none hover:text-[#1d1d1f]'}`}
            >
                Receipt & Issuance
            </button>
            <button
                onClick={() => { setActiveTab('production'); setStatus({ type: null, message: '' }); }}
                className={`flex-1 py-1.5 text-[13px] font-medium rounded-lg transition-all shadow-sm ${activeTab === 'production' ? 'bg-white text-[#1d1d1f] shadow' : 'bg-transparent text-[#86868b] shadow-none hover:text-[#1d1d1f]'}`}
            >
                Production
            </button>
            </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
          <div className="space-y-5">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[13px] font-medium text-[#1d1d1f]">Sheet Name</label>
                    <input 
                        type="text" 
                        value={sheetName} 
                        onChange={(e) => setSheetName(e.target.value)}
                        placeholder="e.g. Sheet1"
                        className="w-full p-3 bg-[#f5f5f7] border-none rounded-xl text-sm text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 focus:bg-white transition-all outline-none placeholder-gray-400"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[13px] font-medium text-[#1d1d1f]">Column (Letter)</label>
                    <input 
                        type="text" 
                        value={columnRef} 
                        onChange={(e) => setColumnRef(e.target.value.toUpperCase())}
                        placeholder="e.g. A"
                        className="w-full p-3 bg-[#f5f5f7] border-none rounded-xl text-sm text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 focus:bg-white transition-all outline-none placeholder-gray-400"
                    />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[13px] font-medium text-[#1d1d1f]">Excel File</label>
                <div className="relative border border-dashed border-[#d2d2d7] rounded-2xl p-6 hover:bg-[#f5f5f7] hover:border-[#0071e3]/50 transition-all text-center cursor-pointer group">
                    <input 
                        type="file" 
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-2">
                        {file ? (
                             <>
                                <div className="bg-[#34c759]/10 p-3 rounded-full text-[#34c759]">
                                    <FileSpreadsheet size={24} />
                                </div>
                                <span className="text-sm font-medium text-[#1d1d1f] truncate max-w-[200px]">{file.name}</span>
                                <span className="text-xs text-[#0071e3] font-medium group-hover:underline">Click to replace</span>
                             </>
                        ) : (
                            <>
                                <div className="bg-[#f5f5f7] p-3 rounded-full text-[#86868b] group-hover:bg-white group-hover:shadow-sm group-hover:text-[#0071e3] transition-all">
                                    <Upload size={24} />
                                </div>
                                <span className="text-sm text-[#86868b] font-medium">Click to upload Excel file</span>
                            </>
                        )}
                    </div>
                </div>
             </div>
          </div>

          {/* Status Message */}
          {status.message && (
            <div className={`p-3 rounded-xl text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-1 ${status.type === 'success' ? 'bg-[#34c759]/10 text-[#34c759]' : 'bg-[#ff3b30]/10 text-[#ff3b30]'}`}>
                {status.type === 'success' ? <Check size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5" />}
                <span className="font-medium">{status.message}</span>
            </div>
          )}

          <div className="pt-2">
            <button
                type="submit"
                disabled={isUploading}
                className="w-full py-3.5 px-4 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full font-semibold text-[15px] shadow-sm hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          
           <p className="text-[11px] text-[#86868b] text-center">
              Updates the dropdown list for {activeTab === 'receipt' ? 'Receipt & Issuance' : 'Production Entry'} forms.
           </p>

        </form>
      </div>
    </div>
  );
}
