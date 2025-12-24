import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { USERS } from "../utils/constants";
import { Calendar, ChevronDown, FileText, Hash } from "lucide-react";

interface HeaderProps {
  selectedUser: string;
  setSelectedUser: (user: string) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  // Optional fields for DC Entry
  billNumber?: string;
  setBillNumber?: (value: string) => void;
  dcNumber?: string;
  setDcNumber?: (value: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  selectedUser,
  setSelectedUser,
  selectedDate,
  setSelectedDate,
  billNumber,
  setBillNumber,
  dcNumber,
  setDcNumber,
}) => {
  const showDcFields = billNumber !== undefined && dcNumber !== undefined;

  return (
    <div>
      <h2 className="text-sm font-semibold text-[var(--apple-text-secondary)] uppercase tracking-wider mb-5 pb-3 border-b border-[var(--apple-gray-200)]">
        General Information
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        {/* User Name Field */}
        <div className="space-y-2">
          <label className="block text-[15px] font-medium text-[var(--apple-text)]">
            User Name <span className="text-[var(--apple-red)]">*</span>
          </label>
          <div className="relative">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full py-3.5 px-4 bg-[var(--apple-gray-100)] border-2 border-transparent rounded-xl 
                text-[var(--apple-text)] text-[15px] font-medium 
                focus:bg-white focus:border-[var(--apple-blue)] focus:ring-4 focus:ring-[var(--apple-blue)]/10 
                hover:bg-[var(--apple-gray-200)] transition-all duration-200 outline-none appearance-none cursor-pointer"
            >
              <option value="" disabled>
                Select User
              </option>
              {USERS.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--apple-text-secondary)]">
              <ChevronDown size={18} strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Date Field */}
        <div className="space-y-2">
          <label className="block text-[15px] font-medium text-[var(--apple-text)]">
            Date <span className="text-[var(--apple-red)]">*</span>
          </label>
          <div className="relative group">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd-MM-yyyy"
              className="w-full py-3.5 px-4 !pl-12 bg-[var(--apple-gray-100)] border-2 border-transparent rounded-xl 
                text-[var(--apple-text)] text-[15px] font-medium 
                focus:bg-white focus:border-[var(--apple-blue)] focus:ring-4 focus:ring-[var(--apple-blue)]/10 
                group-hover:bg-[var(--apple-gray-200)] transition-all duration-200 outline-none cursor-pointer"
              placeholderText="dd-mm-yyyy"
            />
            <Calendar
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--apple-text-secondary)] w-5 h-5 pointer-events-none"
              strokeWidth={1.75}
            />
          </div>
        </div>

        {/* Bill # Field - Only for DC Entry */}
        {showDcFields && setBillNumber && (
          <div className="space-y-2">
            <label className="block text-[15px] font-medium text-[var(--apple-text)]">
              Bill # <span className="text-[var(--apple-red)]">*</span>
            </label>
            <div className="relative group">
              <input
                type="text"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                placeholder="Enter Bill Number"
                className="w-full py-3.5 px-4 !pl-12 bg-[var(--apple-gray-100)] border-2 border-transparent rounded-xl 
                  text-[var(--apple-text)] text-[15px] font-medium 
                  focus:bg-white focus:border-[var(--apple-blue)] focus:ring-4 focus:ring-[var(--apple-blue)]/10 
                  group-hover:bg-[var(--apple-gray-200)] transition-all duration-200 outline-none"
              />
              <FileText
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--apple-text-secondary)] w-5 h-5 pointer-events-none"
                strokeWidth={1.75}
              />
            </div>
          </div>
        )}

        {/* DC # Field - Only for DC Entry */}
        {showDcFields && setDcNumber && (
          <div className="space-y-2">
            <label className="block text-[15px] font-medium text-[var(--apple-text)]">
              DC # <span className="text-[var(--apple-red)]">*</span>
            </label>
            <div className="relative group">
              <input
                type="text"
                value={dcNumber}
                onChange={(e) => setDcNumber(e.target.value)}
                placeholder="Enter DC Number"
                className="w-full py-3.5 px-4 !pl-12 bg-[var(--apple-gray-100)] border-2 border-transparent rounded-xl 
                  text-[var(--apple-text)] text-[15px] font-medium 
                  focus:bg-white focus:border-[var(--apple-blue)] focus:ring-4 focus:ring-[var(--apple-blue)]/10 
                  group-hover:bg-[var(--apple-gray-200)] transition-all duration-200 outline-none"
              />
              <Hash
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--apple-text-secondary)] w-5 h-5 pointer-events-none"
                strokeWidth={1.75}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
