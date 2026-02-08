
import React, { useState } from 'react';
import { INGREDIENTS_TR, INGREDIENTS_EN } from '../constants';
import { Language } from '../types';

interface IngredientsProps {
  t: (key: any) => string;
  lang: Language;
}

const Ingredients: React.FC<IngredientsProps> = ({ t, lang }) => {
  const currentIngredients = lang === 'tr' ? INGREDIENTS_TR : INGREDIENTS_EN;
  const [activeIng, setActiveIng] = useState(0);

  return (
    <section id="ingredients" className="py-24 md:py-48 px-6 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-20 items-start">
          {/* Sticky Sidebar Header - Minimalism prioritized */}
          <div className="lg:w-1/3 lg:sticky lg:top-40 space-y-10">
            <div className="flex items-center gap-6 pt-6">
               <div className="w-16 h-16 rounded-full border border-brand-black/5 flex items-center justify-center text-xl animate-float">✧</div>
               <span className="text-[10px] font-bold tracking-widest uppercase opacity-20">{t('ritual_touch_future')}</span>
            </div>
            <div className="h-px bg-brand-gold/20 w-32"></div>
          </div>

          {/* Minimalist Interactive Cards */}
          <div className="lg:w-2/3 space-y-4">
            {currentIngredients.map((ing, idx) => (
              <div 
                key={idx}
                onMouseEnter={() => setActiveIng(idx)}
                className={`group relative p-12 md:p-16 border border-brand-border rounded-[2rem] bg-white transition-all duration-700 flex flex-col gap-6 hover:shadow-2xl hover:border-brand-gold/20 ${activeIng === idx ? 'shadow-xl border-brand-gold/10' : 'opacity-80'}`}
              >
                <div className="space-y-4">
                  <h3 className="text-3xl md:text-5xl font-header font-black uppercase tracking-widest group-hover:text-brand-gold transition-colors leading-none">
                    {ing.name}
                  </h3>
                  <div className="w-12 h-0.5 bg-brand-gold/30 group-hover:w-20 transition-all duration-700"></div>
                  <p className="text-lg md:text-xl text-brand-black/50 leading-relaxed font-light italic">
                    {ing.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Ingredients;
