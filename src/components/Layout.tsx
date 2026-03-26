import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Info, ShieldCheck, Menu, X } from 'lucide-react';
import { cn } from '../utils';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Axtarış', path: '/', icon: Search },
    { name: 'Metodologiya', path: '/methodology', icon: Info },
    { name: 'Admin', path: '/admin', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-blue-600">QIYMET.AZ</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-blue-600",
                  location.pathname === item.path ? "text-blue-600" : "text-slate-600"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white p-4">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 text-base font-medium p-2 rounded-lg",
                    location.pathname === item.path ? "bg-blue-50 text-blue-600" : "text-slate-600"
                  )}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <span className="text-xl font-black tracking-tighter text-blue-600">QIYMET.AZ</span>
              <p className="mt-4 text-sm text-slate-500 max-w-xs">
                Azərbaycanın ən böyük supermarketlərindəki qiymətləri müqayisə edin və qənaət edin.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-4">Keçidlər</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/" className="hover:text-blue-600">Əsas səhifə</Link></li>
                <li><Link to="/methodology" className="hover:text-blue-600">Metodologiya</Link></li>
                <li><Link to="/admin" className="hover:text-blue-600">Admin Panel</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-4">Haqqımızda</h3>
              <p className="text-sm text-slate-600">
                Bu layihə istehlakçıların şəffaf qiymət məlumatlarına çıxışını təmin etmək üçün yaradılmışdır.
              </p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
            © 2026 QIYMET.AZ. Bütün hüquqlar qorunur.
          </div>
        </div>
      </footer>
    </div>
  );
}
