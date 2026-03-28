
import React, { useState, useEffect } from 'react';
import { Contact } from './types';

interface WhatsAppBulkSenderProps {
  t: (key: any) => string;
}

const WhatsAppBulkSender: React.FC<WhatsAppBulkSenderProps> = ({ t }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [template, setTemplate] = useState('');

  useEffect(() => {
    const savedContacts = localStorage.getItem('ox_contacts');
    const savedTemplate = localStorage.getItem('ox_wa_template');
    if (savedContacts) setContacts(JSON.parse(savedContacts));
    if (savedTemplate) setTemplate(savedTemplate);
  }, []);

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
    };
    reader.readAsText(file);
  };

  const parseVCF = (content: string): Contact[] => {
    const results: Contact[] = [];
    // Handle both CRLF and LF, and ensure case-insensitivity for BEGIN:VCARD
    const vcards = content.split(/BEGIN:VCARD/i);

    vcards.forEach(vcard => {
      if (!vcard.trim()) return;

      // Improved regex to handle various vCard formats and multiline entries
      // FN can be complex, TEL can have many types (CELL, HOME, etc.)
      const fnMatch = vcard.match(/^FN(?:;[^:]*)?:(.*)$/im);
      const telMatch = vcard.match(/^TEL(?:;[^:]*)?:(.*)$/im);

      if (fnMatch && telMatch) {
        let name = fnMatch[1].trim();
        let phone = telMatch[1].replace(/[^0-9+]/g, '').trim();

        // Basic validation for phone number length
        if (phone.length >= 7) {
            results.push({ name, phone });
        }
      } else if (!fnMatch) {
          // Fallback to N (Name) property if FN is missing
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
    <div className="space-y-12 animate-fade-in">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold">{t('wa_upload_vcf')}</label>
            <div className="relative group">
              <input
                type="file"
                accept=".vcf"
                onChange={handleFileUpload}
                className="w-full bg-brand-gray border border-brand-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-brand-gold/50 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold">{t('wa_template_label')}</label>
              <span className="text-[9px] font-mono text-brand-black/30 uppercase">{t('wa_template_hint')}</span>
            </div>
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder={t('wa_template_placeholder')}
              rows={6}
              className="w-full bg-brand-gray border border-brand-border rounded-3xl px-8 py-6 focus:outline-none focus:border-brand-gold/50 text-lg font-light italic resize-none"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={clearContacts}
              className="flex-1 py-4 bg-brand-gray text-brand-black/40 text-[10px] font-bold uppercase tracking-[0.3em] rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all duration-500"
            >
              {t('wa_btn_clear')}
            </button>
          </div>
        </div>

        <div className="bg-brand-gray/30 border border-brand-border rounded-[3rem] p-10 flex flex-col h-[600px]">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-brand-border/50">
            <h4 className="text-xl font-header font-black uppercase tracking-widest">{t('wa_contact_count')}</h4>
            <span className="bg-brand-black text-white px-4 py-1 rounded-full text-xs font-bold">{contacts.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-4">
            {contacts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                <span className="text-4xl">📂</span>
                <p className="text-[10px] font-bold uppercase tracking-widest max-w-[200px]">{t('wa_no_contacts')}</p>
              </div>
            ) : (
              contacts.map((contact, idx) => (
                <div key={idx} className="bg-white border border-brand-border p-5 rounded-2xl flex items-center justify-between group hover:shadow-xl transition-all duration-500">
                  <div className="space-y-1">
                    <p className="font-header font-black uppercase tracking-wider text-sm">{contact.name}</p>
                    <p className="text-[10px] font-mono text-brand-black/40">{contact.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => removeContact(idx)}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-brand-black/20 hover:text-red-600 hover:bg-red-50 transition-all"
                    >
                      ✕
                    </button>
                    <button
                      onClick={() => sendWhatsApp(contact)}
                      className="px-4 py-2 bg-brand-black text-white text-[9px] font-bold uppercase tracking-widest rounded-full hover:bg-brand-gold transition-all"
                    >
                      {t('wa_btn_send')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppBulkSender;
