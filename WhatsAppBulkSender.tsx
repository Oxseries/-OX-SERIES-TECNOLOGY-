
import React, { useState, useEffect } from 'react';
import { Contact } from './types';

interface WhatsAppBulkSenderProps {
  t: (key: any) => string;
}

const WhatsAppBulkSender: React.FC<WhatsAppBulkSenderProps> = ({ t }) => {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('ox_contacts');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [template, setTemplate] = useState(() => {
    return localStorage.getItem('ox_wa_template') || '';
  });

  const [activeTab, setActiveTab] = useState<'config' | 'list'>('config');

  useEffect(() => {
    localStorage.setItem('ox_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('ox_wa_template', template);
  }, [template]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsedContacts = parseVCF(content);
      setContacts(prev => [...prev, ...parsedContacts]);
      if (parsedContacts.length > 0) setActiveTab('list');
    };
    reader.readAsText(file);
  };

  const parseVCF = (content: string): Contact[] => {
    const results: Contact[] = [];
    const vcards = content.split(/BEGIN:VCARD/i);

    vcards.forEach(vcard => {
      if (!vcard.trim()) return;
      const fnMatch = vcard.match(/^FN(?:;[^:]*)?:(.*)$/im);
      const telMatch = vcard.match(/^TEL(?:;[^:]*)?:(.*)$/im);

      if (fnMatch && telMatch) {
        let name = fnMatch[1].trim();
        let phone = telMatch[1].replace(/[^0-9+]/g, '').trim();
        if (phone.length >= 7) {
            results.push({ name, phone });
        }
      } else if (!fnMatch) {
          const nMatch = vcard.match(/^N(?:;[^:]*)?:([^;]*);([^;]*)/im);
          if (nMatch && telMatch) {
              const name = `${nMatch[2].trim()} ${nMatch[1].trim()}`.trim();
              const phone = telMatch[1].replace(/[^0-9+]/g, '').trim();
              if (phone.length >= 7) {
                results.push({ name, phone });
              }
          }
      }
    });
    return results;
  };

  const removeContact = (index: number) => {
    setContacts(prev => prev.filter((_, i) => i !== index));
  };

  const clearContacts = () => {
    if (window.confirm(t('wa_btn_clear') + '?')) {
      setContacts([]);
    }
  };

  const sendWhatsApp = (contact: Contact) => {
    const message = template.replace(/{name}/g, contact.name);
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${contact.phone}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto h-full flex flex-col lg:flex-row gap-8 lg:gap-12 animate-fade-in lg:p-4">

      {/* Configuration Panel - App view on mobile, Sidebar on Web */}
      <div className={`flex flex-col w-full lg:w-[450px] bg-white lg:rounded-[3rem] shadow-2xl lg:border border-brand-border overflow-hidden transition-all duration-700 ${activeTab === 'list' ? 'hidden lg:flex' : 'flex'}`}>
        <div className="bg-brand-black p-8 lg:p-12 text-white space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex justify-between items-center relative z-10">
            <h3 className="text-3xl lg:text-4xl font-header font-black tracking-widest uppercase">{t('wa_title')}</h3>
            <span className="bg-brand-gold/20 text-brand-gold px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-brand-gold/30">V3.0 Web</span>
          </div>

          <div className="space-y-2 lg:hidden">
             <button
                onClick={() => setActiveTab('list')}
                className="w-full py-4 bg-brand-gold text-brand-black text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-3"
             >
                <span>👥 {t('wa_contact_count')} ({contacts.length})</span>
                <span>→</span>
             </button>
          </div>
        </div>

        <div className="flex-1 p-8 lg:p-12 space-y-10 lg:space-y-12 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold ml-2 block">{t('wa_upload_vcf')}</label>
            <div className="relative group">
              <div className="p-10 lg:p-14 bg-brand-gray/50 border-2 border-brand-border border-dashed rounded-[2.5rem] flex flex-col items-center text-center space-y-4 hover:border-brand-gold transition-all duration-500 cursor-pointer group-hover:bg-white group-hover:shadow-xl">
                 <div className="text-5xl group-hover:scale-110 transition-transform duration-700">📤</div>
                 <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-brand-black">VCF Dosyası Seç</p>
                    <p className="text-[10px] text-brand-black/30 font-medium tracking-tight">Mobil rehber dışa aktarma dosyası</p>
                 </div>
              </div>
              <input
                type="file"
                accept=".vcf"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end px-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold">{t('wa_template_label')}</label>
              <span className="text-[8px] font-mono text-brand-black/20 uppercase bg-brand-gray px-2 py-1 rounded-md">{t('wa_template_hint')}</span>
            </div>
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder={t('wa_template_placeholder')}
              rows={8}
              className="w-full bg-brand-gray/30 border border-brand-border rounded-[2rem] px-8 py-8 focus:outline-none focus:border-brand-gold/50 text-lg font-light italic resize-none shadow-inner transition-all focus:bg-white"
            />
          </div>

          <button
            onClick={clearContacts}
            disabled={contacts.length === 0}
            className="w-full py-6 bg-white text-brand-black/20 text-[10px] font-black uppercase tracking-[0.5em] rounded-[1.8rem] hover:text-red-500 hover:bg-red-50 transition-all duration-700 disabled:opacity-20 border border-brand-border"
          >
            {t('wa_btn_clear')}
          </button>
        </div>
      </div>

      {/* Contact List Dashboard - Full view on Web, Mobile view when active */}
      <div className={`flex-1 flex flex-col bg-brand-gray/10 lg:rounded-[3rem] lg:border border-brand-border overflow-hidden shadow-sm transition-all duration-700 ${activeTab === 'config' ? 'hidden lg:flex' : 'flex'}`}>
        <div className="bg-white border-b border-brand-border p-8 lg:p-10 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-6">
             <button
                onClick={() => setActiveTab('config')}
                className="lg:hidden w-12 h-12 bg-brand-gray rounded-full flex items-center justify-center text-brand-black/40"
             >
                ←
             </button>
             <div className="space-y-1">
                <h4 className="text-xl lg:text-3xl font-header font-black uppercase tracking-widest">{t('wa_contact_count')}</h4>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  <p className="text-[10px] font-mono text-brand-black/30 uppercase tracking-widest">{contacts.length} {t('wa_product_link').includes('Ürün') ? 'Kişi Hazır' : 'Contacts Ready'}</p>
                </div>
             </div>
          </div>
          <div className="hidden lg:flex items-center gap-3 px-6 py-3 bg-brand-black text-white rounded-full text-[11px] font-bold tracking-widest shadow-xl">
             <span>ACTIVE LIST</span>
             <div className="w-px h-3 bg-white/20 mx-2"></div>
             <span className="text-brand-gold">{contacts.length}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
          {contacts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-20 py-20 lg:py-40">
              <div className="w-24 h-24 lg:w-32 lg:h-32 bg-brand-gray rounded-[2.5rem] flex items-center justify-center text-5xl lg:text-6xl shadow-inner rotate-3 hover:rotate-0 transition-transform duration-700">📇</div>
              <div className="space-y-3">
                 <p className="text-xl lg:text-2xl font-header font-black uppercase tracking-[0.2em]">{t('wa_no_contacts')}</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest max-w-[250px] mx-auto leading-relaxed">Başlamak için sol panelden rehber dosyanızı yükleyin.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
              {contacts.map((contact, idx) => (
                <div key={idx} className="bg-white border border-brand-border p-6 lg:p-8 rounded-[2rem] flex items-center justify-between shadow-sm hover:shadow-2xl hover:border-brand-gold/20 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-gold/0 group-hover:bg-brand-gold transition-all"></div>
                  <div className="space-y-2 relative z-10">
                    <p className="font-header font-black uppercase tracking-wider text-lg lg:text-xl text-brand-black group-hover:text-brand-gold transition-colors">{contact.name}</p>
                    <div className="flex items-center gap-3">
                       <span className="text-[9px] font-black uppercase tracking-widest bg-brand-gray px-2 py-0.5 rounded text-brand-black/40 group-hover:bg-brand-gold/10 group-hover:text-brand-gold transition-colors">TEL</span>
                       <p className="text-[11px] font-mono text-brand-black/30 font-bold group-hover:text-brand-black/60 transition-colors">{contact.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 relative z-10">
                    <button
                      onClick={() => removeContact(idx)}
                      className="w-11 h-11 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-brand-black/20 hover:text-red-600 hover:bg-red-50 transition-all border border-brand-border/50 lg:opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                    <button
                      onClick={() => sendWhatsApp(contact)}
                      className="w-11 h-11 lg:w-14 lg:h-14 bg-brand-black text-white rounded-full flex items-center justify-center hover:bg-brand-gold hover:scale-110 transition-all duration-500 shadow-xl"
                    >
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="lg:w-6 lg:h-6"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
      `}} />
    </div>
  );
};

export default WhatsAppBulkSender;
