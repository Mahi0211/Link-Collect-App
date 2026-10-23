import React, { useState } from 'react';
import { X, QrCode, Copy, Check, ExternalLink, Download } from 'lucide-react';

export function QrCodeModal({ isOpen, onClose, link }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !link) return null;

  const targetUrl = link.url || link.link || '';
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=15&format=svg&data=${encodeURIComponent(targetUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `QRCode-${(link.title || 'link').replace(/[^a-zA-Z0-9]/g, '_')}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(qrImageUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-center space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <QrCode className="w-4 h-4" />
            <span>Scan to Open on Mobile</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl shadow-inner flex items-center justify-center mx-auto w-64 h-64 border border-slate-200">
          <img
            src={qrImageUrl}
            alt="Link QR Code"
            className="w-full h-full object-contain"
            loading="eager"
          />
        </div>

        {/* Link Info */}
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white line-clamp-1">{link.title || 'Saved Link'}</h3>
          <p className="text-xs text-slate-400 line-clamp-1 break-all">{targetUrl}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy URL'}
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/30"
          >
            <Download className="w-3.5 h-3.5" />
            Download SVG
          </button>
        </div>
      </div>
    </div>
  );
}
