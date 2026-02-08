import React, { useState, useRef, useEffect } from 'react';
import { ADVANTAGE_PRODUCTS, INGREDIENTS_SERUM_TR, INGREDIENTS_CLEANSER_TR, INGREDIENTS_MOISTURIZER_TR, INGREDIENTS_VEGAN_SERUM_TR } from '../constants';
import { AdvantageProduct, Ingredient, Language } from '../types';

const TELEGRAM_BOT_TOKEN = '8268291221:AAGjOqG-nKzXxjbd4uuZ0A9OBnRtRnE7Lco'; 
const TELEGRAM_CHAT_ID = '1205997493'; 
const UTS_IMAGE_URL = "https://lh3.googleusercontent.com/d/14KRnNHIhGgurbILLRbwl3wEm8jrTgcue";

interface AdvantageModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: any) => string;
  lang: Language;
  setLang: (l: Language) => void;
}

const AdvantageModal: React.FC<AdvantageModalProps> = ({ isOpen, onClose, t, lang, setLang }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState(false);
  
  const [pharmacyName, setPharmacyName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [quickViewProduct, setQuickViewProduct] = useState<AdvantageProduct | null>(null);
  const [ingredientListPopup, setIngredientListPopup] = useState<{name: string, list: Ingredient[]} | null>(null);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleVerify = () => {
    if (password.toLowerCase() === 'ox') {
      setIsVerified(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsVerified(false);
    setPassword('');
    setError(false);
    setQuickViewProduct(null);
  };

  const toggleExpand = (index: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const updateScrollProgress = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
      setScrollProgress(progress);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollProgress);
      updateScrollProgress();
      return () => el.removeEventListener('scroll', updateScrollProgress);
    }
  }, [isVerified]);

  const scrollGallery = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 768 ? window.innerWidth * 0.8 : 480;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((clientX - left) / width) * 100;
    const y = ((clientY - top) / height) * 100;
    setZoomOrigin({ x, y });
  };

  const getProductIngredients = (name: string): Ingredient[] => {
    if (name.includes('Peeling')) return INGREDIENTS_SERUM_TR;
    if (name.includes('Cleanser')) return INGREDIENTS_CLEANSER_TR;
    if (name.includes('Moisturizing')) return INGREDIENTS_MOISTURIZER_TR;
    if (name.includes('Vegan')) return INGREDIENTS_VEGAN_SERUM_TR;
    return INGREDIENTS_SERUM_TR;
  };

  const sendToTelegram = async (message: string) => {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      });
      return response.ok;
    } catch (err) {
      return false;
    }
  };

  const handleLocationAndSend = () => {
    if (!pharmacyName || !contactInfo) {
      alert(t('form_missing')); 
      return;
    }
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert(t('location_error'));
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const locationLink = `https://www.google.com/maps?q=${lat},${lng}`;
        const message = `🚀 *Boutique Partnership Inquiry*\n🏢 *Pharmacy:* ${pharmacyName}\n📞 *Contact:* ${contactInfo}\n📍 [View Location](${locationLink})`;
        const success = await sendToTelegram(message);
        setIsLocating(false);
        if (success) {
          setIsSubmitted(true);
          setTimeout(() => { onClose(); setIsSubmitted(false); setShowRegister(false); setPharmacyName(''); setContactInfo(''); }, 3000);
        }
      },
      (err) => { setIsLocating(false); alert(t('location_error')); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleRegisterSubmitFallback = async () => {
    if (!pharmacyName || !contactInfo) return;
    setIsLocating(true);
    const message = `🌟 *Boutique Partnership Inquiry*\n🏢 *Pharmacy:* ${pharmacyName}\n📞 *Contact:* ${contactInfo}\n📍 No Location Provided`;
    const success = await sendToTelegram(message);
    setIsLocating(false);
    if (success) {
      setIsSubmitted(true);
      setTimeout(() => { onClose(); setIsSubmitted(false); setShowRegister(false); setPharmacyName(''); setContactInfo(''); }, 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-white animate-fade-in overflow-hidden">
      
      {/* Global Close Button - Fixed to viewport */}
      <button 
        onClick={onClose} 
        className="fixed top-6 right-6 md:top-10 md:right-10 w-14 h-14 rounded-full bg-brand-black text-white flex items-center justify-center hover:bg-brand-gold hover:scale-110 transition-all duration-500 z-[300] shadow-2xl group"
      >
        <span className="text-xl group-hover:rotate-90 transition-transform">✕</span>
      </button>

      <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar bg-white">
        
        {!isVerified && !showRegister ? (
          /* Login View - Immersive Full Page */
          <div className="min-h-screen flex flex-col lg:flex-row items-stretch">
            <div className="w-full lg:w-[45%] p-10 md:p-24 lg:p-32 flex flex-col justify-center space-y-12 animate-fade-right">
              <div className="space-y-6">
                <span className="text-brand-gold text-[10px] md:text-[12px] font-bold tracking-[0.5em] md:tracking-[0.8em] uppercase block">
                  {t('expert_badge')}
                </span>
                <h2 className="text-6xl md:text-8xl lg:text-[9rem] font-header font-black uppercase tracking-widest leading-[0.85] text-brand-black">
                  Premier <br /> <span className="text-brand-gold">Advantage</span>
                </h2>
                <p className="text-brand-black/40 text-lg md:text-xl leading-relaxed max-w-md font-light italic">
                  {t('advantage_desc')}
                </p>
              </div>
              
              <div className="space-y-10 max-w-md">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30 ml-2">{t('advantage_password_label')}</label>
                  <div className="relative group">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                      placeholder={t('advantage_password_placeholder')}
                      className={`w-full bg-brand-gray border rounded-3xl px-8 py-7 focus:outline-none transition-all duration-500 text-xl font-medium ${error ? 'border-red-500 bg-red-50' : 'border-brand-border focus:border-brand-gold/50'}`}
                    />
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-black/20 hover:text-brand-gold transition-colors text-lg"
                    >
                      {showPassword ? '✕' : '👁'}
                    </button>
                  </div>
                  {error && <p className="text-red-600 text-[10px] font-bold uppercase tracking-widest pl-4 animate-shake">{t('advantage_error')}</p>}
                </div>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={handleVerify}
                    className="w-full py-7 bg-brand-black text-white font-bold uppercase tracking-[0.5em] text-[12px] rounded-3xl hover:bg-brand-gold active:scale-[0.98] transition-all duration-700 shadow-[0_20px_40px_rgba(0,0,0,0.1)]"
                  >
                    {t('btn_login')}
                  </button>
                  <button 
                    onClick={() => setShowRegister(true)}
                    className="w-full py-7 bg-brand-gray text-brand-black/40 font-bold uppercase tracking-[0.5em] text-[12px] rounded-3xl hover:bg-brand-black hover:text-white transition-all duration-700"
                  >
                    {t('btn_register_toggle')}
                  </button>
                </div>
              </div>
            </div>
            <div className="hidden lg:block lg:flex-1 relative overflow-hidden bg-brand-gray">
              <img src="https://lh3.googleusercontent.com/d/1EN8i6UDmUT5jegIZ-fykKSNnhHnwYGa9" className="w-full h-full object-cover grayscale-[0.5] opacity-90 scale-105" alt="Partner View" />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent"></div>
              <div className="absolute top-1/2 left-20 -translate-y-1/2 flex flex-col items-start gap-4 pointer-events-none">
                 <div className="w-20 h-[1px] bg-brand-gold"></div>
                 <span className="text-[10px] font-bold text-brand-black/20 uppercase tracking-[1em]">Excellence Defined</span>
              </div>
            </div>
          </div>
        ) : showRegister ? (
          /* Register View - Full Screen */
          <div className="min-h-screen flex items-center justify-center p-8 bg-brand-gray/30 animate-fade-in">
            <div className="w-full max-w-5xl bg-white rounded-[4rem] p-12 md:p-24 shadow-3xl border border-brand-border flex flex-col items-center text-center space-y-16">
              {isSubmitted ? (
                <div className="space-y-8 py-20 animate-fade-up">
                  <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center mx-auto text-5xl shadow-inner border border-green-100">✓</div>
                  <div className="space-y-4">
                    <h3 className="text-5xl md:text-7xl font-header font-black uppercase tracking-widest text-brand-black">{t('form_success')}</h3>
                    <p className="text-brand-black/40 uppercase tracking-widest text-xs font-bold">{t('form_success_sub')}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    <span className="text-brand-gold text-[12px] font-bold tracking-[0.8em] uppercase block">
                      {t('nav_expert')} Registration
                    </span>
                    <h2 className="text-6xl md:text-9xl font-header font-black uppercase tracking-widest text-brand-black leading-none">{t('partner_form_title')}</h2>
                  </div>

                  <div className="w-full space-y-10 max-w-3xl">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4 text-left">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 pl-4">{t('pharmacy_name_label')}</label>
                        <input 
                          type="text" 
                          value={pharmacyName}
                          onChange={(e) => setPharmacyName(e.target.value)}
                          placeholder={t('pharmacy_placeholder')}
                          className="w-full bg-brand-gray border border-brand-border rounded-3xl px-8 py-7 focus:outline-none focus:border-brand-gold transition-all text-lg italic"
                        />
                      </div>
                      <div className="space-y-4 text-left">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 pl-4">{t('contact_label')}</label>
                        <input 
                          type="text" 
                          value={contactInfo}
                          onChange={(e) => setContactInfo(e.target.value)}
                          placeholder={t('contact_placeholder')}
                          className="w-full bg-brand-gray border border-brand-border rounded-3xl px-8 py-7 focus:outline-none focus:border-brand-gold transition-all text-lg"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-6 pt-6">
                      <button 
                        onClick={handleLocationAndSend}
                        disabled={isLocating}
                        className="w-full py-7 bg-brand-black text-white font-bold uppercase tracking-[0.5em] text-[12px] rounded-3xl hover:bg-brand-gold transition-all duration-700 shadow-xl flex items-center justify-center gap-6"
                      >
                        {isLocating ? t('form_processing') : t('btn_send_location')}
                      </button>
                      <button 
                        onClick={handleRegisterSubmitFallback}
                        className="text-[11px] font-bold text-brand-black/30 hover:text-brand-gold uppercase tracking-[0.4em] transition-colors"
                      >
                        {t('btn_send_fallback')}
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => setShowRegister(false)}
                      className="inline-block mt-8 text-[11px] font-bold text-brand-black/20 hover:text-brand-black uppercase tracking-[0.3em] transition-colors"
                    >
                      {t('btn_back')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Dashboard View - Full Screen */
          <div className="min-h-screen p-8 md:p-16 lg:p-24 flex flex-col bg-white">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 gap-12 border-b border-brand-border pb-16">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-4 px-5 py-2 bg-brand-gold/10 text-brand-gold rounded-full border border-brand-gold/20">
                  <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></span>
                  <span className="text-[10px] font-bold tracking-[0.4em] uppercase">{t('app_exclusive_badge')} ACCESS</span>
                </div>
                <h2 className="text-7xl md:text-9xl lg:text-[12rem] font-header font-black tracking-tighter uppercase leading-[0.8] text-brand-black">
                  Premier <br /> <span className="text-brand-gold italic">Advantage</span>
                </h2>
                <div className="flex items-center gap-6 pt-4">
                  <div className="px-6 py-2 bg-brand-black text-white rounded-full text-[11px] font-bold uppercase tracking-[0.3em] shadow-xl">
                    PARTNER MARGIN: %60
                  </div>
                  <div className="text-brand-black/30 text-xs font-mono font-bold tracking-widest uppercase">
                    OX LABORATORY STANDARDS V3.0
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 p-1.5 bg-brand-gray rounded-full border border-brand-black/5 shadow-inner">
                  <button 
                    onClick={() => setLang('tr')}
                    className={`px-6 py-3 text-[10px] font-black tracking-widest rounded-full transition-all duration-700 ${lang === 'tr' ? 'bg-brand-black text-white shadow-xl scale-105' : 'text-brand-black/30'}`}
                  >
                    TR
                  </button>
                  <button 
                    onClick={() => setLang('en')}
                    className={`px-6 py-3 text-[10px] font-black tracking-widest rounded-full transition-all duration-700 ${lang === 'en' ? 'bg-brand-black text-white shadow-xl scale-105' : 'text-brand-black/30'}`}
                  >
                    EN
                  </button>
                </div>

                <button 
                  onClick={handleLogout}
                  className="px-8 py-4 bg-white border border-brand-black/10 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-brand-black hover:text-white transition-all duration-700 flex items-center gap-3 shadow-sm group"
                >
                  <span>{t('btn_logout')}</span>
                  <span className="group-hover:translate-x-1 transition-transform">✕</span>
                </button>
              </div>
            </div>

            <div className="relative flex-1">
              <div 
                ref={scrollRef}
                className="flex gap-10 md:gap-16 lg:gap-20 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-24 -mx-8 px-8 md:mx-0 md:px-0"
              >
                {ADVANTAGE_PRODUCTS.map((prod, i) => (
                  <div 
                    key={i} 
                    className="flex-shrink-0 w-[90vw] md:w-[540px] lg:w-[600px] snap-center bg-white border border-brand-border rounded-[4rem] overflow-hidden hover:shadow-[0_80px_120px_-30px_rgba(0,0,0,0.1)] transition-all duration-1000 flex flex-col group relative"
                  >
                    <div className="aspect-square bg-brand-gray relative overflow-hidden flex-shrink-0">
                      <img 
                        src={prod.image} 
                        alt={prod.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-[2s]" 
                      />
                      <div className="absolute top-10 right-10 px-6 py-3 bg-brand-black/80 backdrop-blur-xl text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-full shadow-2xl z-20">
                        {prod.volume}
                      </div>
                      <div className="absolute top-10 left-10 w-16 h-16 bg-white/90 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl z-20 transition-transform duration-700 group-hover:rotate-12">{prod.emoji}</div>
                      
                      <div className="absolute bottom-10 left-10 right-10 flex gap-4 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                        <button 
                          onClick={() => setQuickViewProduct(prod)}
                          className="flex-1 py-5 bg-white text-brand-black text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl shadow-2xl hover:bg-brand-gold hover:text-white active:scale-95 transition-all"
                        >
                          {t('product_quick_view')}
                        </button>
                        <button 
                          onClick={() => setIngredientListPopup({name: prod.name, list: getProductIngredients(prod.name)})}
                          className="p-5 bg-brand-black text-white text-xl rounded-2xl shadow-2xl hover:bg-brand-gold active:scale-95 transition-all"
                        >
                          🧪
                        </button>
                      </div>
                    </div>

                    <div className="p-12 md:p-16 flex-1 flex flex-col space-y-10">
                      <div className="space-y-6">
                        <h4 className="text-5xl md:text-7xl font-header font-black uppercase tracking-widest text-brand-black leading-none">{prod.name}</h4>
                        <div className="space-y-4">
                          <p className={`text-base md:text-lg text-brand-black/40 font-medium leading-relaxed transition-all duration-700 ${expandedItems[i] ? '' : 'line-clamp-2'}`}>
                            {expandedItems[i] ? (prod.detailedDescription || prod.description) : prod.description}
                          </p>
                          <button 
                            onClick={() => toggleExpand(i)}
                            className="text-[11px] font-header font-black text-brand-gold uppercase tracking-[0.3em] hover:opacity-60 transition-opacity border-b border-brand-gold/20 pb-1"
                          >
                            {expandedItems[i] ? t('btn_show_less') : t('btn_learn_more')}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-12 gap-y-10 pt-10 border-t border-brand-border mt-auto">
                         <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-20 block">{t('price')}</span>
                            <p className="text-3xl font-header font-black tracking-widest text-brand-gold uppercase">{prod.price}</p>
                         </div>
                         <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-20 block">{t('margin')}</span>
                            <p className="text-3xl font-header font-black tracking-widest uppercase">{prod.margin}</p>
                         </div>
                         <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-20 block">{t('cost')}</span>
                            <p className="text-lg font-medium opacity-50">{prod.cost}</p>
                         </div>
                         <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-20 block">{t('profit')}</span>
                            <p className="text-lg font-bold text-green-600">+{prod.profit}</p>
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 -left-12 -right-12 justify-between pointer-events-none">
                <button 
                  onClick={() => scrollGallery('left')}
                  className="w-20 h-20 rounded-full bg-white border border-brand-border flex items-center justify-center hover:bg-brand-black hover:text-white transition-all duration-700 shadow-3xl pointer-events-auto"
                >
                  <svg className="rotate-180" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <button 
                  onClick={() => scrollGallery('right')}
                  className="w-20 h-20 rounded-full bg-white border border-brand-border flex items-center justify-center hover:bg-brand-black hover:text-white transition-all duration-700 shadow-3xl pointer-events-auto"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>

            <div className="w-full max-w-sm mx-auto h-1.5 bg-brand-gray rounded-full overflow-hidden mt-12 mb-20 relative">
              <div 
                className="h-full bg-brand-black transition-all duration-500 ease-out" 
                style={{ width: `${Math.max(10, scrollProgress)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* ENHANCED QUICK VIEW MODAL - Frosted Glass Glassmorphism UI */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[300] flex items-end md:items-center justify-center bg-white/10 backdrop-blur-[40px] border border-white/20 animate-fade-in p-0 md:p-8 lg:p-12">
          {/* Overlay click to close */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setQuickViewProduct(null)}></div>
          
          <div className="bg-white/95 backdrop-blur-md w-full h-full md:max-w-[1400px] md:h-[90vh] md:rounded-[4rem] overflow-hidden shadow-[0_100px_150px_-50px_rgba(0,0,0,0.3)] flex flex-col md:flex-row relative animate-scale-up z-10">
             <button 
              onClick={() => setQuickViewProduct(null)} 
              className="absolute top-8 right-8 w-14 h-14 flex items-center justify-center rounded-full bg-brand-gray/50 text-brand-black hover:bg-brand-black hover:text-white transition-all duration-700 z-50 shadow-2xl"
             >
              ✕
             </button>
             
             <div className="w-full md:w-[55%] h-[45%] md:h-full relative overflow-hidden bg-brand-gray/30">
               <div 
                 className="relative w-full h-full cursor-zoom-in overflow-hidden"
                 onMouseMove={handleMouseMove}
                 onTouchMove={handleMouseMove}
               >
                 <img 
                   src={quickViewProduct.image} 
                   alt={quickViewProduct.name} 
                   className="w-full h-full object-cover transition-transform duration-200"
                   style={{ 
                     transform: `scale(2.2)`, 
                     transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` 
                   }}
                 />
                 <div className="absolute bottom-10 left-10 px-6 py-2 bg-black/30 backdrop-blur-xl rounded-full text-[10px] font-black text-white uppercase tracking-[0.4em]">Laboratory Macro Scan</div>
               </div>
             </div>

             <div className="w-full md:w-[45%] p-10 md:p-20 lg:p-24 flex flex-col justify-between h-[55%] md:h-full bg-white relative">
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="space-y-6 mb-12 flex-shrink-0">
                    <span className="text-brand-gold text-[12px] font-bold tracking-[0.6em] uppercase block">
                      {t('technical_overview')}
                    </span>
                    <h3 className="text-5xl md:text-7xl lg:text-8xl font-header font-black uppercase tracking-tight leading-[0.85] text-brand-black">{quickViewProduct.name}</h3>
                    <div className="h-1 bg-brand-gold w-24 rounded-full mt-4"></div>
                  </div>
                  
                  <div className="flex-1 flex flex-col min-h-0">
                    <h5 className="text-[12px] font-bold uppercase tracking-[0.5em] text-brand-gold mb-6 flex-shrink-0">{t('product_details_title')}</h5>
                    
                    <div className="flex-1 overflow-y-auto pr-6 custom-scrollbar relative border-l border-brand-border/10 pl-8">
                      <div className="text-base md:text-xl lg:text-2xl text-brand-black/60 leading-[1.8] font-light italic whitespace-pre-line pb-16">
                        {quickViewProduct.detailedDescription || quickViewProduct.description}
                      </div>
                      <div className="sticky bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-10 pt-10 border-t border-brand-border mt-8 flex-shrink-0">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30 block">{t('volume')}</span>
                        <span className="text-2xl font-bold text-brand-black">{quickViewProduct.volume}</span>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30 block">{t('sku')}</span>
                        <span className="text-2xl font-mono font-bold text-brand-black/60 tracking-widest">{quickViewProduct.sku}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 space-y-6 flex-shrink-0">
                  <div className="flex gap-6">
                    <div className="flex-1 p-8 bg-brand-gray rounded-[2.5rem] border border-brand-border flex flex-col justify-center">
                       <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-20 block mb-2">{t('product_net_profit')}</span>
                       <span className="text-4xl md:text-5xl font-header font-black uppercase tracking-widest text-green-600">{quickViewProduct.profit}</span>
                    </div>
                    <div className="p-8 bg-brand-gray rounded-[2.5rem] border border-brand-border flex items-center justify-center">
                      <img src={UTS_IMAGE_URL} alt="ÜTS" className="h-8 md:h-10 w-auto grayscale opacity-50 transition-opacity hover:opacity-100" />
                    </div>
                  </div>
                  <button className="w-full py-7 bg-brand-black text-white font-bold uppercase tracking-[0.6em] text-[12px] rounded-[2.5rem] hover:bg-brand-gold active:scale-[0.98] transition-all shadow-[0_30px_60px_rgba(0,0,0,0.15)]">
                    {t('product_request_sample')}
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {ingredientListPopup && (
        <div className="fixed inset-0 z-[400] flex items-end md:items-center justify-center p-0 md:p-12 bg-brand-black/95 backdrop-blur-xl animate-fade-in">
          <div className="bg-white w-full md:max-w-3xl h-[85vh] md:h-auto md:max-h-[85vh] p-12 md:p-20 relative md:rounded-[4rem] border border-brand-border shadow-3xl overflow-y-auto rounded-t-[4rem]">
            <button 
              onClick={() => setIngredientListPopup(null)}
              className="absolute top-12 right-12 w-12 h-12 flex items-center justify-center rounded-full bg-brand-gray text-brand-black hover:rotate-90 transition-all duration-700"
            >✕</button>
            <div className="space-y-16">
              <div className="space-y-6">
                <span className="text-[12px] font-bold tracking-[0.8em] text-brand-gold uppercase">{t('nav_ingredients')} Formula</span>
                <h3 className="text-5xl md:text-7xl font-header font-black uppercase tracking-widest leading-none text-brand-black">{ingredientListPopup.name}</h3>
              </div>
              <div className="space-y-12">
                {ingredientListPopup.list.map((ing, idx) => (
                  <div key={idx} className="border-b border-brand-border pb-10 space-y-4 group">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-3xl font-header font-black uppercase tracking-widest group-hover:text-brand-gold transition-colors">{ing.name}</h4>
                      <span className="text-[11px] font-black tracking-widest text-brand-gold uppercase bg-brand-gold/10 px-4 py-1 rounded-full">{ing.concentration}</span>
                    </div>
                    <p className="text-lg text-brand-black/50 font-medium italic leading-relaxed">{ing.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #0A0A0A;
          border-radius: 10px;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}} />
    </div>
  );
};

export default AdvantageModal;