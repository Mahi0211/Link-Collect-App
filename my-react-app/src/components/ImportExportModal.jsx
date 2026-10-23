import React, { useState, useRef } from 'react';
import { X, Upload, Download, FileText, CheckCircle2, AlertCircle, Loader2, FolderTree, ArrowRight } from 'lucide-react';
import { parseNetscapeBookmarks, parseCsvBookmarks, exportToNetscapeHtml, exportToCsv, triggerFileDownload } from '../utils/bookmarkParser';
import { api } from '../utils/api';

export function ImportExportModal({ isOpen, onClose, currentLinks = [], collections = [], onImportComplete, onNotify }) {
  const [activeTab, setActiveTab] = useState('import'); // 'import' | 'export'
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [importTarget, setImportTarget] = useState('auto'); // 'auto' (use folders) or specific collectionId
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');
    setIsLoading(true);

    try {
      const text = await selectedFile.text();
      let result = { links: [] };

      if (selectedFile.name.endsWith('.html') || selectedFile.name.endsWith('.htm')) {
        result = parseNetscapeBookmarks(text);
      } else if (selectedFile.name.endsWith('.csv')) {
        result = parseCsvBookmarks(text);
      } else if (selectedFile.name.endsWith('.json')) {
        const json = JSON.parse(text);
        if (Array.isArray(json)) {
          result = { links: json };
        } else if (json.collections && Array.isArray(json.collections)) {
          const flat = [];
          json.collections.forEach(c => {
            (c.links || []).forEach(l => {
              flat.push({
                url: typeof l === 'string' ? l : l.url || l.link,
                title: l.title || '',
                collectionName: c.collectionName || c.name || 'Imported',
                customTags: l.customTags || []
              });
            });
          });
          result = { links: flat };
        } else if (json.links && Array.isArray(json.links)) {
          result = { links: json.links };
        }
      } else {
        throw new Error('Unsupported file format. Please upload an HTML bookmark file, CSV, or JSON.');
      }

      if (!result.links || result.links.length === 0) {
        throw new Error('No valid links were detected in this file.');
      }

      setParsedData(result);
    } catch (err) {
      setError(err.message || 'Failed to parse file.');
      setParsedData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartImport = async () => {
    if (!parsedData || !parsedData.links.length) return;

    setIsLoading(true);
    setError('');

    try {
      const payload = parsedData.links.map(l => ({
        url: l.url,
        title: l.title || undefined,
        collectionName: importTarget === 'auto' ? (l.collectionName || 'Imported Bookmarks') : undefined,
        collectionId: importTarget !== 'auto' ? parseInt(importTarget, 10) : undefined,
        customTags: l.customTags || ['Imported'],
        notes: l.notes || ''
      }));

      const res = await api.batchImportLinks(payload);
      onNotify?.(`Successfully imported ${res?.count || payload.length} bookmarks!`, 'success');
      onImportComplete?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Import failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (format) => {
    const timestamp = new Date().toISOString().split('T')[0];
    if (format === 'html') {
      const html = exportToNetscapeHtml(currentLinks);
      triggerFileDownload(html, `LinkCollect-Bookmarks-${timestamp}.html`, 'text/html;charset=utf-8');
      onNotify?.('Exported Netscape Bookmark HTML file!', 'success');
    } else if (format === 'csv') {
      const csv = exportToCsv(currentLinks);
      triggerFileDownload(csv, `LinkCollect-Export-${timestamp}.csv`, 'text/csv;charset=utf-8');
      onNotify?.('Exported CSV spreadsheet!', 'success');
    } else if (format === 'json') {
      const json = JSON.stringify(currentLinks, null, 2);
      triggerFileDownload(json, `LinkCollect-Backup-${timestamp}.json`, 'application/json;charset=utf-8');
      onNotify?.('Exported JSON backup!', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Import & Export Bookmarks</h2>
              <p className="text-xs text-slate-400">Sync with Chrome, Firefox, Safari, or backup data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-3 gap-6">
          <button
            onClick={() => setActiveTab('import')}
            className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'import'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Import Bookmarks
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'export'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            Export & Backup
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'import' ? (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-950/30 hover:bg-slate-800/20"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".html,.htm,.csv,.json"
                  className="hidden"
                />
                <div className="w-12 h-12 mx-auto rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-200">
                  {file ? file.name : 'Click or drag bookmark file here'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports Netscape HTML (Chrome, Safari, Firefox), CSV, or JSON
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {parsedData && (
                <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300 font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Parsed {parsedData.links.length} links
                    </span>
                    {parsedData.collections?.length > 0 && (
                      <span className="text-xs text-slate-400">
                        {parsedData.collections.length} folder(s) found
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Destination Folder
                    </label>
                    <select
                      value={importTarget}
                      onChange={(e) => setImportTarget(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option value="auto">Preserve Original Bookmark Folders</option>
                      {collections.map(c => (
                        <option key={c.id} value={c.id}>
                          Put all into: {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Export your entire library ({currentLinks.length} items) into standard formats compatible with modern browsers and spreadsheets.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleExport('html')}
                  className="p-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 rounded-xl flex flex-col items-center text-center gap-2 transition-all group"
                >
                  <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                    <Download className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-white">Browser HTML</span>
                  <span className="text-xs text-slate-400">Importable in Chrome, Safari & Firefox</span>
                </button>

                <button
                  onClick={() => handleExport('csv')}
                  className="p-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-xl flex flex-col items-center text-center gap-2 transition-all group"
                >
                  <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-white">CSV Sheet</span>
                  <span className="text-xs text-slate-400">Excel & Google Sheets compatible</span>
                </button>

                <button
                  onClick={() => handleExport('json')}
                  className="p-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 rounded-xl flex flex-col items-center text-center gap-2 transition-all group"
                >
                  <div className="p-3 rounded-full bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                    <FolderTree className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-white">JSON Backup</span>
                  <span className="text-xs text-slate-400">Full lossless raw dataset backup</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          {activeTab === 'import' && parsedData && (
            <button
              onClick={handleStartImport}
              disabled={isLoading}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  Import {parsedData.links.length} Links
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
