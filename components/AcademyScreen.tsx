import React, { useState } from 'react';
import { ArrowLeft, Activity, Bike, Lightbulb, Flame, Battery, Utensils, HelpCircle, Droplets, Sun, CheckCircle2 } from 'lucide-react';
import { LogicCard, ProblemSolutionCard } from './UIComponents';

export const AcademyScreen = ({ onBack }: { onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<'topikA' | 'topikC'>('topikA');

  return (
    <div className="min-h-screen bg-[#FFF9C4] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-yellow-400 border-b-4 border-slate-900 p-4 flex justify-between items-center shadow-lg z-50">
        <button onClick={onBack} className="bg-white px-4 md:px-6 py-2 rounded-xl border-2 border-slate-900 font-bold hover:bg-slate-100 flex items-center gap-2 shadow-[4px_4px_0_#000] active:translate-y-1 active:shadow-none transition-all"><ArrowLeft size={20}/> KELUAR</button>
        <div className="flex gap-2 md:gap-4 overflow-x-auto">
            <button onClick={() => setActiveTab('topikA')} className={`px-4 md:px-6 py-2 rounded-xl font-black uppercase transition-all whitespace-nowrap ${activeTab === 'topikA' ? 'bg-orange-500 text-white shadow-[2px_2px_0_#000] translate-y-0' : 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'}`}>Topik A: Perubahan Energi</button>
            <button onClick={() => setActiveTab('topikC')} className={`px-4 md:px-6 py-2 rounded-xl font-black uppercase transition-all whitespace-nowrap ${activeTab === 'topikC' ? 'bg-blue-500 text-white shadow-[2px_2px_0_#000] translate-y-0' : 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'}`}>Topik C: Manusia & Energi</button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto pb-24">
        <div className="max-w-5xl mx-auto">
           
           {/* TOPIK A */}
           {activeTab === 'topikA' && (
               <div className="space-y-8 animate-fade-in">
                   <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 shadow-[8px_8px_0_rgba(0,0,0,0.2)]">
                       <h2 className="text-3xl font-black text-center mb-4 text-slate-800 uppercase tracking-wide flex items-center justify-center gap-3">
                           <Activity className="text-orange-500" size={32}/> Energi Tidak Bisa Diciptakan!
                       </h2>
                       <p className="text-slate-600 text-lg text-center font-medium leading-relaxed">
                           "Manusia tidak bisa menciptakan energi. Untuk memanfaatkan energi, manusia <strong>mengubah bentuk energi</strong> yang ada menjadi bentuk energi yang lain."
                       </p>
                   </div>

                   <h3 className="text-2xl font-black text-slate-800 mt-8 mb-4 px-4 border-l-8 border-orange-500">Contoh Perubahan Energi (Buku IPAS Hal. 4)</h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <LogicCard 
                           title="Energi Kimia → Energi Gerak"
                           icon={<Bike size={32} className="text-green-600"/>}
                           desc="Mobil atau motor menggunakan bensin (Energi Kimia) untuk bisa bergerak (Energi Gerak)."
                           color="bg-green-50"
                        />
                        <LogicCard 
                           title="Energi Listrik → Energi Cahaya"
                           icon={<Lightbulb size={32} className="text-yellow-600"/>}
                           desc="Lampu di rumah kita mengubah energi listrik menjadi cahaya terang."
                           color="bg-yellow-50"
                        />
                        <LogicCard 
                           title="Energi Listrik → Energi Panas"
                           icon={<Flame size={32} className="text-red-600"/>}
                           desc="Setrika atau Penanak Nasi (Rice Cooker) menjadi panas karena dialiri listrik."
                           color="bg-red-50"
                        />
                        <LogicCard 
                           title="Energi Kimia → Energi Listrik"
                           icon={<Battery size={32} className="text-blue-600"/>}
                           desc="Baterai menyimpan energi kimia. Saat dipakai, energi itu berubah menjadi listrik."
                           color="bg-blue-50"
                        />
                   </div>

                   <div className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-6 mt-8">
                        <h3 className="text-xl font-black text-orange-800 mb-2 flex items-center gap-2"><Utensils size={24}/> Tubuh Kita Juga Mengubah Energi!</h3>
                        <p className="text-orange-700 font-medium">
                            Manusia makan nasi, buah, dan sayur (<strong>Energi Kimia</strong>). Setelah makan, tubuh kita jadi kuat untuk berlari, bermain bola, dan belajar (<strong>Energi Gerak</strong>).
                        </p>
                   </div>
               </div>
           )}

           {/* TOPIK C */}
           {activeTab === 'topikC' && (
               <div className="space-y-8 animate-fade-in">
                   <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 shadow-[8px_8px_0_rgba(0,0,0,0.2)]">
                       <h2 className="text-3xl font-black text-center mb-4 text-slate-800 uppercase tracking-wide flex items-center justify-center gap-3">
                           <HelpCircle className="text-blue-500" size={32}/> Untuk Apa Mengubah Energi?
                       </h2>
                       <p className="text-slate-600 text-lg text-center font-medium leading-relaxed">
                           "Agar energi di alam bisa dimanfaatkan secara optimal untuk <strong>memenuhi kebutuhan</strong> dan <strong>memecahkan masalah</strong> manusia."
                       </p>
                   </div>

                   <h3 className="text-2xl font-black text-slate-800 mt-8 mb-4 px-4 border-l-8 border-blue-500">Listrik Memudahkan Hidup Kita</h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                       <div className="bg-sky-100 p-6 rounded-3xl border-2 border-sky-300">
                           <h4 className="font-black text-sky-800 text-lg mb-2 flex items-center gap-2"><Droplets size={20}/> Pembangkit Listrik Tenaga Air (PLTA)</h4>
                           <p className="text-sky-700 text-sm">Aliran air yang deras (Energi Gerak) memutar turbin generator untuk menghasilkan Listrik.</p>
                       </div>
                       <div className="bg-yellow-100 p-6 rounded-3xl border-2 border-yellow-300">
                           <h4 className="font-black text-yellow-800 text-lg mb-2 flex items-center gap-2"><Sun size={20}/> Panel Surya</h4>
                           <p className="text-yellow-700 text-sm">Energi Cahaya dari Matahari ditangkap panel surya dan diubah menjadi energi Listrik.</p>
                       </div>
                   </div>

                   <h3 className="text-xl font-black text-slate-700 px-2">Masalah vs Solusi Energi</h3>
                   <div className="grid grid-cols-1 gap-4">
                       <ProblemSolutionCard 
                           problem="Malam hari gelap, susah membaca buku."
                           solution={<div className="flex items-center gap-2"><CheckCircle2 size={16}/> Solusi: Lampu (Listrik → Cahaya)</div>}
                           icon={<Lightbulb size={24}/>}
                       />
                       <ProblemSolutionCard 
                           problem="Ingin makan nasi hangat dengan cepat."
                           solution={<div className="flex items-center gap-2"><CheckCircle2 size={16}/> Solusi: Penanak Nasi / Rice Cooker (Listrik → Panas)</div>}
                           icon={<Flame size={24}/>}
                       />
                       <ProblemSolutionCard 
                           problem="Alat elektronik susah dibawa kemana-mana karena kabel."
                           solution={<div className="flex items-center gap-2"><CheckCircle2 size={16}/> Solusi: Baterai (Menyimpan Energi Kimia → Listrik)</div>}
                           icon={<Battery size={24}/>}
                       />
                   </div>
               </div>
           )}
        </div>
      </div>
    </div>
  );
};