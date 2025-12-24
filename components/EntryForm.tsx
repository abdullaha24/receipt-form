import React, { useState, useEffect } from 'react';
import Header from './Header';
import ProductSection from './ProductSection';
import SettingsModal from './SettingsModal';
import { Plus, Check, Loader2, Settings, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import Logo from './Logo';

interface EntryFormProps {
  title: string;
  type: 'receipt' | 'issuance' | 'production' | 'dc-entry';
}

interface ProductData {
  productName: string;
  quantity: string;
  notes: string;
}

const EntryForm: React.FC<EntryFormProps> = ({ title, type }) => {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [billNumber, setBillNumber] = useState("");
  const [dcNumber, setDcNumber] = useState("");
  const [products, setProducts] = useState<ProductData[]>([
    { productName: "", quantity: "", notes: "" }
  ]);
  const [availableProducts, setAvailableProducts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedProducts, setSubmittedProducts] = useState<ProductData[]>([]);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
        // dc-entry uses the same products as production
        const fetchType = type === 'dc-entry' ? 'production' : type;
        const res = await fetch(`/api/products?type=${fetchType}`);
        if(res.ok) {
            const data = await res.json();
            setAvailableProducts(data || []);
        }
    } catch (error) {
        console.error("Failed to fetch products", error);
    } finally {
        setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [type]);

  const updateProductData = (index: number, field: keyof ProductData, value: string) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const addProductSection = () => {
    setProducts([...products, { productName: "", quantity: "", notes: "" }]);
  };

  const removeProductSection = (index: number) => {
    if (products.length > 1) {
      const newProducts = products.filter((_, i) => i !== index);
      setProducts(newProducts);
    }
  };

  const getThemeColor = () => {
    switch (type) {
      case 'receipt': return 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/25';
      case 'issuance': return 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/25';
      case 'production': return 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25';
      case 'dc-entry': return 'bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 shadow-lg shadow-cyan-500/25';
      default: return 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25';
    }
  };

  const getThemeAccent = () => {
    switch (type) {
      case 'receipt': return 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200';
      case 'issuance': return 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200';
      case 'production': return 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200';
      case 'dc-entry': return 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100 border-cyan-200';
      default: return 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200';
    }
  };

  const handleSubmit = async () => {
    // Basic Validation
    if (!selectedUser) {
        alert("Please select a User.");
        return;
    }
    if (!selectedDate) {
        alert("Please select a Date.");
        return;
    }
    
    // Validate DC Entry specific fields
    if (type === 'dc-entry') {
        if (!billNumber.trim()) {
            alert("Please enter a Bill #.");
            return;
        }
        if (!dcNumber.trim()) {
            alert("Please enter a DC #.");
            return;
        }
    }
    
    for (let i = 0; i < products.length; i++) {
        if (!products[i].productName) {
            alert(`Please select a Product for Item ${i + 1}.`);
            return;
        }
        if (!products[i].quantity) {
             alert(`Please enter a Quantity for Item ${i + 1}.`);
             return;
        }
    }

    setIsSubmitting(true);
    
    // Construct Payload
    const payload = {
        header: {
            formType: type,
            user: selectedUser,
            date: format(selectedDate, 'yyyy-MM-dd'),
            ...(type === 'dc-entry' && { billNumber, dcNumber }),
            submissionTimestamp: format(new Date(), 'MM/dd/yyyy HH:mm:ss')
        },
        body: {
            products: products
        }
    };

    console.log("Form Submission Payload:", JSON.stringify(payload, null, 2));

    try {
        // 2. Send data to the endpoint via server-side proxy
        const uploadRes = await fetch('/api/submit-entry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!uploadRes.ok) {
             throw new Error(`External API Error: ${uploadRes.status} ${uploadRes.statusText}`);
        }

        // Success
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
        
        setSubmittedProducts(products);
        setShowSuccessModal(true);

        
        // Reset Form
        setSelectedUser("");
        setSelectedDate(new Date());
        setBillNumber("");
        setDcNumber("");
        setProducts([{ productName: "", quantity: "", notes: "" }]);

    } catch (error: any) {
        console.error("Submission Error:", error);
        alert(`Submission Failed: ${error.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--apple-bg)] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Area */}
        <div className="mb-8 sm:mb-10">
          {/* Back button and settings */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <Link 
                href="/"
                className="inline-flex items-center gap-2 text-[var(--apple-text-secondary)] hover:text-[var(--apple-text)] 
                  bg-white hover:bg-[var(--apple-gray-100)] px-4 py-2 rounded-full border border-[var(--apple-border)]/50 
                  shadow-[var(--shadow-xs)] transition-all duration-200 text-[15px] font-medium"
              >
                <ArrowLeft size={18} strokeWidth={2} />
                <span>Back</span>
              </Link>
            </div>
            
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 text-[var(--apple-text-secondary)] hover:text-[var(--apple-blue)] 
                bg-white hover:bg-[var(--apple-blue)]/10 rounded-full border border-[var(--apple-border)]/50 
                shadow-[var(--shadow-xs)] hover:border-[var(--apple-blue)]/30 transition-all duration-200"
              title="Manage Products"
            >
              <Settings size={20} strokeWidth={1.75} />
            </button>
          </div>
          
          {/* Title */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-[var(--apple-text)] tracking-tight">
              {title}
            </h1>
            <p className="mt-2 text-base sm:text-lg text-[var(--apple-text-secondary)]">
              Record a new {type} entry.
            </p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[var(--shadow-lg)] border border-black/[0.04] overflow-hidden">
             
          <div className="p-5 sm:p-8">
            <Header
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              {...(type === 'dc-entry' && {
                billNumber,
                setBillNumber,
                dcNumber,
                setDcNumber
              })}
            />

            {/* Items Section */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-[var(--apple-gray-200)]">
                <h2 className="text-sm font-semibold text-[var(--apple-text-secondary)] uppercase tracking-wider">
                  Items
                </h2>
                {isLoadingProducts && (
                  <span className="text-xs text-[var(--apple-text-secondary)] flex items-center gap-1.5 animate-pulse-soft">
                    <Loader2 size={12} className="animate-spin" />
                    Syncing...
                  </span>
                )}
              </div>
               
              <div className="space-y-4">
                {products.map((product, index) => (
                  <ProductSection
                    key={index}
                    index={index}
                    data={product}
                    updateData={updateProductData}
                    removeSection={removeProductSection}
                    isOnlySection={products.length === 1}
                    availableProducts={availableProducts}
                    accentColor={getThemeAccent()}
                  />
                ))}
              </div>
            </div>

            {/* Add Item Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={addProductSection}
                className={`group flex items-center gap-2.5 font-medium py-2.5 px-5 rounded-full 
                  border transition-all duration-200 active:scale-95 ${getThemeAccent()}`}
              >
                <div className="bg-white rounded-full p-1 shadow-sm group-hover:shadow group-active:scale-90 transition-all">
                  <Plus size={14} strokeWidth={2.5} />
                </div>
                <span className="text-[15px]">Add Another Item</span>
              </button>
            </div>
          </div>

          {/* Submit Footer */}
          <div className="bg-[var(--apple-gray-50)] p-4 sm:p-6 border-t border-[var(--apple-gray-200)] 
            flex justify-end sticky bottom-0 z-10 backdrop-blur-xl bg-opacity-90">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full sm:w-auto py-3.5 px-8 sm:px-10 rounded-xl text-white font-semibold text-base 
                transform transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2.5 
                focus:outline-none focus:ring-4 focus:ring-opacity-30 disabled:opacity-60 disabled:cursor-not-allowed 
                hover:shadow-xl ${getThemeColor()}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Submit Entry</span>
                  <Check size={18} strokeWidth={2.5} />
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile spacer */}
        <div className="h-20 sm:h-0"></div>
      </div>
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onUpdateSuccess={fetchProducts}
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[var(--shadow-modal)] w-full max-w-lg overflow-hidden animate-scale-in border border-white/20">
            
            {/* Success Header */}
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-b border-emerald-100 flex items-center gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/30">
                <Check size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--apple-text)] tracking-tight">Success!</h3>
                <p className="text-[var(--apple-text-secondary)] text-[15px]">Your entry has been recorded.</p>
              </div>
            </div>
            
            {/* Products Table */}
            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-[var(--apple-gray-50)] sticky top-0 z-10">
                  <tr>
                    <th className="py-3.5 px-5 text-xs font-semibold text-[var(--apple-text-secondary)] uppercase tracking-wider border-b border-[var(--apple-gray-200)]">Product</th>
                    <th className="py-3.5 px-5 text-xs font-semibold text-[var(--apple-text-secondary)] uppercase tracking-wider border-b border-[var(--apple-gray-200)]">Qty</th>
                    <th className="py-3.5 px-5 text-xs font-semibold text-[var(--apple-text-secondary)] uppercase tracking-wider border-b border-[var(--apple-gray-200)]">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--apple-gray-100)]">
                  {submittedProducts.map((p, i) => (
                    <tr key={i} className="hover:bg-[var(--apple-gray-50)] transition-colors">
                      <td className="py-4 px-5 text-[15px] font-medium text-[var(--apple-text)]">{p.productName}</td>
                      <td className="py-4 px-5 text-[15px] text-[var(--apple-text)] tabular-nums">{p.quantity}</td>
                      <td className="py-4 px-5 text-sm text-[var(--apple-text-secondary)]">{p.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-[var(--apple-gray-200)] bg-[var(--apple-gray-50)] flex justify-end">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-6 py-2.5 bg-[var(--apple-text)] hover:bg-black text-white font-medium text-[15px] 
                  rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryForm;
