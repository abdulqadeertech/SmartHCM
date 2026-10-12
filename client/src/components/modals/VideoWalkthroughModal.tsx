import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  CheckCircle2,
  Clock,
  CreditCard,
  CalendarCheck,
  BarChart3,
} from 'lucide-react';

interface VideoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestDemo: () => void;
}

export const VideoWalkthroughModal: React.FC<VideoWalkthroughModalProps> = ({
  isOpen,
  onClose,
  onRequestDemo,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeChapter, setActiveChapter] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const chapters = [
    {
      title: '1. Biometric Punch & Shift Attendance',
      duration: '0:45',
      icon: Clock,
      description:
        'Live biometric terminal syncing, geo-fence clock-ins, automatic 15-min grace calculations, and late arrivals.',
    },
    {
      title: '2. Multi-tier Payroll Engine & Slips',
      duration: '1:15',
      icon: CreditCard,
      description:
        'One-click monthly payroll processing, basic pay, allowances, PF 12% deduction, tax brackets, and tamper-evident locking.',
    },
    {
      title: '3. Holiday-Aware Leave Entitlement',
      duration: '1:45',
      icon: CalendarCheck,
      description:
        'Official holiday calendar exclusions, annual/sick balance checks, and 1-click atomic multi-stage approvals.',
    },
    {
      title: '4. Executive Headcount & BI Analytics',
      duration: '2:20',
      icon: BarChart3,
      description:
        'Real-time workforce headcount charts, attendance metrics, turnover rates, and authorized CSV audit reports.',
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-[#08222f] rounded-2xl shadow-2xl max-w-4xl w-full border border-[#14425b] overflow-hidden text-left"
        role="dialog"
        aria-modal="true"
        aria-label="SmartHCM Interactive Video Walkthrough"
      >
        {/* Header */}
        <div className="bg-[#071c26] text-white px-6 py-4 flex items-center justify-between border-b border-[#14425b]">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-[#ff6f32]/20 text-[#ff6f32] border border-[#ff6f32]/30">
              <Play size={16} />
            </span>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-1.5">
                <span>Smart<span className="text-[#ff6f32]">HCM</span> Cloud Platform Interactive Tour</span>
              </h3>
              <p className="text-xs text-slate-400">
                End-to-End Enterprise Workforce & Payroll Automation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Canvas / Interactive Screen */}
        <div className="relative aspect-video bg-[#051720] flex flex-col justify-between p-6 overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ff6f32_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Simulated Active Screen UI */}
          <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-4">
            <div className="bg-[#071c26]/80 backdrop-blur-md border border-[#14425b] p-6 rounded-2xl max-w-lg shadow-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#ff6f32]/20 border border-[#ff6f32]/40 text-[#ff6f32] flex items-center justify-center mx-auto">
                {React.createElement(chapters[activeChapter].icon, { size: 24 })}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff6f32] bg-[#051720] px-2 py-0.5 rounded border border-[#ff6f32]/30">
                Chapter {activeChapter + 1} of {chapters.length}
              </span>
              <h4 className="text-lg font-bold text-white">
                {chapters[activeChapter].title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {chapters[activeChapter].description}
              </p>

              <div className="pt-2 flex items-center justify-center space-x-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-[#ff6f32] hover:bg-[#ea580c] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 transition shadow cursor-pointer"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isPlaying ? 'Pause Demo' : 'Play Walkthrough'}</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onRequestDemo();
                  }}
                  className="bg-[#0a2736] hover:bg-[#14425b] border border-[#14425b] text-white text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
                >
                  Book Live Demo
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Player Controls */}
          <div className="relative z-10 bg-[#071c26]/90 backdrop-blur-md rounded-xl p-3 border border-[#14425b] flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 text-white hover:text-[#ff6f32] transition cursor-pointer"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                onClick={() => setActiveChapter(0)}
                className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
                title="Restart"
              >
                <RotateCcw size={16} />
              </button>
              <span className="text-[11px] font-mono text-slate-400">
                {chapters[activeChapter].duration} / 2:20
              </span>
            </div>

            {/* Chapters navigation */}
            <div className="hidden sm:flex items-center space-x-2">
              {chapters.map((ch, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveChapter(idx)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                    activeChapter === idx
                      ? 'bg-[#ff6f32] text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Ch. {idx + 1}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <button
                onClick={() => {
                  onClose();
                  onRequestDemo();
                }}
                className="bg-[#ff6f32] hover:bg-[#ea580c] text-white font-semibold px-3 py-1 rounded-md text-[11px] transition shadow cursor-pointer"
              >
                Request Demo
              </button>
            </div>
          </div>
        </div>

        {/* Chapters Details Grid below Video */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-[#071c26] border-t border-[#14425b]">
          {chapters.map((ch, idx) => {
            const Icon = ch.icon;
            const isActive = activeChapter === idx;
            return (
              <div
                key={idx}
                onClick={() => setActiveChapter(idx)}
                className={`p-3 rounded-xl border transition cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#08222f] border-[#ff6f32] shadow-sm'
                    : 'bg-[#051720] border-[#14425b] hover:border-slate-600'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Icon size={14} className={isActive ? 'text-[#ff6f32]' : 'text-slate-400'} />
                  <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {ch.title.split('.')[1]}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">{ch.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
