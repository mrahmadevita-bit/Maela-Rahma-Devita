
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, RotateCcw, HelpCircle, Trophy, CheckCircle2, List, Home, Utensils,
  Bike, Droplets, Sun, Flame, Settings, Lightbulb, Fan, Thermometer
} from 'lucide-react';
import { SourceType, ConverterType, OutputType } from '../types';
import { MISSIONS } from '../constants';
import { LegendItem, PanelGroup, SelectBtn } from './UIComponents';
import { 
  drawCloudRealistic, drawRoundRect, spawnParticle, updateParticles, 
  drawSystemWires, drawConverter, drawSource, drawOutput, drawParticles 
} from '../utils/renderHelpers';
import { soundManager } from '../utils/soundManager';

export const SimulationLab = ({ onBack, mode }: { onBack: () => void, mode: 'sandbox' | 'mission' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const grassRef = useRef<{x: number, y: number, h: number}[]>([]);
  
  const [source, setSource] = useState<SourceType>('BIKE');
  const [converter, setConverter] = useState<ConverterType>('GENERATOR');
  const [output, setOutput] = useState<OutputType>('BULB');
  const [inputValue, setInputValue] = useState<number>(0); 
  const [showSymbols, setShowSymbols] = useState<boolean>(true);
  const [fedStatus, setFedStatus] = useState<number>(100); 
  const [isHungry, setIsHungry] = useState(false);

  // State Misi & Help
  const [activeMissionId, setActiveMissionId] = useState<number | null>(null);
  const [missionProgress, setMissionProgress] = useState(0);
  const [isMissionComplete, setIsMissionComplete] = useState(false);
  const [showMissionBrief, setShowMissionBrief] = useState(mode === 'mission');
  const [showHelp, setShowHelp] = useState<boolean>(true); // Muncul otomatis saat pertama kali

  // Physics Ref now includes birds
  const physics = useRef({ 
      speed: 0, 
      waterTemp: 20, 
      particles: [] as any[], 
      birds: [] as {x: number, y: number, speed: number, wingPhase: number}[],
      lastTime: 0, 
      animAngle: 0 
  });
  
  // Use a ref to hold latest state for animation loop to avoid re-creating the loop
  const propsRef = useRef({ 
      source, converter, output, inputValue, showSymbols, fedStatus, 
      activeMissionId, mode, missionProgress, isMissionComplete
  });

  useEffect(() => {
    propsRef.current = { 
        source, converter, output, inputValue, showSymbols, fedStatus, 
        activeMissionId, mode, missionProgress, isMissionComplete
    };
  }, [source, converter, output, inputValue, showSymbols, fedStatus, activeMissionId, mode, missionProgress, isMissionComplete]);

  // Play Success Sound
  useEffect(() => {
    if (isMissionComplete) {
      soundManager.playSuccess();
    }
  }, [isMissionComplete]);

  useEffect(() => {
     setInputValue(0); 
     setFedStatus(100);
     setIsHungry(false);
     physics.current.speed = 0;
     physics.current.waterTemp = 20;
     soundManager.stopLoop(); // Stop previous sound on source change
  }, [source]);

  // --- AUDIO FEEDBACK LOGIC ---
  useEffect(() => {
    // Start or update loop sound based on inputValue
    if (inputValue > 0 && !isHungry && !isMissionComplete) {
        soundManager.startLoop(source);
        soundManager.updateLoop(inputValue);
    } else {
        soundManager.stopLoop();
    }

    return () => soundManager.stopLoop(); // Cleanup on unmount
  }, [inputValue, source, isHungry, isMissionComplete]);


  // Energy drain logic optimized to run every 100ms without constantly resetting
  useEffect(() => {
    let interval: any;
    if (source === 'BIKE' && inputValue > 0 && !isHungry) {
      interval = setInterval(() => {
        setFedStatus(prev => {
            if (prev <= 0) return 0;
            const next = Math.max(0, prev - (inputValue * 0.005)); 
            if (next === 0) { 
                // We'll handle the state change in the next render cycle or separately to avoid conflicts
                return 0;
            }
            return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [source, inputValue, isHungry]); 

  // Separate effect to handle "Hungry" state trigger
  useEffect(() => {
      if (source === 'BIKE' && fedStatus <= 0 && !isHungry) {
          setInputValue(0);
          setIsHungry(true);
          soundManager.playError();
      }
  }, [fedStatus, source, isHungry]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
        if(containerRef.current) {
            canvas.width = containerRef.current.clientWidth;
            canvas.height = 500; 

            // Regenerate static grass on resize
            const W = canvas.width;
            const groundY = 500 - 80;
            const newGrass = [];
            for (let i = 0; i < W; i += 8) { 
                 const gx = i + Math.random() * 5;
                 const gy = groundY + Math.random() * 10;
                 const gh = 4 + Math.random() * 6;
                 newGrass.push({x: gx, y: gy, h: gh});
            }
            grassRef.current = newGrass;
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    let reqId: number;
    const animate = (time: number) => {
      const { source, converter, output, inputValue, showSymbols, fedStatus, activeMissionId, mode, isMissionComplete } = propsRef.current;
      const p = physics.current;
      const dt = Math.min((time - p.lastTime) / 1000, 0.1); 
      p.lastTime = time;

      // --- LOGIC UPDATES ---

      // 1. Simulation Speed
      let targetSpeed = 0;
      if (source === 'BIKE') targetSpeed = (fedStatus > 0) ? inputValue : 0;
      else if (source === 'SUN') {
          if (converter === 'SOLAR_PANEL') targetSpeed = inputValue; 
          else targetSpeed = 0; 
      } else if (source === 'WATER' || source === 'KETTLE') {
          targetSpeed = inputValue;
      }

      if (source === 'SUN' && converter === 'GENERATOR') targetSpeed = 0;
      if (source !== 'SUN' && converter === 'SOLAR_PANEL') targetSpeed = 0;

      const accel = targetSpeed > p.speed ? 40 : 20;
      if (targetSpeed > p.speed) p.speed += accel * dt;
      else p.speed -= accel * dt;
      p.speed = Math.max(0, Math.min(100, p.speed)); 
      
      if (p.speed > 0.1) p.animAngle += (p.speed * 0.003); 

      // 2. Output Logic
      if (output === 'HEATER') {
          const targetTemp = 20 + (p.speed * 0.8); 
          if (p.waterTemp < targetTemp) p.waterTemp += dt * 10;
          else p.waterTemp -= dt * 2;
      } else { 
          p.waterTemp = Math.max(20, p.waterTemp - dt * 5); 
      }

      // 3. Mission Logic
      if (mode === 'mission' && activeMissionId && !isMissionComplete) {
          const currentMission = MISSIONS.find(m => m.id === activeMissionId);
          if (currentMission) {
              const isConfigCorrect = 
                  source === currentMission.reqSource && 
                  converter === currentMission.reqConverter && 
                  output === currentMission.reqOutput;
              
              const isRunning = p.speed > 20; 

              if (isConfigCorrect && isRunning) {
                  setMissionProgress(prev => {
                      const newProg = Math.min(100, prev + 0.4); 
                      if (newProg >= 100) {
                        setTimeout(() => setIsMissionComplete(true), 0);
                      }
                      return newProg;
                  });
              }
          }
      }

      // 4. Particles
      if (showSymbols && p.speed > 5) {
          if (Math.random() < (p.speed / 2000)) spawnParticle(p.particles, source, converter);
      }
      updateParticles(p.particles, p.speed, output, converter, canvas.width);

      // 5. Birds Spawning Logic
      if (Math.random() < 0.002) { // Small chance to spawn a bird
          p.birds.push({
              x: -50,
              y: 50 + Math.random() * 150, // Fly in the upper sky
              speed: 1 + Math.random() * 1.5,
              wingPhase: Math.random() * Math.PI
          });
      }
      // Update Birds
      for (let i = p.birds.length - 1; i >= 0; i--) {
          const bird = p.birds[i];
          bird.x += bird.speed;
          bird.wingPhase += 0.2;
          if (bird.x > canvas.width + 50) {
              p.birds.splice(i, 1);
          }
      }


      // --- DRAWING ---
      const W = canvas.width;
      const H = canvas.height;
      if (W === 0 || H === 0) return; // Safety check

      const groundY = H - 80; 

      // 1. Sky Gradient (Vivid Blue)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, '#29B6F6'); // Light Blue 400
      skyGrad.addColorStop(0.6, '#81D4FA'); // Light Blue 200
      skyGrad.addColorStop(1, '#E1F5FE'); // Pale Blue
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // 2. Sun (Decorative, Top Right)
      const sunX = W - 80;
      const sunY = 80;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 60);
      sunGlow.addColorStop(0, 'rgba(255, 238, 88, 0.8)');
      sunGlow.addColorStop(1, 'rgba(255, 238, 88, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath(); ctx.arc(sunX, sunY, 60, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#FDD835'; 
      ctx.beginPath(); ctx.arc(sunX, sunY, 25, 0, Math.PI*2); ctx.fill();

      // 3. Far Mountains (Sharp, Atmospheric Indigo)
      const farMtGrad = ctx.createLinearGradient(0, groundY - 150, 0, groundY);
      farMtGrad.addColorStop(0, '#7986CB'); // Indigo 300
      farMtGrad.addColorStop(1, '#C5CAE9'); // Indigo 100
      ctx.fillStyle = farMtGrad;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(W * 0.1, groundY - 60);
      ctx.lineTo(W * 0.25, groundY - 30);
      ctx.lineTo(W * 0.4, groundY - 80);
      ctx.lineTo(W * 0.6, groundY - 40);
      ctx.lineTo(W * 0.8, groundY - 70);
      ctx.lineTo(W, groundY - 20);
      ctx.lineTo(W, groundY);
      ctx.fill();

      // 4. Mid Mountains (Darker Slate Blue with Snow Caps)
      const midMtGrad = ctx.createLinearGradient(0, groundY - 200, 0, groundY);
      midMtGrad.addColorStop(0, '#5C6BC0'); // Indigo 400
      midMtGrad.addColorStop(1, '#1A237E'); // Indigo 900
      ctx.fillStyle = midMtGrad;
      
      const peaks = [
        { x: W * 0.35, y: groundY - 130 },
        { x: W * 0.75, y: groundY - 110 }
      ];

      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(W * 0.15, groundY - 50);
      ctx.lineTo(peaks[0].x, peaks[0].y); // Peak 1
      ctx.lineTo(W * 0.55, groundY - 60); // Valley
      ctx.lineTo(peaks[1].x, peaks[1].y); // Peak 2
      ctx.lineTo(W * 0.95, groundY - 40);
      ctx.lineTo(W, groundY);
      ctx.fill();

      // Snow Caps (White Triangles)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      
      // Cap 1
      ctx.beginPath();
      ctx.moveTo(peaks[0].x, peaks[0].y);
      ctx.lineTo(peaks[0].x - 20, peaks[0].y + 25);
      ctx.lineTo(peaks[0].x - 5, peaks[0].y + 18); // Jagged edge
      ctx.lineTo(peaks[0].x + 5, peaks[0].y + 22);
      ctx.lineTo(peaks[0].x + 20, peaks[0].y + 25);
      ctx.closePath();
      ctx.fill();

      // Cap 2
      ctx.beginPath();
      ctx.moveTo(peaks[1].x, peaks[1].y);
      ctx.lineTo(peaks[1].x - 15, peaks[1].y + 20);
      ctx.lineTo(peaks[1].x, peaks[1].y + 15);
      ctx.lineTo(peaks[1].x + 15, peaks[1].y + 20);
      ctx.closePath();
      ctx.fill();


      // 5. Rolling Hills (Vibrant Green)
      const hillGrad = ctx.createLinearGradient(0, groundY - 80, 0, groundY);
      hillGrad.addColorStop(0, '#7CB342'); // Light Green 600
      hillGrad.addColorStop(1, '#33691E'); // Light Green 900
      ctx.fillStyle = hillGrad;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.bezierCurveTo(W * 0.2, groundY - 50, W * 0.5, groundY - 20, W * 0.8, groundY - 40);
      ctx.lineTo(W, groundY);
      ctx.lineTo(0, groundY);
      ctx.fill();

      // 6. Draw Birds (Behind foreground elements but in the sky)
      ctx.fillStyle = '#263238'; // Dark Blue Gray
      p.birds.forEach(bird => {
          const wingY = Math.sin(bird.wingPhase) * 5;
          ctx.beginPath();
          // Simple V shape with animated wings
          ctx.moveTo(bird.x, bird.y);
          ctx.lineTo(bird.x - 5, bird.y - 2 + wingY); // Left wing tip
          ctx.lineTo(bird.x + 2, bird.y + 2); // Body center
          ctx.lineTo(bird.x + 8, bird.y - 2 + wingY); // Right wing tip
          ctx.lineTo(bird.x, bird.y);
          ctx.fill();
      });

      // 7. Clouds (Drifting)
      const t = time / 1000;
      const cloud1X = (t * 15) % (W + 200) - 100;
      drawCloudRealistic(ctx, cloud1X, 80, 0.8);
      
      const cloud2X = ((t * 10) + 300) % (W + 300) - 150;
      drawCloudRealistic(ctx, cloud2X, 140, 0.6);

      // 8. Ground / Grass Foreground
      const groundGrad = ctx.createLinearGradient(0, groundY, 0, H);
      groundGrad.addColorStop(0, '#66BB6A'); 
      groundGrad.addColorStop(1, '#2E7D32');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, groundY, W, H - groundY);

      // 9. Static Grass Tufts
      ctx.strokeStyle = '#43A047';
      ctx.lineWidth = 2;
      grassRef.current.forEach(grass => {
          ctx.beginPath();
          ctx.moveTo(grass.x, grass.y);
          ctx.lineTo(grass.x - 2, grass.y - grass.h);
          ctx.moveTo(grass.x, grass.y);
          ctx.lineTo(grass.x + 2, grass.y - grass.h);
          ctx.stroke();
      });

      // 10. Platform shadows (Dirt patches under equipment)
      ctx.fillStyle = 'rgba(62, 39, 35, 0.4)'; // Dark brown transparent
      const posSource = { x: W * 0.25, y: groundY };
      const posConv = { x: W * 0.5, y: groundY };
      const posOut = { x: W * 0.75, y: groundY };
      
      // Draw dirt patches
      ctx.beginPath(); ctx.ellipse(posSource.x, groundY + 15, 50, 8, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(posConv.x, groundY + 15, 50, 8, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(posOut.x, groundY + 15, 50, 8, 0, 0, Math.PI*2); ctx.fill();

      // 11. Render System Elements
      try {
          drawSystemWires(ctx, posSource, posConv, posOut, source, converter, output, p.speed);
          drawConverter(ctx, converter, posConv.x, posConv.y, p.speed, p.animAngle, source);
          drawSource(ctx, source, posSource.x, posSource.y, inputValue, p.speed, p.animAngle, fedStatus, posConv.x, converter);
          drawOutput(ctx, output, posOut.x, posOut.y, p.speed, p.waterTemp, time);
          drawParticles(ctx, p.particles);
      } catch (err) {
          // Catch render errors to prevent animation loop crash
          console.error("Render error:", err);
      }

      reqId = requestAnimationFrame(animate);
    };
    reqId = requestAnimationFrame(animate);
    return () => { 
        cancelAnimationFrame(reqId); 
        window.removeEventListener('resize', handleResize); 
        soundManager.stopLoop(); // Stop loop on unmount
    };
  }, []);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(Number(e.target.value));
      if (source === 'BIKE') setIsHungry(false);
  };

  const feedBiker = () => { 
      soundManager.playClick();
      setFedStatus(100); 
      setIsHungry(false); 
  };

  const selectMission = (id: number) => {
      soundManager.playClick();
      setActiveMissionId(id);
      setShowMissionBrief(false);
      setMissionProgress(0);
      setIsMissionComplete(false);
      setInputValue(0);
      physics.current.speed = 0;
      setSource('BIKE'); setConverter('GENERATOR'); setOutput('BULB');
  };

  const handleReplay = () => {
    soundManager.playClick();
    setIsMissionComplete(false);
    setMissionProgress(0);
    setInputValue(0);
    physics.current.speed = 0;
  };

  const handleChooseOtherMission = () => {
    soundManager.playClick();
    setIsMissionComplete(false);
    setShowMissionBrief(true);
    setMissionProgress(0);
    setInputValue(0);
    physics.current.speed = 0;
  };

  const handleBack = () => {
      soundManager.playClick();
      soundManager.stopLoop();
      onBack();
  };

  const handleReset = () => {
      soundManager.playClick();
      setInputValue(0); 
      setFedStatus(100); 
      physics.current.waterTemp=20; 
      physics.current.speed=0;
  };

  const handleHelp = () => {
      soundManager.playClick();
      setShowHelp(true);
  };

  // Helper to play select sound when changing items
  const setSourceWithSound = (s: SourceType) => { soundManager.playSelect(); setSource(s); };
  const setConverterWithSound = (c: ConverterType) => { soundManager.playSelect(); setConverter(c); };
  const setOutputWithSound = (o: OutputType) => { soundManager.playSelect(); setOutput(o); };


  let sliderLabel = "Energi";
  let sliderMin = "Min";
  let sliderMax = "Max";
  if (source === 'SUN') { sliderLabel = "Intensitas Cahaya"; sliderMin="Gelap"; sliderMax="Terang"; }
  else if (source === 'BIKE') { sliderLabel = "Kecepatan Kayuh"; sliderMin="Pelan"; sliderMax="Cepat"; }
  else if (source === 'WATER') { sliderLabel = "Debit Air"; sliderMin="Tutup"; sliderMax="Buka"; }
  else if (source === 'KETTLE') { sliderLabel = "Besar Api"; sliderMin="Kecil"; sliderMax="Besar"; }

  const activeMissionData = MISSIONS.find(m => m.id === activeMissionId);

  // --- RENDER ---
  return (
    <div className="flex flex-col min-h-screen bg-slate-100 relative">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
            <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full border border-slate-300 transition-colors"><ArrowLeft size={24} className="text-slate-700"/></button>
            <h1 className="font-black text-slate-800 uppercase tracking-widest hidden md:block text-xl">
                {mode === 'mission' ? `Misi: ${activeMissionData?.title || 'Pilih Misi'}` : 'Lab Eksperimen'}
            </h1>
        </div>
        
        {/* PROGRESS BAR FOR MISSION */}
        {mode === 'mission' && activeMissionId && (
            <div className="flex-1 max-w-md mx-6">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>PROGRESS MISI</span>
                    <span>{Math.round(missionProgress)}%</span>
                </div>
                <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                    <div 
                        className="h-full bg-gradient-to-r from-orange-400 to-green-500 transition-all duration-300"
                        style={{width: `${missionProgress}%`}}
                    ></div>
                </div>
            </div>
        )}

        <div className="flex items-center gap-3">
            {/* Help Button */}
            <button onClick={handleHelp} className="bg-blue-100 text-blue-700 p-2 rounded-full hover:bg-blue-200 border-2 border-blue-300 shadow-sm transition-all" title="Bantuan">
                <HelpCircle size={20} />
            </button>
            <button onClick={handleReset} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full hover:bg-slate-200 border-2 border-slate-300 font-bold text-xs flex items-center gap-2"><RotateCcw size={16} /> Reset</button>
        </div>
      </div>

      {/* HELP TUTORIAL OVERLAY */}
      {showHelp && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowHelp(false)}>
              <div className="bg-white rounded-[2.5rem] max-w-2xl w-full p-8 shadow-2xl animate-bounce-in border-8 border-yellow-400 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-yellow-100 to-white -z-10"></div>
                  <button onClick={() => setShowHelp(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200"><ArrowLeft size={20}/></button>
                  
                  <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                        <Lightbulb size={40} className="text-white fill-white"/>
                      </div>
                      <h2 className="text-3xl font-black text-slate-800 uppercase tracking-wide">Cara Main</h2>
                      <p className="text-slate-600 font-medium">Ikuti langkah mudah ini untuk jadi ilmuwan energi!</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                          <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                          <div>
                              <h4 className="font-bold text-blue-900 mb-1">Pilih Sumber</h4>
                              <p className="text-sm text-blue-700 leading-tight">Klik ikon <strong>Sepeda</strong>, <strong>Matahari</strong>, atau <strong>Air</strong> di bagian bawah.</p>
                          </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                          <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                          <div>
                              <h4 className="font-bold text-orange-900 mb-1">Pilih Alat</h4>
                              <p className="text-sm text-orange-700 leading-tight">Pilih alat pengubah energi seperti <strong>Generator</strong> atau <strong>Panel Surya</strong>.</p>
                          </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-green-50 rounded-2xl border border-green-100">
                          <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                          <div>
                              <h4 className="font-bold text-green-900 mb-1">Pilih Hasil</h4>
                              <p className="text-sm text-green-700 leading-tight">Mau menyalakan apa? <strong>Lampu</strong>, <strong>Kipas</strong>, atau <strong>Pemanas</strong>?</p>
                          </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                          <div className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">4</div>
                          <div>
                              <h4 className="font-bold text-purple-900 mb-1">Geser Slider!</h4>
                              <p className="text-sm text-purple-700 leading-tight">Tarik slider di pojok kiri atas untuk memberikan tenaga!</p>
                              <div className="mt-2 w-full h-2 bg-purple-200 rounded-full overflow-hidden"><div className="w-1/2 h-full bg-purple-500"></div></div>
                          </div>
                      </div>
                  </div>

                  <div className="mt-8 text-center">
                      <button onClick={() => setShowHelp(false)} className="bg-yellow-400 text-yellow-900 px-10 py-3 rounded-xl font-black text-lg shadow-[0_4px_0_rgb(234,179,8)] hover:translate-y-1 hover:shadow-none transition-all w-full md:w-auto">
                          SIAP MULAI!
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* MISSION OVERLAY / BRIEFING MODAL */}
      {mode === 'mission' && showMissionBrief && (
          <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-[2rem] max-w-4xl w-full p-8 shadow-2xl animate-bounce-in border-4 border-slate-800">
                  <div className="text-center mb-8">
                      <h2 className="text-4xl font-black text-slate-800 uppercase tracking-wide mb-2">Pilih Tantanganmu</h2>
                      <p className="text-slate-500 font-medium">Selesaikan masalah energi di bawah ini!</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {MISSIONS.map((m) => (
                          <button key={m.id} onClick={() => selectMission(m.id)} className="bg-slate-50 hover:bg-yellow-50 border-2 border-slate-200 hover:border-yellow-400 rounded-2xl p-6 text-left transition-all group relative overflow-hidden">
                              <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">{m.difficulty}</div>
                              <div className="bg-white w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                  <Trophy size={24} className={m.id === 1 ? 'text-orange-500' : m.id === 2 ? 'text-blue-500' : 'text-green-500'} />
                              </div>
                              <h3 className="text-xl font-black text-slate-800 mb-2">{m.title}</h3>
                              <p className="text-sm text-slate-600 leading-snug">{m.desc}</p>
                          </button>
                      ))}
                  </div>
                  <div className="mt-8 text-center">
                      <button onClick={handleBack} className="text-slate-500 font-bold hover:text-slate-800 bg-white px-6 py-2 rounded-xl border border-slate-300 hover:bg-slate-100">Kembali ke Menu Utama</button>
                  </div>
              </div>
          </div>
      )}

      {/* SUCCESS MODAL */}
      {isMissionComplete && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full text-center shadow-2xl border-4 border-green-500 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-100 to-white -z-10"></div>
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-white animate-bounce">
                      <CheckCircle2 size={48} className="text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-green-600 mb-2 uppercase">Misi Berhasil!</h2>
                  <p className="text-slate-600 font-medium mb-8 text-lg">Kamu berhasil menyelesaikan tantangan <strong>"{activeMissionData?.title}"</strong>.</p>
                  
                  <div className="flex flex-col gap-3">
                      <div className="flex gap-3 justify-center">
                        <button onClick={handleChooseOtherMission} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 border-b-4 border-slate-300 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2">
                             <List size={18}/> Pilih Misi Lain
                        </button>
                        <button onClick={handleReplay} className="flex-1 px-4 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 shadow-lg border-b-4 border-green-700 active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2">
                             <RotateCcw size={18}/> Ulangi
                        </button>
                      </div>
                      <button onClick={handleBack} className="w-full px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 shadow-lg border-b-4 border-blue-700 active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2">
                           <Home size={18}/> Kembali ke Menu Utama
                      </button>
                  </div>

              </div>
          </div>
      )}

      {/* CANVAS AREA */}
      <div ref={containerRef} className="w-full h-[500px] bg-slate-200 relative shadow-inner overflow-hidden">
          <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" />
          
          <div className="absolute top-6 left-6 flex flex-col gap-4 z-10">
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-300 shadow-xl w-64 transition-all hover:scale-105">
                <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase mb-2">
                    <span>{sliderMin}</span><span>{sliderMax}</span>
                </div>
                <input type="range" min="0" max="100" value={inputValue} onChange={handleSliderChange} disabled={isHungry} className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500" />
                <div className="flex justify-between items-center mt-3 border-t border-slate-100 pt-2">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-wider">{isHungry ? "KELELAHAN!" : sliderLabel}</span>
                    <span className="text-sm font-bold text-slate-800 bg-slate-100 px-2 rounded">{inputValue}%</span>
                </div>
            </div>
            {source === 'BIKE' && (
                <button onClick={feedBiker} disabled={fedStatus > 90} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition-all shadow-lg border-b-4 active:border-b-0 active:translate-y-1 w-40 ${fedStatus > 90 ? 'bg-slate-200 text-slate-400 border-slate-300' : 'bg-orange-500 text-white border-orange-700 hover:bg-orange-600 animate-pulse'}`}>
                    <Utensils size={16} /> {isHungry ? "BERI MAKAN!" : "Isi Tenaga"}
                </button>
            )}
          </div>

          <div className="absolute top-6 right-6 z-10">
              <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-300 shadow-xl w-36">
                <label className="flex items-center gap-3 cursor-pointer p-1 hover:bg-slate-50 rounded-lg transition-colors">
                    <input type="checkbox" checked={showSymbols} onChange={(e) => setShowSymbols(e.target.checked)} className="w-5 h-5 accent-orange-500 rounded focus:ring-orange-500" />
                    <span className="font-bold text-slate-700 text-xs uppercase">Simbol Energi</span>
                </label>
                {showSymbols && (
                    <div className="space-y-2 mt-3 pl-1 pt-2 border-t border-slate-200">
                        <LegendItem color="bg-green-500" label="Kimia" />
                        <LegendItem color="bg-gray-400" label="Mekanik" />
                        <LegendItem color="bg-blue-500" label="Listrik" />
                        <LegendItem color="bg-yellow-400" label="Cahaya" />
                        <LegendItem color="bg-red-500" label="Panas" />
                    </div>
                )}
              </div>
          </div>
      </div>

      <div className="bg-white border-t border-slate-200 p-8 z-30 pb-16 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              <PanelGroup label="1. Sumber Energi">
                  <SelectBtn active={source==='BIKE'} onClick={()=>setSourceWithSound('BIKE')} icon={<Bike/>} label="Sepeda" />
                  <SelectBtn active={source==='WATER'} onClick={()=>setSourceWithSound('WATER')} icon={<Droplets/>} label="Air" />
                  <SelectBtn active={source==='SUN'} onClick={()=>setSourceWithSound('SUN')} icon={<Sun/>} label="Matahari" />
                  <SelectBtn active={source==='KETTLE'} onClick={()=>setSourceWithSound('KETTLE')} icon={<Flame/>} label="Uap" />
              </PanelGroup>
              <PanelGroup label="2. Alat Pengubah">
                  <SelectBtn active={converter==='GENERATOR'} onClick={()=>setConverterWithSound('GENERATOR')} icon={<Settings/>} label="Generator" />
                  <SelectBtn active={converter==='SOLAR_PANEL'} onClick={()=>setConverterWithSound('SOLAR_PANEL')} icon={<div className="w-5 h-5 bg-blue-600 border border-white rounded-sm grid grid-cols-2 grid-rows-2 gap-[1px]"><div className="bg-blue-400"></div><div className="bg-blue-400"></div><div className="bg-blue-400"></div><div className="bg-blue-400"></div></div>} label="Panel Surya" />
              </PanelGroup>
              <PanelGroup label="3. Hasil Output">
                  <SelectBtn active={output==='BULB'} onClick={()=>setOutputWithSound('BULB')} icon={<Lightbulb/>} label="Lampu" />
                  <SelectBtn active={output==='FAN'} onClick={()=>setOutputWithSound('FAN')} icon={<Fan/>} label="Kipas" />
                  <SelectBtn active={output==='HEATER'} onClick={()=>setOutputWithSound('HEATER')} icon={<Thermometer/>} label="Pemanas" />
              </PanelGroup>
          </div>
      </div>
    </div>
  );
};
