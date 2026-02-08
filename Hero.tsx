
import React, { useState, useEffect } from 'react';
import { Language } from '../types';

interface HeroProps {
  t: (key: any) => string;
  lang: Language;
}

const Hero: React.FC<HeroProps> = ({ t, lang }) => {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const progress = Math.min(window.scrollY / 800, 1);
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = async () => {
    setIsSharing(true);
    const rawUrl = window.location.href;
    const shareUrl = rawUrl.startsWith('http') ? rawUrl : 'https://oxseries.com';
    const imageUrl = "https://cdn.gamma.app/8cw4vo9fmjp4hoq/e2447d70872941f883d980da4720ff87/original/photo_2026-02-03-18.57.34.jpeg";

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    };

    try {
      if (navigator.share && typeof navigator.canShare === 'function') {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'ox-series-gold.jpg', { type: 'image/jpeg' });
        const shareData: any = {
          title: 'OX SERIES | Premium Collagen Peeling',
          text: lang === 'tr' ? 'OX SERIES ile cilt bakımının geleceğini keşfedin.' : 'Discover the future of skincare with OX SERIES.',
          url: shareUrl,
        };
        if (navigator.canShare({ files: [file] })) shareData.files = [file];
        await navigator.share(shareData);
      } else {
        await copyToClipboard();
      }
    } catch (err) {
      await copyToClipboard();
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <section id="product" className="relative min-h-screen flex flex-col items-center justify-start pt-32 md:pt-48 pb-20 bg-brand-white overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-gold/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-brand-gold/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto w-full px-6 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="mb-8 md:mb-12 overflow-hidden">
          <span className="inline-block text-brand-gold text-[9px] md:text-[11px] font-bold tracking-[0.8em] md:tracking-[1.2em] uppercase animate-fade-in opacity-0 [animation-fill-mode:forwards]">
            {t('hero_badge')}
          </span>
        </div>
        
        {/* Main Title - Updated with Modern Luxury Font */}
        <h1 className="flex flex-col items-center mb-10 md:mb-14 select-none">
          <span className="text-5xl md:text-7xl lg:text-[6.5rem] font-modern font-light italic tracking-tight text-brand-black leading-none animate-fade-up opacity-0 [animation-fill-mode:forwards] [animation-delay:200ms]">
            {t('hero_title').split(' ')[0]}
          </span>
          <span className="text-6xl md:text-8xl lg:text-[10rem] font-modern font-black tracking-tighter uppercase leading-[0.8] text-brand-black mt-4 animate-fade-up opacity-0 [animation-fill-mode:forwards] [animation-delay:400ms]">
            {t('hero_title').split(' ').slice(1).join(' ')}
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-sm md:text-base lg:text-lg text-brand-black/40 max-w-xl leading-[1.8] font-medium tracking-wide mb-12 animate-fade-up opacity-0 [animation-fill-mode:forwards] [animation-delay:600ms]">
          {t('hero_subtitle')}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-10 animate-fade-up opacity-0 [animation-fill-mode:forwards] [animation-delay:800ms]">
          <button 
            onClick={handleShare}
            disabled={isSharing}
            className={`group flex items-center gap-4 px-12 py-5 rounded-full border border-brand-black transition-all duration-700 relative overflow-hidden ${copied ? 'bg-green-600 border-green-600' : 'bg-brand-black text-white hover:bg-transparent hover:text-brand-black'}`}
          >
            <span className="relative z-10 font-bold uppercase tracking-[0.3em] text-[9px] md:text-[10px]">
              {copied ? t('btn_copied') : isSharing ? '...' : t('btn_share')}
            </span>
          </button>
          
          <a 
            href="#ritual" 
            className="group flex items-center gap-4 py-4 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-brand-black/60 hover:text-brand-black transition-colors"
          >
            <span className="w-8 h-[1px] bg-brand-gold transition-all group-hover:w-12"></span>
            {t('btn_explore')}
          </a>
        </div>

        {/* Featured Image Container */}
        <div className="mt-20 md:mt-32 w-full max-w-5xl px-4 perspective-text">
          <div 
            className="relative rounded-[2.5rem] md:rounded-[5rem] overflow-hidden shadow-2xl transition-all duration-1000 ease-out border border-brand-border"
            style={{ 
              transform: `scale(${0.9 + (scrollProgress * 0.1)}) translateY(${scrollProgress * -20}px)`,
              opacity: 0.85 + (scrollProgress * 0.15)
            }}
          >
            <img 
              src="https://cdn.gamma.app/8cw4vo9fmjp4hoq/e2447d70872941f883d980da4720ff87/original/photo_2026-02-03-18.57.34.jpeg" 
              alt="OX SERIES Liquid Gold" 
              className="w-full h-auto object-cover scale-100 transition-transform duration-[4s] hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-white/10 to-transparent"></div>
          </div>
          
          {/* Floating Subtle Label */}
          <div className="absolute top-10 right-10 hidden lg:block animate-float">
             <div className="flex flex-col items-end">
                <span className="text-[8px] font-bold tracking-[0.4em] uppercase text-brand-gold mb-1">Authentic</span>
                <span className="text-xl font-header font-black tracking-widest text-brand-black/20">OX-V2</span>
             </div>
          </div>
        </div>
      </div>

      {/* Center Scroll Indicator */}
      <div className="absolute bottom-12 flex flex-col items-center gap-4 opacity-20 group cursor-pointer" onClick={() => window.scrollTo({top: window.innerHeight, behavior: 'smooth'})}>
        <span className="text-[8px] font-bold uppercase tracking-[0.5em] group-hover:text-brand-gold transition-colors">Discover</span>
        <div className="w-[1px] h-16 bg-gradient-to-b from-brand-black to-transparent group-hover:h-24 transition-all duration-700"></div>
      </div>
    </section>
  );
};

export default Hero;
