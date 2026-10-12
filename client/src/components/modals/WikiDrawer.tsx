import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Search,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { WIKI_ARTICLES, WikiArticle } from '../../data/navigationData';

interface WikiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WikiDrawer: React.FC<WikiDrawerProps> = ({ isOpen, onClose }) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>(WIKI_ARTICLES[0].id);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredArticles = WIKI_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(filterQuery.toLowerCase()) ||
      a.summary.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const activeArticle =
    WIKI_ARTICLES.find((a) => a.id === selectedArticleId) || WIKI_ARTICLES[0];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div
        className="relative bg-[#08222f] w-full max-w-2xl h-full shadow-2xl border-l border-[#14425b] flex flex-col text-left"
        role="dialog"
        aria-modal="true"
        aria-label="SmartHCM Wiki & Documentation"
      >
        {/* Drawer Header */}
        <div className="bg-[#071c26] text-white px-6 py-4 flex items-center justify-between border-b border-[#14425b]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-[#ff6f32]/20 text-[#ff6f32] border border-[#ff6f32]/30">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Smart<span className="text-[#ff6f32]">HCM</span> Knowledge Wiki</span>
              </h3>
              <p className="text-xs text-slate-400">
                Statutory formulas, payroll rules & configuration guides
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search filter in Wiki */}
        <div className="p-4 border-b border-[#14425b] bg-[#071c26] flex items-center space-x-2">
          <Search size={15} className="text-[#ff6f32] shrink-0" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search documentation, statutory formulas..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Content Body: Sidebar list + Detail View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Article list */}
          <div className="w-1/3 border-r border-[#14425b] overflow-y-auto p-2 space-y-1 bg-[#051720]">
            {filteredArticles.map((art) => (
              <button
                key={art.id}
                onClick={() => setSelectedArticleId(art.id)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition cursor-pointer ${
                  activeArticle.id === art.id
                    ? 'bg-[#ff6f32]/15 text-white border border-[#ff6f32]/40 font-semibold'
                    : 'text-slate-400 hover:bg-[#071c26] hover:text-white'
                }`}
              >
                <div className="text-[10px] text-[#ff6f32] uppercase font-bold tracking-wider mb-0.5">
                  {art.category}
                </div>
                <div className="line-clamp-2 leading-snug">{art.title}</div>
              </button>
            ))}
          </div>

          {/* Active Article Viewer */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#08222f]">
            <div>
              <span className="text-[11px] font-bold text-[#ff6f32] bg-[#ff6f32]/15 px-2 py-0.5 rounded border border-[#ff6f32]/30">
                {activeArticle.category}
              </span>
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-2">
                <Clock size={12} />
                <span>{activeArticle.readTime}</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1 leading-snug">
                {activeArticle.title}
              </h2>
            </div>

            <div className="bg-[#051720] border border-[#14425b] rounded-xl p-3.5 text-xs text-slate-300 font-medium leading-relaxed">
              💡 {activeArticle.summary}
            </div>

            <div className="text-xs text-slate-300 leading-relaxed space-y-3">
              <p>{activeArticle.content}</p>
              <div className="border-t border-[#14425b] pt-4 mt-6">
                <h5 className="font-bold text-white mb-2">Live Application Integration</h5>
                <p className="text-slate-400">
                  These business rules are directly executed by the backend Prisma ORM schema and
                  Express services. All transactions are atomic and auditable.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#071c26] border-t border-[#14425b] flex items-center justify-between text-xs text-slate-400">
          <span>SmartHCM Knowledge Base v2.6</span>
          <button
            onClick={onClose}
            className="bg-[#0a2736] hover:bg-[#14425b] border border-[#14425b] text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Close Wiki
          </button>
        </div>
      </div>
    </div>
  );
};
