import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Link } from 'lucide-react';

export default function ReferralLinkGeneratorModal({ isOpen, onClose, campaignSlug, campaignTitle }) {
  const [category, setCategory] = useState('Influencer');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const categories = [
    'Influencer',
    'Masjid',
    'WhatsappAPI',
    'Email Broadcast',
    'Meta Ads'
  ];

  useEffect(() => {
    if (isOpen) {
      setCategory('Influencer');
      setName('');
      setCity('');
      setCopied(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!campaignSlug) return;
    const baseUrl = 'https://tpfaid.org';
    const params = new URLSearchParams();
    
    // Add referral parameters
    params.set('ref', category);
    if ((category === 'Influencer' || category === 'Masjid') && name.trim()) {
      params.set('name', name.trim());
    }
    if (category === 'Masjid' && city.trim()) {
      params.set('city', city.trim());
    }

    setGeneratedLink(`${baseUrl}/campaign/${campaignSlug}?${params.toString()}`);
  }, [category, name, city, campaignSlug]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Link size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Campaign Link Generator</h2>
              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[280px]">For: {campaignTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <X size={20} className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Category Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Select Referral Channel / Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setName('');
                setCity('');
              }}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-semibold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Name Field (Influencer or Masjid) */}
          {(category === 'Influencer' || category === 'Masjid') && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {category === 'Influencer' ? 'Influencer Name' : 'Masjid Name'}
              </label>
              <input
                type="text"
                placeholder={category === 'Influencer' ? 'e.g. Ahmed Faraz' : 'e.g. Masjid Al-Aqsa'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
              />
            </div>
          )}

          {/* City Field (Masjid only) */}
          {category === 'Masjid' && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Masjid City
              </label>
              <input
                type="text"
                placeholder="e.g. Mumbai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
              />
            </div>
          )}

          {/* Generated URL Box */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Generated Referral Link
            </label>
            <div className="relative flex items-center bg-emerald-50/50 border-2 border-emerald-100/50 rounded-xl p-3 select-all">
              <span className="text-sm font-semibold text-emerald-800 break-all pr-12 select-all">
                {generatedLink}
              </span>
              <button
                onClick={handleCopy}
                className={`absolute right-2 p-2.5 rounded-lg transition-all ${
                  copied
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-emerald-100/70 hover:bg-emerald-200/80 text-emerald-700'
                }`}
                title="Copy Link"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
