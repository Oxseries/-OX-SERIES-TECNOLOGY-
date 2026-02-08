
import React, { useRef, useState } from 'react';
import { INGREDIENTS_SERUM_TR, INGREDIENTS_SERUM_EN } from '../constants';

interface RitualProps {
  t: (key: any) => string;
}

const Ritual: React.FC<RitualProps> = ({ t }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { 
      title: t('ritual_step1_title'),
      desc: t('ritual_step1_desc'),
      label: 'PREPARATION',
      phase: '01',
      bg: 'https://lh3.googleusercontent.com/d/1M3FV2FCuA36VX38M1bK83I4KJbMXT7tG'
    },
    { 
      title: t('ritual_step2_title'),
      desc: t('ritual_step2_desc'),
      label: 'APPLICATION',
      phase: '02',
      bg: 'https://lh3.googleusercontent.com/d/1QIEDv4B50zPlmG3mvA4-Tmie2oZkjMce'
    },
    { 
      title: t('ritual_step3_title'),
      desc: t('ritual_step3_desc'),
      label: 'PURITY',
      phase: '03',
      bg: 'https://lh3.googleusercontent.com/d/14S0mveVLlbd350EXYZR6LHA1BPisw-ja'
    }
  ];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.querySelector('div')?.clientWidth || 0;
    const index = Math.round(scrollLeft / cardWidth);
    if (index !== activeStep && index >= 0 && index < steps.length) {
      setActiveStep(index);
    }
  };

  const renderDesc = (text: string) => {
    const parts = text.split(/(Dikkat:|Attention:)/i);
    return parts.map((part, i) => {
      const isWarning = part.toLowerCase() === 'dikkat:' || part.toLowerCase() === 'attention:';
      if (isWarning) {
        return (
          <span key={i} className="inline-flex flex-col mb-4 w-full">
            <span className="bg-brand-black text-white font-header px-3 py-1 text-[11px] tracking-[0.2em] uppercase w-fit mb-2">
              {part.replace(':', '')}
            </span>
          </span>
        );
      }
      return <span key={i} className={i > 0 ? "block border-l-2 border-brand-gold/30 pl-4 py-1" : ""}>{part}</span>;
    });
  };

  return (
    <section id="ritual" className="py-24 md:py-32 bg-white text-brand-black overflow-hidden scroll-mt-20 border-t border-brand-border">
      {/* Prada Style Header */}
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 mb-20 md:mb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="space-y-6">
            <span className="text-[10px] font-bold tracking-[0.5em] uppercase block text-brand-black/40">
              {t('section_ritual')}
            </span>
            <h2 className="text-5xl md:text-7xl lg:text-[6.5rem] font-header font-black tracking-widest uppercase leading-none">
              {t('ritual_title')}
            </h2>
          </div>
          <div className="max-w-md border-l border-brand-black/10 pl-8">
            <p className="text-sm md:text-base font-medium uppercase tracking-widest leading-relaxed text-brand-black/60">
              {t('ritual_subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Full-Width Horizontal Gallery */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-0 border-y border-brand-border bg-brand-gray"
      >
        {steps.map((step, i) => (
          <div 
            key={i}
            className="flex-shrink-0 w-full md:w-[70vw] lg:w-[50vw] snap-start aspect-square md:aspect-[4/5] lg:aspect-[3/4] bg-white border-r border-brand-border group relative overflow-hidden"
          >
            {/* Image Component */}
            <div className="absolute inset-0 overflow-hidden">
              <img 
                src={step.bg} 
                alt={step.title} 
                className="w-full h-full object-cover grayscale-0 transition-transform duration-[2s] ease-out group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </div>

            {/* Content Overlays - Fixed Corners Style */}
            <div className="absolute inset-0 z-10 p-8 md:p-12 flex flex-col justify-between pointer-events-none">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase bg-brand-black text-white px-3 py-1 self-start">
                    PHASE {step.phase}
                  </span>
                  <span className="text-[9px] font-bold tracking-[0.4em] uppercase text-brand-black/40 mt-2">
                    {step.label}
                  </span>
                </div>
                <div className="text-4xl font-header font-black text-brand-black/5 tracking-widest">OX</div>
              </div>
              
              <div className="bg-white/90 backdrop-blur-md p-8 md:p-10 border border-brand-border self-start max-w-[90%] md:max-w-[80%] pointer-events-auto shadow-sm space-y-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-3xl md:text-5xl font-header font-black uppercase tracking-widest text-brand-black">
                    {step.title}
                  </h3>
                  {i === 2 && (
                    <div className="animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-gold"></span>
                      <span className="text-[8px] font-bold tracking-widest uppercase text-brand-gold">Caution Required</span>
                    </div>
                  )}
                </div>
                <div className="text-sm md:text-lg text-brand-black/70 font-medium leading-relaxed tracking-wide">
                  {renderDesc(step.desc)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prada Style Minimalist Navigation */}
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 mt-12 md:mt-20">
        <div className="flex items-center justify-between gap-12">
          <div className="flex gap-4">
            {steps.map((_, i) => (
              <button 
                key={i}
                onClick={() => {
                  scrollRef.current?.scrollTo({ 
                    left: i * (scrollRef.current.clientWidth * (window.innerWidth < 768 ? 1 : 0.5)), 
                    behavior: 'smooth' 
                  });
                }}
                className={`h-1 transition-all duration-700 ${activeStep === i ? 'w-16 bg-brand-black' : 'w-8 bg-brand-black/10'}`}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-10">
            <div className="text-right">
              <span className="block font-bold text-[9px] text-brand-black/20 tracking-[0.4em] uppercase mb-1">Status</span>
              <span className="block font-sans text-xs font-black uppercase tracking-widest text-brand-black">Active Ritual</span>
            </div>
            <div className="font-header text-5xl md:text-7xl font-black tracking-widest text-brand-black/10 flex items-baseline gap-2">
              0{activeStep + 1} <span className="text-2xl font-bold text-brand-black/40">/ 03</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Ritual;
