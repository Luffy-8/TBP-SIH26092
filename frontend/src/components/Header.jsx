import { useAuth } from '../context/AuthContext';
import LogoGraphic from '../assets/logo-graphic.png';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-xs print:hidden">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Section */}
        <div className="flex items-center gap-3">
          <img
            src={LogoGraphic}
            alt="Loan Saathi Logo"
            className="h-10 w-auto object-contain drop-shadow-sm transition-transform hover:scale-105"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-gray-900 tracking-tight leading-none">
                Loan Saathi
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                SIH26092
              </span>
            </div>
            <span className="text-[11px] text-gray-500 font-medium hidden sm:block">
              AI-Driven Scheme Matching Platform
            </span>
          </div>
        </div>

        {/* Navigation & User Section */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="font-medium">{user.username}</span>
                {user.demographics?.category && (
                  <span className="bg-orange-100 text-orange-700 font-semibold px-1.5 py-0.5 rounded text-[10px]">
                    {user.demographics.category}
                  </span>
                )}
              </div>
              <button
                onClick={logout}
                className="text-xs text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition font-medium cursor-pointer"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
