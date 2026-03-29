
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
      // Auto switch to list tab after upload
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
    <div className="flex flex-col h-full max-w-md mx-auto bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-brand-border relative">

      {/* Mobile App Header */}
      <div className="bg-brand-black p-6 pt-10 text-white space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-header font-black tracking-widest uppercase">{t('wa_title')}</h3>
          <span className="bg-brand-gold/20 text-brand-gold px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-brand-gold/30">v1.0</span>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white/10 p-1 rounded-2xl border border-white/5 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === 'config' ? 'bg-white text-brand-black shadow-lg scale-[1.02]' : 'text-white/40'}`}
          >
            ⚙️ {t('wa_upload_vcf').split(' ')[0]}
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 relative ${activeTab === 'list' ? 'bg-white text-brand-black shadow-lg scale-[1.02]' : 'text-white/40'}`}
          >
            👥 {t('wa_contact_count').split(' ')[0]}
            {contacts.length > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 bg-brand-gold rounded-full animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-brand-gray/30 relative">
        {activeTab === 'config' ? (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="p-8 bg-white border border-brand-border rounded-[2.5rem] shadow-sm flex flex-col items-center text-center space-y-4 border-dashed border-2 hover:border-brand-gold transition-colors group cursor-pointer relative overflow-hidden">
                <div className="text-4xl group-hover:scale-110 transition-transform duration-500">📂</div>
                <div className="space-y-1">
                   <p className="text-xs font-black uppercase tracking-widest text-brand-black">{t('wa_upload_vcf')}</p>
                   <p className="text-[10px] text-brand-black/30 font-medium tracking-tight">WCF Dosyasını Buraya Bırakın</p>
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
                <span className="text-[8px] font-mono text-brand-black/20 uppercase">{t('wa_template_hint')}</span>
              </div>
              <textarea
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                placeholder={t('wa_template_placeholder')}
                rows={8}
                className="w-full bg-white border border-brand-border rounded-[2rem] px-8 py-7 focus:outline-none focus:border-brand-gold/50 text-base font-light italic resize-none shadow-sm transition-all"
              />
            </div>

            <button
              onClick={clearContacts}
              disabled={contacts.length === 0}
              className="w-full py-5 bg-white text-brand-black/30 text-[10px] font-black uppercase tracking-[0.4em] rounded-[1.5rem] hover:text-red-500 hover:bg-red-50 transition-all duration-500 disabled:opacity-30 border border-brand-border"
            >
              🗑️ {t('wa_btn_clear')}
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in h-full flex flex-col">
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold">{t('wa_contact_count')}</span>
              <span className="bg-brand-black text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest">{contacts.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {contacts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30 py-20">
                  <div className="w-20 h-20 bg-brand-gray rounded-full flex items-center justify-center text-4xl">📇</div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] leading-relaxed max-w-[180px]">{t('wa_no_contacts')}</p>
                </div>
              ) : (
                contacts.map((contact, idx) => (
                  <div key={idx} className="bg-white border border-brand-border p-5 rounded-[1.8rem] flex items-center justify-between shadow-sm active:scale-[0.98] transition-all">
                    <div className="space-y-1">
                      <p className="font-header font-black uppercase tracking-wider text-sm text-brand-black">{contact.name}</p>
                      <p className="text-[10px] font-mono text-brand-black/30 font-bold">{contact.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => removeContact(idx)}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-brand-black/20 hover:text-red-600 hover:bg-red-50 transition-all border border-brand-border/50"
                      >
                        ✕
                      </button>
                      <button
                        onClick={() => sendWhatsApp(contact)}
                        className="w-9 h-9 bg-brand-black text-white rounded-full flex items-center justify-center hover:bg-brand-gold transition-all shadow-lg"
                      >
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* App Tab Bar Hint */}
      <div className="bg-white border-t border-brand-border p-4 flex justify-center opacity-10">
         <div className="w-32 h-1.5 bg-brand-black rounded-full"></div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #C5A059;
          border-radius: 10px;
        }
      `}} />
    </div>
  );
};

export default WhatsAppBulkSender;
