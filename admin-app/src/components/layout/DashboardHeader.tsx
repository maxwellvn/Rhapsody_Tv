import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';

const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-[#D0D0D0]/50 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo Only */}
          <div className="flex items-center">
            <img 
              src="/assets/logo/Logo.png" 
              alt="Rhapsody TV Logo" 
              className="h-8 w-auto md:h-10"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-[#666666]">
              <span className="text-sm">Welcome,</span>
              <span className="text-sm font-semibold text-black">{user?.fullName || 'Admin'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-[#0000FF] to-[#0000CC] text-white rounded-lg hover:from-[#0000CC] hover:to-[#000099] transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              style={{
                boxShadow: '0 4px 15px rgba(0, 0, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#666666] hover:text-black transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#D0D0D0] bg-white/95 backdrop-blur-md">
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center gap-2 text-[#666666] pb-3 border-b border-[#D0D0D0]">
              <span className="text-sm">Welcome,</span>
              <span className="text-sm font-semibold text-black">{user?.fullName || 'Admin'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-[#0000FF] to-[#0000CC] text-white rounded-lg hover:from-[#0000CC] hover:to-[#000099] transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl"
              style={{
                boxShadow: '0 4px 15px rgba(0, 0, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;
