import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { USERS } from '../utils/constants';
import { Calendar } from 'lucide-react';

interface HeaderProps {
  selectedUser: string;
  setSelectedUser: (user: string) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
}

const Header: React.FC<HeaderProps> = ({ selectedUser, setSelectedUser, selectedDate, setSelectedDate }) => {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-[#86868b] uppercase tracking-wider mb-6">General Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="block text-[15px] font-medium text-[#1d1d1f]">
            User Name <span className="text-[#ff3b30]">*</span>
          </label>
          <div className="relative">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full p-4 bg-[#f5f5f7] border-none rounded-2xl text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 focus:bg-white transition-all outline-none appearance-none font-medium cursor-pointer hover:bg-[#e5e5ea]"
            >
              <option value="" disabled>Select User</option>
              {USERS.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#86868b]">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-[15px] font-medium text-[#1d1d1f]">
            Date <span className="text-[#ff3b30]">*</span>
          </label>
          <div className="relative group">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd-MM-yyyy"
              className="w-full p-4 !pl-14 bg-[#f5f5f7] border-none rounded-2xl text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 focus:bg-white transition-all outline-none font-medium placeholder-gray-400 group-hover:bg-[#e5e5ea]"
              placeholderText="dd-mm-yyyy"
            />
            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
