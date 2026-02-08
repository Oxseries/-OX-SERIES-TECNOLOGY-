import React from 'react';

interface FooterProps {
  t: (key: any) => string;
}

const Footer: React.FC<FooterProps> = ({ t }) => {
  return (
    <footer className="bg-brand-black text-brand-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <h2 className="text-3xl font-serif font-bold tracking-widest">OX SERIES</h2>
            <p className="text-white/50 max-w-sm leading-relaxed text-sm">
              Science meets nature to redefine the standards of modern skincare. 
              Our premium collagen technology delivers visible results from the first application.
            </p>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-xs font-bold tracking-[0.3em] uppercase opacity-40">{t('footer_links_title')}</h4>
            <nav className="flex flex-col gap-4 text-sm font-medium">
              <a href="#product" className="hover:opacity-50 transition-opacity">{t('nav_collection')}</a>
              <a href="#ritual" className="hover:opacity-50 transition-opacity">{t('nav_ritual')}</a>
              <a href="#ai" className="hover:opacity-50 transition-opacity">{t('nav_expert')}</a>
            </nav>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold tracking-[0.3em] uppercase opacity-40">{t('footer_contact_title')}</h4>
            <div className="text-sm space-y-2 opacity-60">
              <p>İZMİR, Turkey</p>
              <p>foilox.tr@gmail.com</p>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold tracking-[0.2em] uppercase opacity-40">
          <p>{t('footer_copy')}</p>
          <div className="flex gap-10">
            <a href="#" className="hover:opacity-100 transition-opacity">{t('footer_privacy')}</a>
            <a href="#" className="hover:opacity-100 transition-opacity">{t('footer_terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;