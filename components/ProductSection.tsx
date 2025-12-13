import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Trash2 } from 'lucide-react';

interface ProductData {
  productName: string;
  quantity: string;
  notes: string;
}

interface ProductSectionProps {
  index: number;
  data: ProductData;
  updateData: (index: number, field: keyof ProductData, value: string) => void;
  removeSection: (index: number) => void;
  isOnlySection: boolean;
  availableProducts: string[]; // [NEW] Accept dynamic list
}

const ProductSection: React.FC<ProductSectionProps> = ({ index, data, updateData, removeSection, isOnlySection, availableProducts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // [MODIFIED] Use the prop instead of constant
  const filteredProducts = availableProducts.filter(product =>
    product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectProduct = (product: string) => {
    updateData(index, 'productName', product);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleQuantityChange = (value: string) => {
    // Regex allows empty string, or positive/negative integers/decimals
    const isNumeric = /^-?\d*\.?\d*$/.test(value);
    
    if (isNumeric) {
      setShowWarning(false);
      updateData(index, 'quantity', value);
    } else {
      setShowWarning(true);
      updateData(index, 'quantity', value);
    }
  };

  return (
    <div className="bg-[#f5f5f7] p-6 rounded-2xl mb-6 relative transition-all group border border-transparent hover:border-[#d2d2d7]/50">
       <div className="flex justify-between items-center mb-5">
        <h3 className="text-sm font-bold text-[#86868b] uppercase tracking-wider flex items-center gap-2">
            <span className="bg-[#e5e5ea] w-6 h-6 rounded-full flex items-center justify-center text-xs text-[#1d1d1f]">{index + 1}</span>
            <span>Product Details</span>
        </h3>
        {!isOnlySection && (
            <button 
                onClick={() => removeSection(index)}
                className="text-[#ff3b30] bg-white hover:bg-[#fff0f0] transition-colors p-2 rounded-full shadow-sm"
                title="Remove item"
            >
                <Trash2 size={16} />
            </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Product Name (Searchable Dropdown) */}
        <div className="space-y-3" ref={wrapperRef}>
          <label className="block text-[15px] font-medium text-[#1d1d1f]">
            Product Name <span className="text-[#ff3b30]">*</span>
          </label>
          <div className="relative">
            <div
              className={`w-full p-4 bg-white border-2 border-transparent rounded-xl flex justify-between items-center cursor-pointer shadow-sm hover:shadow transition-all ${isOpen ? 'ring-2 ring-[#0071e3]/20 !border-[#0071e3]' : ''}`}
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className={data.productName ? 'text-[#1d1d1f] font-medium' : 'text-gray-400'}>
                {data.productName || "Select Product"}
              </span>
              <ChevronDown className={`w-4 h-4 text-[#86868b] transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            </div>

            {isOpen && (
              <div className="absolute z-20 w-full mt-2 bg-white/90 backdrop-blur-xl border border-[#d2d2d7] rounded-xl shadow-xl max-h-60 overflow-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                <div className="p-3 sticky top-0 bg-white/50 backdrop-blur border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-4 h-4" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 text-sm bg-[#f5f5f7] border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-[#1d1d1f]"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                      onClick={(e) => e.stopPropagation()} 
                    />
                  </div>
                </div>
                {availableProducts.length === 0 ? (
                     <div className="px-4 py-3 text-sm text-[#ff9f0a] bg-amber-50/50 text-center">
                        List is empty. Use settings to update.
                     </div>
                ) : filteredProducts.length > 0 ? (
                  <ul className="py-2">
                    {filteredProducts.map((product, idx) => (
                      <li
                        key={`${product}-${idx}`}
                        className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-[#0071e3] hover:text-white transition-colors flex items-center justify-between mx-2 rounded-lg ${data.productName === product ? 'bg-[#0071e3]/10 text-[#0071e3] font-bold' : 'text-[#1d1d1f]'}`}
                        onClick={() => handleSelectProduct(product)}
                      >
                        {product}
                      </li>
                    ))}
                  </ul>
                ) : (
                    <div className="px-4 py-3 text-sm text-[#86868b] text-center">No products found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quantity */}
        <div className="space-y-3 relative">
          <label className="block text-[15px] font-medium text-[#1d1d1f]">
            Quantity <span className="text-[#ff3b30]">*</span>
          </label>
          <input
            type="text"
            value={data.quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            placeholder="0"
            className={`w-full p-4 bg-white border-2 border-transparent rounded-xl shadow-sm transition-all outline-none font-medium placeholder-gray-300 ${showWarning ? '!border-[#ff3b30] focus:ring-4 focus:ring-[#ff3b30]/20' : 'focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10'}`}
          />
          {showWarning && (
            <div className="absolute z-10 left-0 -bottom-12 bg-[#ff3b30] text-white text-xs px-3 py-2 rounded-lg shadow-lg font-medium animate-in slide-in-from-top-2">
               Only numbers allowed.
            </div>
          )}
        </div>

        {/* Notes (Optional) */}
        <div className="space-y-3">
          <label className="block text-[15px] font-medium text-[#1d1d1f]">
            Notes <span className="text-[#86868b] text-xs font-normal ml-1">(Optional)</span>
          </label>
          <textarea
            value={data.notes}
            onChange={(e) => updateData(index, 'notes', e.target.value)}
            placeholder="Add any additional details about this item..."
            rows={2}
            className="w-full p-4 bg-white border-2 border-transparent rounded-xl shadow-sm focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 transition-all outline-none resize-none font-sans"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductSection;
