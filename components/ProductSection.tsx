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
  availableProducts: string[];
  accentColor?: string;
}

const ProductSection: React.FC<ProductSectionProps> = ({ 
  index, 
  data, 
  updateData, 
  removeSection, 
  isOnlySection, 
  availableProducts,
  accentColor = 'text-blue-600 bg-blue-50'
}) => {
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
    <div className="bg-[var(--apple-gray-100)] p-5 sm:p-6 rounded-2xl relative transition-all duration-200 
      group border-2 border-transparent hover:border-[var(--apple-gray-200)]">
      
      {/* Section Header */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <span className="bg-white w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold 
            text-[var(--apple-text)] shadow-sm border border-[var(--apple-gray-200)]">
            {index + 1}
          </span>
          <h3 className="text-sm font-semibold text-[var(--apple-text-secondary)] uppercase tracking-wider">
            Product Details
          </h3>
        </div>
        
        {!isOnlySection && (
          <button 
            onClick={() => removeSection(index)}
            className="text-[var(--apple-red)] bg-white hover:bg-red-50 transition-all duration-200 
              p-2.5 rounded-xl shadow-sm border border-[var(--apple-gray-200)] hover:border-red-200"
            title="Remove item"
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Product Name (Searchable Dropdown) */}
        <div className="space-y-2" ref={wrapperRef}>
          <label className="block text-[15px] font-medium text-[var(--apple-text)]">
            Product Name <span className="text-[var(--apple-red)]">*</span>
          </label>
          <div className="relative">
            <div
              className={`w-full py-3.5 px-4 bg-white border-2 rounded-xl flex justify-between items-center 
                cursor-pointer shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)] transition-all duration-200 
                ${isOpen 
                  ? 'border-[var(--apple-blue)] ring-4 ring-[var(--apple-blue)]/10' 
                  : 'border-[var(--apple-gray-200)] hover:border-[var(--apple-gray-300)]'
                }`}
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className={`text-[15px] ${data.productName ? 'text-[var(--apple-text)] font-medium' : 'text-[var(--apple-text-secondary)]'}`}>
                {data.productName || "Select Product"}
              </span>
              <ChevronDown 
                className={`w-5 h-5 text-[var(--apple-text-secondary)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                strokeWidth={2}
              />
            </div>

            {isOpen && (
              <div className="absolute z-30 w-full mt-2 bg-white/95 backdrop-blur-xl border border-[var(--apple-gray-200)] 
                rounded-xl shadow-[var(--shadow-xl)] max-h-64 overflow-hidden animate-scale-in">
                
                {/* Search Input */}
                <div className="p-3 sticky top-0 bg-white/90 backdrop-blur-sm border-b border-[var(--apple-gray-200)]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--apple-text-secondary)] w-4 h-4" strokeWidth={2} />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-[var(--apple-gray-100)] border-2 border-transparent rounded-lg 
                        focus:bg-white focus:border-[var(--apple-blue)] focus:ring-2 focus:ring-[var(--apple-blue)]/10 
                        text-[var(--apple-text)] outline-none transition-all duration-200 placeholder:text-[var(--apple-text-secondary)]"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                      onClick={(e) => e.stopPropagation()} 
                    />
                  </div>
                </div>
                
                {/* Options List */}
                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                  {availableProducts.length === 0 ? (
                    <div className="px-4 py-4 text-sm text-amber-600 bg-amber-50/50 text-center">
                      List is empty. Use settings to update.
                    </div>
                  ) : filteredProducts.length > 0 ? (
                    <ul className="py-1.5 px-1.5">
                      {filteredProducts.map((product, idx) => (
                        <li
                          key={`${product}-${idx}`}
                          className={`px-3 py-2.5 text-[15px] cursor-pointer transition-all duration-150 rounded-lg mx-0.5 my-0.5
                            ${data.productName === product 
                              ? 'bg-[var(--apple-blue)] text-white font-medium' 
                              : 'text-[var(--apple-text)] hover:bg-[var(--apple-gray-100)]'
                            }`}
                          onClick={() => handleSelectProduct(product)}
                        >
                          {product}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-4 text-sm text-[var(--apple-text-secondary)] text-center">
                      No products found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quantity */}
        <div className="space-y-2 relative">
          <label className="block text-[15px] font-medium text-[var(--apple-text)]">
            Quantity <span className="text-[var(--apple-red)]">*</span>
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={data.quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            placeholder="0"
            className={`w-full py-3.5 px-4 bg-white border-2 rounded-xl shadow-[var(--shadow-xs)] 
              transition-all duration-200 outline-none text-[15px] font-medium placeholder-[var(--apple-gray-300)]
              ${showWarning 
                ? 'border-[var(--apple-red)] focus:ring-4 focus:ring-[var(--apple-red)]/15' 
                : 'border-[var(--apple-gray-200)] hover:border-[var(--apple-gray-300)] focus:border-[var(--apple-blue)] focus:ring-4 focus:ring-[var(--apple-blue)]/10'
              }`}
          />
          {showWarning && (
            <div className="absolute z-10 left-0 -bottom-10 bg-[var(--apple-red)] text-white text-xs px-3 py-2 
              rounded-lg shadow-lg font-medium animate-slide-up">
              Only numbers allowed.
            </div>
          )}
        </div>

        {/* Notes (Optional) */}
        <div className="space-y-2">
          <label className="block text-[15px] font-medium text-[var(--apple-text)]">
            Notes <span className="text-[var(--apple-text-secondary)] text-xs font-normal ml-1">(Optional)</span>
          </label>
          <textarea
            value={data.notes}
            onChange={(e) => updateData(index, 'notes', e.target.value)}
            placeholder="Add any additional details about this item..."
            rows={2}
            className="w-full py-3 px-4 bg-white border-2 border-[var(--apple-gray-200)] rounded-xl shadow-[var(--shadow-xs)]
              hover:border-[var(--apple-gray-300)] focus:border-[var(--apple-blue)] focus:ring-4 focus:ring-[var(--apple-blue)]/10 
              transition-all duration-200 outline-none resize-none text-[15px] placeholder-[var(--apple-gray-300)]"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductSection;
