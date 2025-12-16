import React from 'react';

export const MenuCard = ({ title, subtitle, icon, color, border, onClick, isMain }: any) => (
  <button onClick={onClick} className={`relative group w-full ${isMain ? 'md:-mt-12 h-44 md:h-80' : 'h-36 md:h-60'} rounded-[2.5rem] ${border} ${color} border-slate-800/20 flex flex-col items-center justify-center gap-2 md:gap-4 shadow-xl transform transition-all duration-300 hover:-translate-y-4 hover:scale-105 active:translate-y-0 active:scale-95`}>
    <div className="absolute inset-0 opacity-10 rounded-[2rem] bg-[radial-gradient(circle,white,transparent)]"></div>
    <div className="bg-white/25 p-4 md:p-5 rounded-full backdrop-blur-sm border-2 border-white/40 shadow-inner group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">{icon}</div>
    <div className="text-center z-10 px-2">
        <h2 className={`${isMain ? 'text-4xl' : 'text-2xl'} font-black text-white drop-shadow-md tracking-wider uppercase`}>{title}</h2>
        <p className="text-white/90 font-bold text-xs md:text-sm uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">{subtitle}</p>
    </div>
  </button>
);

export const LogicCard = ({ title, desc, icon, color }: any) => (
    <div className={`p-6 rounded-3xl border-2 border-slate-200 ${color} hover:scale-[1.02] transition-transform`}>
        <div className="flex items-center gap-3 mb-3">
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">{icon}</div>
            <h3 className="text-lg font-black text-slate-800">{title}</h3>
        </div>
        <p className="text-slate-700 font-medium leading-relaxed text-sm">{desc}</p>
    </div>
);

export const ProblemSolutionCard = ({ problem, solution, icon }: any) => (
    <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
        <div className="bg-slate-100 p-3 rounded-full text-slate-600">{icon}</div>
        <div className="flex-1">
            <div className="text-red-500 text-xs font-bold uppercase mb-1">Masalah: {problem}</div>
            <div className="text-green-600 text-sm font-bold flex items-center gap-2">
                {solution}
            </div>
        </div>
    </div>
);

export const LegendItem = ({color, label}: any) => (
    <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color} shadow-sm border border-black/10`}></div>
        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wide">{label}</span>
    </div>
);

export const PanelGroup = ({label, children}: any) => (
    <div className="bg-slate-50 px-6 py-5 rounded-[1.5rem] border border-slate-200 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300">
        <span className="text-xs uppercase font-black text-slate-500 tracking-wider text-center bg-white px-3 py-1.5 rounded-lg border border-slate-200 self-center shadow-sm">{label}</span>
        <div className="flex flex-wrap justify-center gap-3">{children}</div>
    </div>
);

export const SelectBtn = ({active, onClick, icon, label}: any) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all w-20 group ${active ? 'bg-white text-orange-600 ring-4 ring-orange-100 shadow-lg transform -translate-y-1' : 'bg-transparent text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}>
        <div className={`p-3 rounded-xl transition-colors ${active ? 'bg-orange-50' : 'bg-slate-200 group-hover:bg-slate-300'}`}>{icon}</div>
        <span className="text-[10px] font-bold uppercase">{label}</span>
    </button>
);