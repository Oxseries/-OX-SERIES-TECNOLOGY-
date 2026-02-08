import React, { useState, useEffect } from 'react';
import { Language } from './types';
import { TRANSLATIONS } from './constants';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Ritual from './components/Ritual';
import AIAssistant from './components/AIAssistant';
import PharmacyLocator from './components/PharmacyLocator';
import Footer from './components/Footer';
import AdvantageModal from './components/AdvantageModal';
import ApplicationRequest from './components/ApplicationRequest';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('tr');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = (key: keyof typeof TRANSLATIONS['tr']) => TRANSLATIONS[lang][key];

  return (
    <div className="min-h-screen bg-brand-white text-brand-black">
      <Navbar 
        lang={lang} 
        setLang={setLang} 
        isScrolled={isScrolled} 
        t={t} 
      />
      
      <main>
        <Hero t={t} lang={lang} />
        <Ritual t={t} />
        <ApplicationRequest t={t} />
        <AIAssistant lang={lang} t={t} />
        <PharmacyLocator t={t} lang={lang} />
      </main>

      <Footer t={t} />

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand-black text-brand-white rounded-full shadow-2xl flex items-center justify-center font-bold tracking-widest hover:scale-110 transition-transform z-40 border border-brand-gold/20"
      >
        OX
      </button>

      {isModalOpen && (
        <AdvantageModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          t={t}
          lang={lang}
          setLang={setLang}
        />
      )}
    </div>
  );
};

export default App;