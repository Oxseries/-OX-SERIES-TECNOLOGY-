import React, { useState, useEffect } from 'react';
import { Language } from '../types';

interface NavbarProps {
  lang: Language;
  setLang: (l: Language) => void;
  isScrolled: boolean;
  t: (key: any) => string;
}

const Navbar: React.FC<NavbarProps> = ({ lang, setLang, isScrolled, t }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const navItems = [
    { key: 'collection', id: 'product' },
    { key: 'ritual', id: 'ritual' },
    { key: 'expert', id: 'ai' },
    { key: 'stores', id: 'stores' }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 px-6 ${isScrolled ? 'py-4' : 'py-8'}`}>
      <div className={`max-w-[1600px] mx-auto h-16 md:h-20 flex items-center justify-between px-8 transition-all duration-700 ${isScrolled ? 'bg-white/80 backdrop-blur-2xl rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-brand-black/5' : 'bg-transparent'}`}>
        <a 
          href="#" 
          onClick={(e) => handleNavClick(e, 'product')}
          className="font-serif text-2xl md:text-3xl font-bold tracking-[0.2em] transition-transform hover:scale-105"
        >
          OX <span className="italic font-light">SERIES</span>
        </a>
        
        <nav className="hidden lg:flex items-center gap-12">
          {navItems.map((item) => (
            <a 
              key={item.key}
              href={`#${item.id}`} 
              onClick={(e) => handleNavClick(e, item.id)}
              className="group text-[10px] font-bold tracking-[0.4em] uppercase transition-colors relative"
            >
              <span className="group-hover:text-brand-gold transition-colors">{t(`nav_${item.key}`)}</span>
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brand-gold transition-all group-hover:w-full"></span>
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
            className="text-[9px] font-bold tracking-[0.2em] w-12 h-12 rounded-full border border-brand-black/5 flex items-center justify-center hover:bg-brand-black hover:text-white transition-all duration-500 bg-white/50"
          >
            {lang.toUpperCase()}
          </button>
          
          <button className="lg:hidden flex flex-col gap-1.5" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className={`w-6 h-0.5 bg-brand-black transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-brand-black transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed inset-0 bg-white z-[110] transition-transform duration-700 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col items-center justify-center h-full gap-12">
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 text-xs font-bold tracking-[0.4em] uppercase opacity-40">Close</button>
          {navItems.map((item) => (
            <a 
              key={item.key}
              href={`#${item.id}`} 
              onClick={(e) => handleNavClick(e, item.id)}
              className="text-4xl font-serif font-bold italic tracking-tight hover:text-brand-gold transition-colors"
            >
              {t(`nav_${item.key}`)}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;