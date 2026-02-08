
import React, { useState, useEffect, useRef } from 'react';
import { Pharmacy, Language } from '../types';
import { AUTHORIZED_PHARMACIES } from '../constants';

interface PharmacyLocatorProps {
  t: (key: any) => string;
  lang: Language;
}

declare const L: any; // Leaflet global

const PharmacyLocator: React.FC<PharmacyLocatorProps> = ({ t, lang }) => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Initialize or update map
  useEffect(() => {
    if (!mapInstanceRef.current && mapContainerRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([38.4237, 27.1428], 12);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);
    }
  }, []);

  // Sync markers with pharmacies
  useEffect(() => {
    if (mapInstanceRef.current && pharmacies.length > 0) {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      const group: any[] = [];
      pharmacies.forEach((p, idx) => {
        const marker = L.marker([p.lat, p.lng])
          .addTo(mapInstanceRef.current)
          .on('click', () => setSelected(idx));
        
        markersRef.current.push(marker);
        group.push([p.lat, p.lng]);
      });

      if (group.length > 0) {
        mapInstanceRef.current.fitBounds(group, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [pharmacies]);

  // Sync map with selection
  useEffect(() => {
    if (mapInstanceRef.current && selected !== null && pharmacies[selected]) {
      const p = pharmacies[selected];
      mapInstanceRef.current.flyTo([p.lat, p.lng], 15, {
        duration: 1.5,
        easeLinearity: 0.25
      });

      markersRef.current.forEach((m, idx) => {
        if (idx === selected) {
          m.getElement()?.classList.add('active-marker');
          m.setZIndexOffset(1000);
        } else {
          m.getElement()?.classList.remove('active-marker');
          m.setZIndexOffset(0);
        }
      });
    }
  }, [selected, pharmacies]);

  const locate = async () => {
    setIsLoading(true);
    if (!navigator.geolocation) {
      alert(t('location_error'));
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      setTimeout(() => {
        setPharmacies(AUTHORIZED_PHARMACIES);
        setIsLoading(false);
        if (AUTHORIZED_PHARMACIES.length > 0) setSelected(0);
      }, 2500);
    }, (error) => {
      console.error(error);
      setTimeout(() => {
        setPharmacies(AUTHORIZED_PHARMACIES);
        setIsLoading(false);
        if (AUTHORIZED_PHARMACIES.length > 0) setSelected(0);
      }, 2500);
    });
  };

  return (
    <section id="stores" className="py-20 md:py-48 px-4 md:px-6 bg-brand-white scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div 
          id="locator-search" 
          className="flex flex-col items-center justify-center mb-16 md:mb-24 gap-8 md:gap-14 pt-4 transition-all duration-1000"
        >
          <div className="max-w-5xl text-center">
            <span className="text-brand-gold text-[9px] md:text-[11px] font-bold tracking-[0.4em] md:tracking-[0.5em] uppercase block mb-3 md:mb-6 animate-fade-in">
              {lang === 'tr' ? 'Geç Kalma Genç Kal' : 'Don\'t Be Late, Stay Young'}
            </span>
            <h2 className="text-5xl md:text-7xl lg:text-[6rem] font-header font-black leading-[1] tracking-widest mb-4 md:mb-8 text-balance uppercase">
              {t('stores_title')}
            </h2>
          </div>
          
          <button 
            onClick={locate}
            disabled={isLoading}
            className={`group relative overflow-hidden px-10 py-5 md:px-24 md:py-9 transition-all duration-700 flex items-center gap-4 md:gap-6 rounded-full border shadow-xl hover:-translate-y-1 active:scale-95 ${isLoading ? 'bg-brand-gray/50 border-brand-gold/20' : 'bg-white/80 border-brand-gold/30 hover:border-brand-gold hover:shadow-brand-gold/20'}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-brand-gold/10 to-transparent -translate-x-full transition-transform duration-[1500ms] ${isLoading ? 'animate-[shine_2s_infinite]' : 'group-hover:translate-x-full'}`}></div>
            
            <div className="relative z-10 flex items-center gap-3 md:gap-5">
              <div className={`transition-all duration-500 ${isLoading ? 'animate-spin opacity-50' : 'group-hover:animate-bounce'}`}>
                {isLoading ? (
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-gold">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                   </svg>
                ) : (
                  <span className="text-xl md:text-2xl">📍</span>
                )}
              </div>
              
              <span className={`text-[9px] md:text-xs font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase transition-colors duration-500 ${isLoading ? 'text-brand-black/30' : 'text-brand-black group-hover:text-brand-gold'}`}>
                {isLoading ? t('btn_locating') : t('btn_locate')}
              </span>
            </div>
            <div className="absolute inset-0 rounded-full border border-white/40 pointer-events-none"></div>
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 md:gap-10 relative">
          
          {isLoading && (
            <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm rounded-[2rem] md:rounded-[3rem] flex items-center justify-center animate-fade-in">
              <div className="flex flex-col items-center gap-6 md:gap-8">
                <div className="relative">
                  <div className="w-16 h-16 md:w-24 md:h-24 border border-brand-gold/20 rounded-full animate-pulse-slow"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-brand-gold font-header text-3xl md:text-5xl font-black italic animate-float tracking-widest">OX</span>
                  </div>
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-[8px] md:text-[10px] font-mono font-bold tracking-[0.3em] text-brand-gold uppercase animate-pulse">
                    {lang === 'tr' ? 'Ağ Taranıyor' : 'Scanning Network'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="lg:col-span-4 bg-brand-gray/30 rounded-[2rem] overflow-hidden border border-brand-border h-[400px] md:h-[800px] flex flex-col shadow-sm">
            <div className="p-5 md:p-10 border-b border-brand-border bg-white/50 backdrop-blur-md flex justify-between items-center">
              <span className="text-[8px] md:text-[10px] font-bold tracking-widest uppercase opacity-30">{pharmacies.length} {lang === 'tr' ? 'Lokasyon' : 'Locations'}</span>
              <span className="px-2 py-0.5 md:px-3 md:py-1 bg-brand-gold/10 text-brand-gold text-[7px] md:text-[8px] font-bold tracking-widest uppercase rounded-full">Premier</span>
            </div>
            <div className="flex-1 overflow-y-auto hide-scrollbar">
              {pharmacies.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 md:space-y-8 animate-fade-in">
                  <div className="w-16 h-16 bg-brand-gold/5 rounded-full flex items-center justify-center text-2xl grayscale opacity-30">🏢</div>
                  <p className="text-brand-black/30 text-sm md:text-lg font-serif italic leading-relaxed">
                    {t('pharmacy_empty')}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-brand-border">
                  {pharmacies.map((p, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setSelected(idx)}
                      className={`w-full p-6 md:p-10 text-left transition-all duration-700 group ${selected === idx ? 'bg-brand-black text-brand-white' : 'hover:bg-brand-gray'}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col gap-1">
                           <h3 className={`text-xl md:text-3xl font-header font-black tracking-widest uppercase transition-colors ${selected === idx ? 'text-brand-gold' : 'text-brand-black group-hover:text-brand-gold'}`}>{p.name}</h3>
                        </div>
                        <span className={`text-[7px] md:text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${selected === idx ? 'border-white/20 text-white/60' : 'border-brand-black/10 text-brand-black/40'}`}>
                          {p.distance} km
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-1 h-1 md:w-2 md:h-2 rounded-full ${p.inStock ? 'bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></span>
                        <span className={`text-[7px] md:text-[9px] font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] ${selected === idx ? 'text-white/40' : 'text-brand-black/40'}`}>
                          {p.inStock ? t('pharmacy_in_stock') : t('pharmacy_out_of_stock')}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6 md:gap-10">
            <div className="h-[300px] md:h-[500px] w-full bg-brand-gray rounded-[1.5rem] md:rounded-[2.5rem] border border-brand-border overflow-hidden relative shadow-sm">
              <div ref={mapContainerRef} className="absolute inset-0 z-0"></div>
              {pharmacies.length === 0 && !isLoading && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center pointer-events-none">
                  <div className="px-5 py-3 bg-white/80 border border-brand-border rounded-full shadow-lg flex items-center gap-2 text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-60">
                    <span className="w-1 h-1 bg-brand-gold rounded-full animate-ping"></span>
                    {lang === 'tr' ? 'Harita için arama yapın' : 'Search to enable map'}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-brand-border p-6 md:p-14 relative overflow-hidden group/details shadow-sm min-h-[250px] md:min-h-[300px] flex flex-col items-center justify-center">
              {selected !== null ? (
                <div className="animate-fade-in flex flex-col md:flex-row gap-8 md:gap-12 items-center w-full h-full">
                  <div className="flex-1 space-y-4 md:space-y-6 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4">
                      <div className="inline-flex items-center gap-2 md:gap-4 px-3 py-1 bg-brand-gold/5 text-brand-gold rounded-full border border-brand-gold/10 text-[7px] md:text-[9px] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase">
                        {lang === 'tr' ? 'Yetkili OX Ortağı' : 'Authorized OX Partner'}
                      </div>
                    </div>
                    <h3 className="text-4xl md:text-6xl font-header font-black tracking-widest leading-none text-brand-black uppercase">{pharmacies[selected].name}</h3>
                    <p className="text-[13px] md:text-base text-brand-black/50 leading-relaxed font-light italic">
                      {lang === 'tr' 
                        ? 'Kişiselleştirilmiş analiz için profesyonel danışmanlar mevcut.' 
                        : 'Professional consultants available for personalized analysis.'}
                    </p>
                  </div>

                  <div className="w-full md:w-auto flex flex-col gap-3 md:gap-4">
                    <div className="flex gap-3">
                      <div className="px-4 py-3 md:px-5 md:py-4 bg-brand-gray rounded-xl md:rounded-2xl border border-brand-border flex-1 text-center">
                        <span className="text-[6px] md:text-[8px] font-bold uppercase tracking-widest opacity-30 block mb-1 md:mb-2">{t('margin')}</span>
                        <span className={`text-[9px] md:text-xs font-bold ${pharmacies[selected].inStock ? 'text-green-600' : 'text-red-600'}`}>
                          {pharmacies[selected].inStock ? '✓' : '✕'}
                        </span>
                      </div>
                      <div className="px-4 py-3 md:px-5 md:py-4 bg-brand-gray rounded-xl md:rounded-2xl border border-brand-border flex-1 text-center">
                        <span className="text-[6px] md:text-[8px] font-bold uppercase tracking-widest opacity-30 block mb-1 md:mb-2">{t('pharmacy_distance')}</span>
                        <span className="text-[9px] md:text-xs font-bold text-brand-gold">{pharmacies[selected].distance} km</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${pharmacies[selected].lat},${pharmacies[selected].lng}`)}
                      className="w-full py-4 md:py-5 bg-brand-black text-white font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-[8px] md:text-[9px] hover:bg-brand-gold active:bg-brand-gold transition-all duration-700 shadow-xl flex items-center justify-center gap-2 md:gap-3 group/btn rounded-xl md:rounded-2xl"
                    >
                      <span className="group-hover/btn:translate-x-1 transition-transform">{t('pharmacy_directions')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-fade-in py-6">
                  <p className="text-2xl md:text-4xl font-header font-black uppercase tracking-widest opacity-40">
                    {lang === 'tr' ? 'Seçkin bir lokasyon seçin' : 'Select a premier location'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PharmacyLocator;
