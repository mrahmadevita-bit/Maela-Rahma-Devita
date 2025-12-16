
import { COLORS } from '../constants';
import { SourceType, ConverterType, OutputType, Particle } from '../types';

export const drawRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

export const drawCloudRealistic = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 8;
  
  ctx.fillStyle = '#FFFFFF';
  
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.arc(25, -10, 35, 0, Math.PI * 2);
  ctx.arc(50, 0, 30, 0, Math.PI * 2);
  ctx.arc(80, -5, 25, 0, Math.PI * 2);
  ctx.arc(25, 10, 30, 0, Math.PI * 2);
  ctx.arc(55, 10, 30, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(25, -15, 25, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
};

export const spawnParticle = (particles: Particle[], source: SourceType, converter: ConverterType) => {
    let type = 'chemical'; 
    let yOffset = (Math.random() - 0.5) * 10;
    if (source === 'BIKE') { type = 'chemical'; }
    else if (source === 'WATER') { type = 'mechanical'; }
    else if (source === 'SUN') { type = 'light'; yOffset = (Math.random() - 0.5) * 40; }
    else if (source === 'KETTLE') { type = 'heat'; }
    particles.push({ stage: 0, progress: 0, type: type, yOffset: yOffset });
};

export const updateParticles = (particles: Particle[], speed: number, output: OutputType, converter: ConverterType, W: number) => {
    const cx_src = W * 0.25; const cx_conv = W * 0.5; const cx_out = W * 0.75;
    const moveSpeed = 0.005 + (speed / 10000); 

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]; p.progress += moveSpeed;
        if (p.stage === 0 && p.progress >= 1) {
            p.stage = 1; p.progress = 0;
            if (converter === 'GENERATOR') { if (['mechanical', 'heat', 'chemical'].includes(p.type)) p.type = 'electrical'; } 
            else if (converter === 'SOLAR_PANEL') { if (p.type === 'light') p.type = 'electrical'; }
        } else if (p.stage === 1 && p.progress >= 1) {
            p.stage = 2; p.progress = 0;
            if (output === 'BULB') p.type = 'light'; 
            if (output === 'FAN') p.type = 'mechanical'; 
            if (output === 'HEATER') p.type = 'heat';
        } else if (p.stage === 2 && p.progress >= 1) { particles.splice(i, 1); }
    }
};

export const drawParticles = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    const W = ctx.canvas.width; const H = ctx.canvas.height; const groundY = H - 80;
    const srcX = W * 0.25; const convX = W * 0.5; const outX = W * 0.75;

    particles.forEach(p => {
        let x = 0, y = 0;
        if (p.stage === 0) {
            if (p.type === 'light') {
                const sunY = groundY - 250; const panelTopY = groundY - 80;
                x = srcX + (convX - srcX) * p.progress; y = sunY + (panelTopY - sunY) * p.progress + p.yOffset; 
            } else {
                x = srcX + (convX - srcX) * p.progress; y = groundY - 50 + p.yOffset;
                if (p.type === 'heat') { const rise = Math.sin(p.progress * Math.PI) * 50; y -= rise; }
            }
        } else if (p.stage === 1) { x = convX + (outX - convX) * p.progress; y = groundY - 50; 
        } else if (p.stage === 2) { x = outX + (p.yOffset * 2); y = (groundY - 50) - (100 * p.progress); }

        const color = COLORS.energy[p.type as keyof typeof COLORS.energy] || '#000';
        ctx.fillStyle = color; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText("E", x, y+1);
    });
};

export const drawSystemWires = (ctx: CanvasRenderingContext2D, p1: any, p2: any, p3: any, src: SourceType, conv: ConverterType, output: OutputType, speed: number) => {
    let targetX = p3.x - 40; let targetY = p3.y - 10;
    if (output === 'BULB') { targetX = p3.x - 50; targetY = p3.y - 10; }
    else if (output === 'FAN') { targetX = p3.x - 5; targetY = p3.y - 10; }
    else if (output === 'HEATER') { targetX = p3.x - 30; targetY = p3.y - 10; }

    ctx.beginPath(); 
    let startX = p2.x + 40; let startY = p2.y - 10;
    if (conv === 'SOLAR_PANEL') { startX = p2.x + 25; startY = p2.y - 15; }

    ctx.moveTo(startX, startY); 
    const cp1x = startX + 30; const cp1y = startY; const cp2x = targetX - 30; const cp2y = targetY;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, targetX, targetY); 
    ctx.lineCap = 'round'; ctx.lineWidth = 8; ctx.strokeStyle = '#546E7A'; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = '#90A4AE'; ctx.stroke(); 

    // Belt Animation (Bike to Generator)
    if (conv === 'GENERATOR' && src === 'BIKE') {
        const bikeRearWheelX = p1.x - 40; 
        const bikeRearWheelY = p1.y - 45; 
        const genPulleyX = p2.x; const genPulleyY = p2.y - 85; 
        
        const beltColor = '#333';
        
        ctx.beginPath(); ctx.moveTo(bikeRearWheelX, bikeRearWheelY - 28); ctx.lineTo(genPulleyX, genPulleyY - 35); ctx.moveTo(genPulleyX, genPulleyY + 35); ctx.lineTo(bikeRearWheelX, bikeRearWheelY + 28); ctx.lineWidth = 5; ctx.strokeStyle = beltColor; ctx.stroke();
        
        // Animated dashes on belt
        ctx.beginPath(); ctx.moveTo(bikeRearWheelX, bikeRearWheelY - 28); ctx.lineTo(genPulleyX, genPulleyY - 35); 
        ctx.setLineDash([15, 20]); ctx.lineDashOffset = -Date.now() / 8 * (speed / 50); ctx.strokeStyle = '#78909C'; ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]);
        
        ctx.beginPath(); ctx.moveTo(genPulleyX, genPulleyY + 35); ctx.lineTo(bikeRearWheelX, bikeRearWheelY + 28); 
        ctx.setLineDash([15, 20]); ctx.lineDashOffset = Date.now() / 8 * (speed / 50); ctx.strokeStyle = '#78909C'; ctx.stroke(); ctx.setLineDash([]);
    }
};

export const drawSource = (ctx: CanvasRenderingContext2D, type: SourceType, x: number, y: number, input: number, speed: number, angle: number, fed: number, targetX: number, converter: ConverterType) => {
    if (type === 'BIKE') {
        const bikeColor = '#1976D2'; 
        const skinColor = '#F5CBA7'; 
        const skinShadow = '#D7CCC8';
        const shirtColor = '#EEEEEE'; 
        const shortsColor = '#37474F';
        const shortsShadow = '#263238';
        const helmetColor = '#D32F2F'; 
        
        const wheelR = 30;
        const rearWheelX = x - 40; 
        const rearWheelY = y - 45; 
        const frontWheelX = rearWheelX + 100; 
        const frontWheelY = rearWheelY;
        const crankX = rearWheelX + 45; 
        const crankY = rearWheelY + 10; 
        const seatX = rearWheelX + 25;
        const seatY = rearWheelY - 55;
        const handleStemX = frontWheelX - 25;
        const handleStemY = rearWheelY - 70;
        const handleX = handleStemX + 10;
        const handleY = handleStemY;

        // 1. STAND 
        ctx.strokeStyle = '#78909C'; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(rearWheelX, rearWheelY); ctx.lineTo(rearWheelX - 10, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(rearWheelX, rearWheelY); ctx.lineTo(rearWheelX + 10, y); ctx.stroke();
        ctx.fillStyle = '#90A4AE'; ctx.fillRect(rearWheelX - 20, y - 5, 40, 5);

        // 2. WHEELS
        const drawWheel = (wx: number, wy: number) => {
            ctx.save();
            ctx.translate(wx, wy);
            if (speed > 0) ctx.rotate(angle * 2); 
            ctx.beginPath(); ctx.arc(0, 0, wheelR, 0, Math.PI * 2);
            ctx.lineWidth = 5; ctx.strokeStyle = '#263238'; ctx.stroke(); 
            ctx.beginPath(); ctx.arc(0, 0, wheelR - 4, 0, Math.PI * 2);
            ctx.lineWidth = 3; ctx.strokeStyle = '#CFD8DC'; ctx.stroke(); 
            ctx.lineWidth = 1.5; ctx.strokeStyle = '#B0BEC5'; 
            for(let i=0; i<6; i++) {
                ctx.beginPath(); ctx.moveTo(0,0); 
                const rad = (i * 60) * (Math.PI/180);
                ctx.lineTo(Math.cos(rad)*(wheelR-4), Math.sin(rad)*(wheelR-4));
                ctx.stroke();
            }
            ctx.restore();
        };

        drawWheel(rearWheelX, rearWheelY);
        drawWheel(frontWheelX, frontWheelY);

        // --- IK LOGIC FOR LEGS ---
        const bounce = Math.sin(angle * 2) * 2; 
        const hipX = seatX - 5;
        const hipY = seatY - 15 + bounce;
        const shoulderX = hipX + 35; 
        const shoulderY = hipY - 45 + (bounce * 0.5); 

        const drawLeg = (isRightLeg: boolean) => {
            const colorSkin = isRightLeg ? skinShadow : skinColor;
            const colorShorts = isRightLeg ? shortsShadow : shortsColor;
            const colorShoe = isRightLeg ? '#B71C1C' : '#D32F2F';

            const phase = isRightLeg ? Math.PI : 0;
            const currentAngle = angle + phase; 
            const pedalRad = 14;
            const px = crankX + Math.cos(currentAngle) * pedalRad;
            const py = crankY + Math.sin(currentAngle) * pedalRad;
            const L1 = 42; 
            const L2 = 42; 
            const dx = px - hipX;
            const dy = py - hipY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const clampedDist = Math.min(dist, L1 + L2 - 0.5);
            
            const baseAngle = Math.atan2(dy, dx);
            const cosAlpha = (L1*L1 + clampedDist*clampedDist - L2*L2) / (2*L1*clampedDist);
            const alpha = Math.acos(Math.max(-1, Math.min(1, cosAlpha)));
            const thighAngle = baseAngle - alpha;
            const kx = hipX + Math.cos(thighAngle) * L1;
            const ky = hipY + Math.sin(thighAngle) * L1;
            const shinAngle = Math.atan2(py - ky, px - kx);

            // Draw Thigh
            ctx.save(); ctx.translate(hipX, hipY); ctx.rotate(thighAngle);
            ctx.fillStyle = colorShorts; ctx.beginPath(); ctx.moveTo(0, -6); ctx.quadraticCurveTo(L1/2, -12, L1, -5); ctx.lineTo(L1, 5); ctx.quadraticCurveTo(L1/2, 12, 0, 8); ctx.fill(); ctx.restore();

            // Draw Shin
            ctx.save(); ctx.translate(kx, ky); ctx.rotate(shinAngle);
            ctx.fillStyle = colorShorts; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = colorSkin; ctx.beginPath(); ctx.moveTo(0, -5); ctx.quadraticCurveTo(L2*0.3, -9, L2, -3); ctx.lineTo(L2, 3); ctx.lineTo(0, 5); ctx.fill();
            ctx.fillStyle = '#FFF'; ctx.fillRect(L2 - 8, -3, 8, 6); ctx.restore();

            // Draw Shoe
            ctx.fillStyle = colorShoe; ctx.beginPath(); ctx.ellipse(px, py - 3, 12, 5, 0.1, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#ECEFF1'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px-6, py+2); ctx.lineTo(px+8, py+2); ctx.stroke();

            // Pedal
            ctx.fillStyle = '#546E7A'; ctx.save(); ctx.translate(px, py); ctx.fillRect(-8, 0, 16, 4); ctx.restore();
        };

        // Right Leg (Far)
        drawLeg(true);

        // Right Arm (Far)
        const handX = handleX - 5; const handY = handleY + 5;
        ctx.strokeStyle = shirtColor; ctx.lineWidth = 10; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(shoulderX-5, shoulderY); ctx.lineTo(handX-5, handY); ctx.stroke();
        ctx.strokeStyle = skinShadow; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(shoulderX + 15, shoulderY + 20); ctx.lineTo(handX, handY); ctx.stroke();

        // Bike Frame
        ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = bikeColor;
        ctx.beginPath();
        ctx.moveTo(rearWheelX, rearWheelY); ctx.lineTo(crankX, crankY);
        ctx.moveTo(rearWheelX, rearWheelY); ctx.lineTo(seatX, seatY);
        ctx.moveTo(seatX, seatY); ctx.lineTo(crankX, crankY);
        ctx.moveTo(seatX, seatY); ctx.lineTo(handleStemX, handleStemY + 25); 
        ctx.moveTo(crankX, crankY); ctx.lineTo(handleStemX, handleStemY + 25); 
        ctx.moveTo(handleStemX, handleStemY + 15); ctx.lineTo(frontWheelX, frontWheelY);
        ctx.stroke();

        ctx.strokeStyle = '#90A4AE'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(handleStemX, handleStemY + 25); ctx.lineTo(handleStemX, handleStemY); ctx.stroke(); ctx.beginPath(); ctx.moveTo(handleStemX, handleStemY); ctx.lineTo(handleX, handleY); ctx.stroke();
        ctx.strokeStyle = '#212121'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(handleX, handleY); ctx.lineTo(handleX + 5, handleY); ctx.stroke();

        ctx.fillStyle = '#212121'; ctx.beginPath(); ctx.moveTo(seatX - 15, seatY); ctx.lineTo(seatX + 15, seatY); ctx.quadraticCurveTo(seatX + 20, seatY, seatX + 18, seatY + 8); ctx.lineTo(seatX - 12, seatY + 8); ctx.fill();
        ctx.fillStyle = '#37474F'; ctx.beginPath(); ctx.arc(crankX, crankY, 8, 0, Math.PI*2); ctx.fill(); ctx.strokeStyle = '#263238'; ctx.lineWidth = 2; ctx.stroke();

        // --- FOREGROUND LAYER (NEAR SIDE) ---
        const headX = shoulderX + 5; const headY = shoulderY - 25;
        ctx.strokeStyle = shirtColor; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(hipX, hipY); ctx.quadraticCurveTo(hipX + 10, hipY - 25, shoulderX, shoulderY); ctx.stroke();
        ctx.strokeStyle = '#FBC02D'; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(hipX + 2, hipY - 5); ctx.lineTo(hipX + 5, hipY - 12); ctx.stroke();
        ctx.strokeStyle = skinColor; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(shoulderX, shoulderY); ctx.lineTo(headX - 2, headY + 5); ctx.stroke();

        ctx.fillStyle = skinColor; ctx.beginPath(); ctx.arc(headX, headY, 12, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(headX + 8, headY - 8); ctx.quadraticCurveTo(headX + 14, headY - 2, headX + 14, headY + 2); ctx.lineTo(headX + 10, headY + 6); ctx.lineTo(headX + 10, headY + 12); ctx.lineTo(headX, headY + 12); ctx.fill();

        ctx.fillStyle = helmetColor; ctx.beginPath(); ctx.moveTo(headX - 11, headY + 2); ctx.bezierCurveTo(headX - 16, headY - 18, headX + 14, headY - 18, headX + 14, headY - 5); ctx.lineTo(headX + 16, headY - 3); ctx.lineTo(headX + 10, headY - 3); ctx.fill();
        ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(headX - 2, headY - 10, 4, 0, Math.PI*2); ctx.fill(); 
        ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(headX - 2, headY + 2); ctx.quadraticCurveTo(headX, headY + 14, headX + 8, headY + 12); ctx.stroke();

        ctx.strokeStyle = '#333'; ctx.fillStyle = '#333'; ctx.lineWidth = 1.5;
        if (fed < 30) { ctx.beginPath(); ctx.moveTo(headX + 6, headY - 3); ctx.lineTo(headX + 10, headY - 2); ctx.stroke(); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(headX + 8, headY - 1, 3, 0, Math.PI, false); ctx.stroke(); } 
        else { ctx.beginPath(); ctx.arc(headX + 8, headY - 3, 1.5, 0, Math.PI*2); ctx.fill(); }

        ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5; ctx.beginPath();
        if (fed > 70) { ctx.moveTo(headX + 6, headY - 7); ctx.quadraticCurveTo(headX + 9, headY - 9, headX + 12, headY - 7); ctx.stroke(); ctx.beginPath(); ctx.arc(headX + 8, headY + 4, 3, 0.2, Math.PI - 0.2, false); ctx.stroke(); } 
        else if (fed > 30) { ctx.moveTo(headX + 6, headY - 7); ctx.lineTo(headX + 12, headY - 6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(headX + 8, headY + 6); ctx.lineTo(headX + 12, headY + 6); ctx.stroke(); } 
        else { ctx.moveTo(headX + 6, headY - 8); ctx.lineTo(headX + 8, headY - 6); ctx.lineTo(headX + 11, headY - 7); ctx.stroke(); ctx.fillStyle = '#5D4037'; ctx.beginPath(); ctx.ellipse(headX + 10, headY + 6, 2, 3, Math.PI/3, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#4FC3F7'; const t = Date.now() / 150; if (Math.sin(t) > 0) { ctx.beginPath(); ctx.arc(headX + 6, headY - 6, 2, 0, Math.PI*2); ctx.fill(); }
            if (speed > 5) { ctx.beginPath(); ctx.arc(headX - 4 - (t%10), headY - 5 + (t%5), 1.5, 0, Math.PI*2); ctx.fill(); }
            ctx.fillStyle = 'rgba(239, 83, 80, 0.3)'; ctx.beginPath(); ctx.arc(headX + 6, headY + 2, 5, 0, Math.PI*2); ctx.fill();
        }

        const elbowX = (shoulderX + handX) / 2 + 5; const elbowY = (shoulderY + handY) / 2 + 15;
        ctx.strokeStyle = shirtColor; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(shoulderX, shoulderY); ctx.lineTo(elbowX, elbowY); ctx.stroke(); 
        ctx.strokeStyle = skinColor; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(elbowX, elbowY); ctx.lineTo(handX, handY); ctx.stroke(); 
        ctx.fillStyle = '#E53935'; ctx.beginPath(); ctx.arc(handX, handY, 6, 0, Math.PI*2); ctx.fill();

        drawLeg(false);

        const barX = x - 50; const barY = y + 15; 
        ctx.fillStyle = '#fff'; ctx.strokeStyle = '#333'; ctx.lineWidth=1; ctx.fillRect(barX, barY, 60, 8); ctx.strokeRect(barX, barY, 60, 8); 
        ctx.fillStyle = fed < 30 ? '#F44336' : (fed < 70 ? '#FFEB3B' : '#76FF03'); ctx.fillRect(barX+1, barY+1, 58 * (fed/100), 6); 
        ctx.fillStyle = '#37474F'; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center'; ctx.fillText("TENAGA", barX + 30, barY + 20);

    } else if (type === 'SUN') {
        const sunY = y - 250; const intensity = input / 100; const glowRadius = 60 + (intensity * 120); 
        const glowGrad = ctx.createRadialGradient(x, sunY, 40, x, sunY, glowRadius); glowGrad.addColorStop(0, `rgba(255, 235, 59, ${0.8 * intensity})`); glowGrad.addColorStop(0.4, `rgba(255, 193, 7, ${0.4 * intensity})`); glowGrad.addColorStop(1, 'rgba(255, 193, 7, 0)'); ctx.fillStyle = glowGrad; ctx.beginPath(); ctx.arc(x, sunY, glowRadius, 0, Math.PI*2); ctx.fill();
        const sunR = 50; const sunGrad = ctx.createRadialGradient(x - 15, sunY - 15, 5, x, sunY, sunR); sunGrad.addColorStop(0, '#FFF9C4'); sunGrad.addColorStop(0.2, '#FFEE58'); sunGrad.addColorStop(0.5, '#FBC02D'); sunGrad.addColorStop(0.9, '#F57C00'); sunGrad.addColorStop(1, '#E65100'); ctx.fillStyle = sunGrad; ctx.beginPath(); ctx.arc(x, sunY, sunR, 0, Math.PI*2); ctx.fill();
        if (intensity > 0.2) { ctx.save(); ctx.translate(x, sunY); ctx.rotate(Date.now() / 4000); ctx.strokeStyle = `rgba(255, 235, 59, ${0.6 * intensity})`; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (let i = 0; i < 16; i++) { ctx.rotate((Math.PI * 2) / 16); ctx.beginPath(); ctx.moveTo(sunR + 10, 0); const pulse = Math.sin((Date.now() / 200) + i) * 5; const rayLength = (sunR + 30 + (intensity * 40)) + pulse; ctx.lineTo(rayLength, 0); ctx.stroke(); } ctx.restore(); }
        if (converter === 'SOLAR_PANEL' && intensity > 0) { const panelX = targetX; const panelY = y - 70; const beamGrad = ctx.createLinearGradient(x, sunY, panelX, panelY); beamGrad.addColorStop(0, `rgba(255, 235, 59, ${0.4 * intensity})`); beamGrad.addColorStop(1, `rgba(255, 235, 59, 0)`); ctx.save(); ctx.fillStyle = beamGrad; ctx.beginPath(); ctx.moveTo(x - 30, sunY); ctx.lineTo(panelX - 60, panelY); ctx.lineTo(panelX + 60, panelY); ctx.lineTo(x + 30, sunY); ctx.closePath(); ctx.fill(); ctx.restore(); }
        if (input < 100) { const cloudOpacity = (100 - input) / 100; const cloudColor = `rgba(238, 238, 238, ${cloudOpacity})`; ctx.fillStyle = cloudColor; ctx.beginPath(); ctx.arc(x-35, sunY+25, 35, 0, Math.PI*2); ctx.arc(x+5, sunY+35, 40, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(x+45, sunY+15, 45, 0, Math.PI*2); ctx.arc(x+15, sunY-15, 40, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(x-20, sunY-20, 30, 0, Math.PI*2); ctx.fill(); }
    } else if (type === 'WATER') {
        const genCenterX = targetX || x; const turbineR = 40; const dropZoneX = genCenterX - turbineR + 5; 
        const tapSpoutX = dropZoneX; const tapPipeEndX = tapSpoutX - 30; const tapY = y - 200; const pipeH = 30;
        const pipeGrad = ctx.createLinearGradient(0, tapY, 0, tapY+pipeH); pipeGrad.addColorStop(0, '#B0BEC5'); pipeGrad.addColorStop(0.4, '#ECEFF1'); pipeGrad.addColorStop(1, '#90A4AE');
        ctx.fillStyle = pipeGrad; ctx.fillRect(0, tapY, tapPipeEndX, pipeH); ctx.strokeStyle = '#546E7A'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, tapY); ctx.lineTo(tapPipeEndX, tapY); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, tapY+pipeH); ctx.lineTo(tapPipeEndX, tapY+pipeH); ctx.stroke();
        ctx.fillStyle = '#78909C'; ctx.fillRect(tapPipeEndX-5, tapY-2, 10, pipeH+4);
        ctx.fillStyle = pipeGrad; ctx.beginPath(); ctx.moveTo(tapPipeEndX, tapY); ctx.lineTo(tapPipeEndX + 10, tapY); ctx.bezierCurveTo(tapSpoutX + 20, tapY, tapSpoutX + 20, tapY + 40, tapSpoutX + 10, tapY + 50); ctx.lineTo(tapSpoutX - 10, tapY + 50); ctx.bezierCurveTo(tapSpoutX - 20, tapY + 40, tapSpoutX - 15, tapY + 35, tapPipeEndX, tapY + 30); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#607D8B'; ctx.fillRect(tapSpoutX - 10, tapY + 48, 20, 8); ctx.strokeRect(tapSpoutX - 10, tapY + 48, 20, 8);
        const handleX = tapPipeEndX + 5; const handleY = tapY - 5; ctx.fillStyle = '#B0BEC5'; ctx.fillRect(handleX, handleY - 15, 8, 15);
        ctx.save(); ctx.translate(handleX + 4, handleY - 15); const rotation = (input / 100) * (Math.PI / 2.5); ctx.rotate(-rotation); ctx.fillStyle = '#42A5F5'; ctx.strokeStyle = '#1E88E5'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(15, -8, 35, -5, 45, 0); ctx.bezierCurveTo(35, 5, 15, 8, 0, 0); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ECEFF1'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore();
        if (input > 0) { const spoutY = tapY + 56; const flowWidth = (input / 100) * 16 + 2; const groundLimit = y - 40; const waterGrad = ctx.createLinearGradient(tapSpoutX - flowWidth/2, 0, tapSpoutX + flowWidth/2, 0); waterGrad.addColorStop(0, 'rgba(129, 212, 250, 0.4)'); waterGrad.addColorStop(0.5, 'rgba(33, 150, 243, 0.7)'); waterGrad.addColorStop(1, 'rgba(129, 212, 250, 0.4)'); ctx.fillStyle = waterGrad; ctx.beginPath(); ctx.moveTo(tapSpoutX - flowWidth/2, spoutY); ctx.lineTo(tapSpoutX + flowWidth/2, spoutY); ctx.lineTo(tapSpoutX + flowWidth/2 - 2, groundLimit); ctx.lineTo(tapSpoutX - flowWidth/2 + 2, groundLimit); ctx.fill(); ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; ctx.lineWidth = 2; ctx.beginPath(); const timeOffset = Date.now() / 2; const numLines = 3; for(let i=0; i<numLines; i++) { const lineX = tapSpoutX - flowWidth/3 + (i * flowWidth/3); const lineY = spoutY + ((timeOffset + i*50) % (groundLimit - spoutY)); const lineLen = 15 + Math.random() * 20; if (lineY + lineLen < groundLimit) { ctx.moveTo(lineX, lineY); ctx.lineTo(lineX, lineY + lineLen); } } ctx.stroke(); ctx.fillStyle = 'rgba(225, 245, 254, 0.8)'; const splashCount = Math.floor(input / 15); for(let i=0; i<splashCount; i++) { const sx = tapSpoutX + (Math.random() - 0.5) * 25; const sy = groundLimit + (Math.random() - 0.5) * 15; ctx.beginPath(); ctx.arc(sx, sy, Math.random()*3 + 1, 0, Math.PI*2); ctx.fill(); } }
    } else if (type === 'KETTLE') {
        const stoveX = x - 20; const stoveY = y - 20;
        ctx.fillStyle = '#9E9E9E'; ctx.beginPath(); ctx.ellipse(stoveX, stoveY, 35, 10, 0, 0, Math.PI*2); ctx.fill(); const stoveGrad = ctx.createLinearGradient(stoveX-35, stoveY, stoveX+35, stoveY); stoveGrad.addColorStop(0, '#757575'); stoveGrad.addColorStop(0.5, '#BDBDBD'); stoveGrad.addColorStop(1, '#616161'); ctx.fillStyle = stoveGrad; ctx.fillRect(stoveX-35, stoveY, 70, 40); 
        ctx.fillStyle = '#212121'; ctx.fillRect(stoveX-10, stoveY+10, 20, 20); if (input > 0) { ctx.fillStyle = input > 70 ? '#D32F2F' : (input > 30 ? '#FBC02D' : '#388E3C'); const h = (input/100) * 16; ctx.fillRect(stoveX-8, stoveY+28-h, 16, h); }
        ctx.lineWidth = 3; ctx.strokeStyle = '#212121'; ctx.beginPath(); ctx.moveTo(stoveX-35, stoveY); ctx.lineTo(stoveX-35, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(stoveX+35, stoveY); ctx.lineTo(stoveX+35, y); ctx.stroke(); 
        if (input > 0) { const flameH = (input / 100) * 40 + 5; const t = Date.now() / 100; ctx.save(); ctx.translate(stoveX, stoveY); ctx.fillStyle = 'rgba(255, 87, 34, 0.8)'; ctx.beginPath(); ctx.moveTo(-20, 0); ctx.quadraticCurveTo(-25 + Math.sin(t)*2, -flameH/2, 0 + Math.cos(t*1.5)*5, -flameH); ctx.quadraticCurveTo(25 + Math.cos(t)*2, -flameH/2, 20, 0); ctx.fill(); ctx.fillStyle = 'rgba(255, 235, 59, 0.9)'; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.quadraticCurveTo(-12 + Math.sin(t+1)*2, -flameH/2.5, 0 + Math.cos(t*2)*3, -flameH*0.7); ctx.quadraticCurveTo(12 + Math.cos(t+1)*2, -flameH/2.5, 10, 0); ctx.fill(); ctx.restore(); }
        const kettleY = stoveY - 50; const kettleX = stoveX; const kGrad = ctx.createRadialGradient(kettleX - 15, kettleY - 15, 5, kettleX, kettleY, 50); kGrad.addColorStop(0, '#EF5350'); kGrad.addColorStop(1, '#B71C1C'); 
        ctx.fillStyle = kGrad; ctx.beginPath(); ctx.ellipse(kettleX, kettleY, 45, 35, 0, 0, Math.PI*2); ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = '#7F0000'; ctx.stroke();
        ctx.fillStyle = '#B71C1C'; ctx.beginPath(); ctx.ellipse(kettleX, kettleY-30, 25, 8, 0, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#212121'; ctx.beginPath(); ctx.arc(kettleX, kettleY-38, 6, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#212121'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(kettleX - 35, kettleY - 15); ctx.bezierCurveTo(kettleX - 60, kettleY - 20, kettleX - 60, kettleY + 20, kettleX - 30, kettleY + 20); ctx.stroke();
        ctx.fillStyle = kGrad; ctx.beginPath(); ctx.moveTo(kettleX + 30, kettleY - 10); ctx.quadraticCurveTo(kettleX + 50, kettleY - 20, kettleX + 60, kettleY - 25); ctx.lineTo(kettleX + 60, kettleY - 15); ctx.quadraticCurveTo(kettleX + 45, kettleY, kettleX + 35, kettleY + 15); ctx.fill(); ctx.stroke();
        if (input > 30) { const spoutTipX = kettleX + 60; const spoutTipY = kettleY - 20; const turbineTargetX = targetX ? targetX - 40 : x + 80; const turbineTargetY = y - 160; const steamCount = Math.floor((input-30)/8); ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; const t = Date.now()/1000; for(let i=0; i<steamCount; i++) { const progress = ((t * 1.5 + i/5) % 1); const currX = spoutTipX + (turbineTargetX - spoutTipX) * progress; const currY = spoutTipY + (turbineTargetY - spoutTipY) * progress; const wiggle = Math.sin(progress * 10 + i) * 5; const puffSize = 5 + (progress * 15); ctx.beginPath(); ctx.arc(currX + wiggle, currY, puffSize, 0, Math.PI*2); ctx.fill(); } }
    }
};

export const drawConverter = (ctx: CanvasRenderingContext2D, type: ConverterType, x: number, y: number, speed: number, angle: number, source: SourceType) => {
    if (type === 'GENERATOR') {
        const boxW = 90; const boxH = 130; const boxX = x - boxW/2; const boxY = y - boxH;
        const bGrad = ctx.createLinearGradient(boxX, 0, boxX+boxW, 0); bGrad.addColorStop(0, '#B0BEC5'); bGrad.addColorStop(0.5, '#CFD8DC'); bGrad.addColorStop(1, '#B0BEC5'); ctx.fillStyle = bGrad; ctx.strokeStyle = '#78909C'; ctx.lineWidth = 2; 
        
        drawRoundRect(ctx, boxX, boxY, boxW, boxH, 12); ctx.fill(); ctx.stroke();
        
        ctx.fillStyle = '#546E7A'; ctx.fillRect(x-55, y-12, 110, 12);
        if (source === 'KETTLE') {
            const wheelX = x; const wheelY = boxY - 10; const wheelR = 45; const turbAngle = angle * 2;
            ctx.fillStyle = '#78909C'; ctx.fillRect(wheelX - 5, wheelY, 10, 50); 
            ctx.save(); ctx.translate(wheelX, wheelY); ctx.rotate(turbAngle);
            ctx.beginPath(); ctx.arc(0,0, 18, 0, Math.PI*2); ctx.fillStyle = '#5D4037'; ctx.fill(); ctx.stroke();
            for(let i=0; i<8; i++) { ctx.rotate(Math.PI/4); ctx.fillStyle = '#8D6E63'; ctx.fillRect(-3, -5, 6, wheelR); ctx.fillStyle = '#6D4C41'; ctx.beginPath(); ctx.moveTo(-8, wheelR); ctx.quadraticCurveTo(0, wheelR + 12, 8, wheelR); ctx.lineTo(6, wheelR - 5); ctx.lineTo(-6, wheelR - 5); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fill(); }
            ctx.fillStyle = '#3E2723'; ctx.beginPath(); ctx.arc(0,0, 8, 0, Math.PI*2); ctx.fill(); ctx.restore();
        } else if (source === 'WATER') {
            const wheelX = x; const wheelY = boxY + 55; const wheelR = 45; const turbAngle = angle * 2;
            ctx.save(); ctx.translate(wheelX, wheelY); ctx.rotate(turbAngle);
            ctx.beginPath(); ctx.arc(0,0, 18, 0, Math.PI*2); ctx.fillStyle = '#5D4037'; ctx.fill(); ctx.stroke();
            for(let i=0; i<8; i++) { ctx.rotate(Math.PI/4); ctx.fillStyle = '#8D6E63'; ctx.fillRect(-3, -5, 6, wheelR); ctx.fillStyle = '#6D4C41'; ctx.beginPath(); ctx.moveTo(-8, wheelR); ctx.quadraticCurveTo(0, wheelR + 12, 8, wheelR); ctx.lineTo(6, wheelR - 5); ctx.lineTo(-6, wheelR - 5); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fill(); }
            ctx.fillStyle = '#3E2723'; ctx.beginPath(); ctx.arc(0,0, 8, 0, Math.PI*2); ctx.fill(); ctx.restore();
        } else {
            const pulleyY = boxY + 40; const pulleyR = 38; const turbAngle = angle * 3;
            ctx.save(); ctx.translate(x, pulleyY); ctx.rotate(turbAngle);
            ctx.fillStyle = '#A1887F'; ctx.beginPath(); ctx.arc(0,0, pulleyR, 0, Math.PI*2); ctx.fill(); ctx.strokeStyle = '#5D4037'; ctx.lineWidth=4; ctx.stroke();
            ctx.fillStyle = '#6D4C41'; for(let i=0; i<6; i++) { ctx.rotate(Math.PI/3); ctx.beginPath(); ctx.moveTo(10, -5); ctx.lineTo(pulleyR-5, -10); ctx.lineTo(pulleyR-5, 10); ctx.lineTo(10, 5); ctx.fill(); }
            ctx.fillStyle = '#3E2723'; ctx.beginPath(); ctx.arc(0,0,10,0,Math.PI*2); ctx.fill(); ctx.restore();
        }
        const winW = 60; const winH = 40; const winX = x - winW/2; const winY = boxY + 80; ctx.fillStyle = '#ECEFF1'; ctx.fillRect(winX, winY, winW, winH); ctx.strokeStyle = '#90A4AE'; ctx.lineWidth = 2; ctx.strokeRect(winX, winY, winW, winH);
        ctx.save(); ctx.beginPath(); ctx.rect(winX, winY, winW, winH); ctx.clip(); ctx.translate(x, winY + winH/2); ctx.rotate(angle * 3); ctx.fillStyle = '#F44336'; ctx.fillRect(-22, -10, 22, 20); ctx.fillStyle = '#E0E0E0'; ctx.fillRect(0, -10, 22, 20); ctx.fillStyle = '#263238'; ctx.beginPath(); ctx.arc(0,0,5,0,Math.PI*2); ctx.fill(); ctx.restore(); ctx.fillStyle = '#FF7043'; ctx.fillRect(winX-4, winY+5, 4, 30); ctx.fillRect(winX+winW, winY+5, 4, 30);

    } else if (type === 'SOLAR_PANEL') {
        const boxW = 50; const boxH = 50; const boxX = x - boxW/2; const boxY = y - boxH;
        const bGrad = ctx.createLinearGradient(boxX, boxY, boxX+boxW, boxY+boxH); bGrad.addColorStop(0, '#B0BEC5'); bGrad.addColorStop(1, '#78909C'); ctx.fillStyle = bGrad; ctx.strokeStyle = '#546E7A'; ctx.lineWidth = 2; 
        drawRoundRect(ctx, boxX, boxY, boxW, boxH, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; ctx.fillRect(boxX + 10, boxY + 10, boxW - 20, boxH - 20); ctx.strokeStyle = '#90A4AE'; ctx.lineWidth = 1; ctx.strokeRect(boxX + 10, boxY + 10, boxW - 20, boxH - 20);
        const stemW = 12; const stemH = 20; ctx.fillStyle = '#78909C'; ctx.fillRect(x - stemW/2, boxY - stemH, stemW, stemH); ctx.strokeStyle = '#546E7A'; ctx.strokeRect(x - stemW/2, boxY - stemH, stemW, stemH);
        const panelW = 140; const panelH = 80; const panelX = x - panelW/2; const panelY = boxY - stemH - 20; 
        ctx.save(); ctx.translate(x, boxY - stemH); ctx.rotate(-0.25); 
        ctx.fillStyle = '#263238'; ctx.beginPath(); 
        drawRoundRect(ctx, -panelW/2, -10, panelW, 15, 2); ctx.fill();
        const pGrad = ctx.createLinearGradient(-panelW/2, 0, panelW/2, 0); pGrad.addColorStop(0, '#01579B'); pGrad.addColorStop(0.5, '#0288D1'); pGrad.addColorStop(1, '#01579B'); ctx.fillStyle = pGrad; ctx.beginPath(); ctx.moveTo(-panelW/2, 0); ctx.lineTo(panelW/2, 0); ctx.lineTo(panelW/2, -panelH); ctx.lineTo(-panelW/2, -panelH); ctx.closePath(); ctx.fillRect(-panelW/2, -panelH, panelW, panelH); ctx.strokeStyle = '#CFD8DC'; ctx.lineWidth = 3; ctx.strokeRect(-panelW/2, -panelH, panelW, panelH); 
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
        for(let i=1; i<6; i++) { const lx = -panelW/2 + (i * (panelW/6)); ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, -panelH); ctx.stroke(); }
        for(let i=1; i<4; i++) { const ly = -panelH + (i * (panelH/4)); ctx.beginPath(); ctx.moveTo(-panelW/2, ly); ctx.lineTo(panelW/2, ly); ctx.stroke(); }
        ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.moveTo(-panelW/2, -panelH); ctx.lineTo(0, -panelH); ctx.lineTo(-panelW/2, 0); ctx.fill();
        ctx.restore();
    }
};

export const drawOutput = (ctx: CanvasRenderingContext2D, type: OutputType, x: number, y: number, speed: number, temp: number, time: number) => {
    if (type === 'BULB') {
        const brightness = Math.min(1, speed / 80);
        const holderY = y - 20; const holderH = 25;
        
        ctx.beginPath(); ctx.moveTo(x-50, holderY+10); ctx.lineTo(x, holderY+10); ctx.lineWidth = 8; ctx.strokeStyle = '#546E7A'; ctx.stroke();
        const hGrad = ctx.createLinearGradient(x-20, 0, x+20, 0); hGrad.addColorStop(0, '#78909C'); hGrad.addColorStop(0.5, '#CFD8DC'); hGrad.addColorStop(1, '#607D8B');
        ctx.fillStyle = hGrad; ctx.beginPath(); ctx.moveTo(x-20, holderY); ctx.lineTo(x-20, holderY+holderH); ctx.bezierCurveTo(x-20, holderY+holderH+10, x+20, holderY+holderH+10, x+20, holderY+holderH); ctx.lineTo(x+20, holderY); ctx.fill(); ctx.stroke();

        const baseY = holderY - 25; const bGrad = ctx.createLinearGradient(x-15, 0, x+15, 0); bGrad.addColorStop(0, '#9E9E9E'); bGrad.addColorStop(0.4, '#F5F5F5'); bGrad.addColorStop(0.7, '#BDBDBD'); bGrad.addColorStop(1, '#757575');
        ctx.fillStyle = bGrad; ctx.fillRect(x-15, baseY, 30, 25);
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x-15, baseY+5); ctx.lineTo(x+15, baseY+8); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x-15, baseY+12); ctx.lineTo(x+15, baseY+15); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x-15, baseY+19); ctx.lineTo(x+15, baseY+22); ctx.stroke();

        const bulbCenterY = baseY - 60; const r = 35;
        ctx.beginPath(); ctx.moveTo(x + 15, baseY); ctx.quadraticCurveTo(x + 20, baseY - 25, x + r * Math.cos(Math.PI / 4), bulbCenterY + r * Math.sin(Math.PI / 4)); ctx.arc(x, bulbCenterY, r, Math.PI / 4, 3 * Math.PI / 4, true); ctx.quadraticCurveTo(x - 20, baseY - 25, x - 15, baseY); ctx.closePath();

        const glassColor = brightness > 0.1 ? `rgba(255, 255, 200, ${0.4 + brightness*0.4})` : 'rgba(255, 255, 255, 0.3)';
        ctx.fillStyle = glassColor; ctx.fill(); ctx.strokeStyle = '#B0BEC5'; ctx.lineWidth = 1; ctx.stroke(); 

        if (brightness > 0.05) {
            const glowRadius = 60 + (brightness * 60);
            const glow = ctx.createRadialGradient(x, bulbCenterY, 40, x, bulbCenterY, glowRadius);
            glow.addColorStop(0, `rgba(255, 235, 59, ${brightness * 0.5})`); glow.addColorStop(1, 'rgba(255, 235, 59, 0)');
            ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, bulbCenterY, glowRadius, 0, Math.PI*2); ctx.fill();
            ctx.save(); ctx.translate(x, bulbCenterY); ctx.strokeStyle = `rgba(255, 215, 0, ${brightness})`; ctx.lineWidth = 2; for(let i=0; i<12; i++) { ctx.rotate(Math.PI/6); ctx.beginPath(); ctx.moveTo(60, 0); ctx.lineTo(80 + (brightness*20), 0); ctx.stroke(); } ctx.restore();
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x-5, baseY); ctx.lineTo(x-5, baseY-35); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x+5, baseY); ctx.lineTo(x+5, baseY-35); ctx.stroke();
        ctx.strokeStyle = brightness > 0.1 ? '#FFFFFF' : '#555'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x-5, baseY-35); ctx.lineTo(x-10, baseY-55); ctx.lineTo(x+10, baseY-55); ctx.lineTo(x+5, baseY-35); ctx.stroke();
        if(brightness > 0.2) { ctx.shadowBlur = 15; ctx.shadowColor = "#FFFF00"; ctx.strokeStyle = "#FFFFE0"; ctx.lineWidth = 3; ctx.stroke(); ctx.shadowBlur = 0; }

    } else if (type === 'FAN') {
        const fanY = y - 70;
        ctx.beginPath(); ctx.moveTo(x-5, y-10); ctx.lineTo(x-5, y-30); ctx.lineWidth = 8; ctx.strokeStyle = '#546E7A'; ctx.stroke();
        ctx.fillStyle = '#37474F'; ctx.beginPath(); ctx.moveTo(x-10, y-30); ctx.lineTo(x, y-30); ctx.lineTo(x, fanY); ctx.lineTo(x-10, fanY); ctx.fill();
        const motorW = 40; const motorH = 30; const motorX = x - 5; const motorY = fanY - motorH/2;
        const motorGrad = ctx.createLinearGradient(motorX, motorY, motorX, motorY + motorH); motorGrad.addColorStop(0, '#CFD8DC'); motorGrad.addColorStop(0.5, '#B0BEC5'); motorGrad.addColorStop(1, '#90A4AE'); 
        ctx.fillStyle = motorGrad; drawRoundRect(ctx, motorX, motorY, motorW, motorH, 5); ctx.fill();
        ctx.strokeStyle = '#78909C'; ctx.lineWidth = 1; ctx.stroke();
        const fanAngle = speed * time * 0.005; 
        ctx.save(); ctx.translate(motorX + motorW, fanY); ctx.rotate(fanAngle);
        for(let i=0; i<4; i++) { ctx.rotate(Math.PI/2); ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(10, -5, 40, -15, 60, -5); ctx.bezierCurveTo(65, 0, 60, 10, 40, 15); ctx.bezierCurveTo(20, 10, 5, 5, 0, 0); const bladeGrad = ctx.createLinearGradient(0, 0, 60, 0); bladeGrad.addColorStop(0, '#ECEFF1'); bladeGrad.addColorStop(1, '#FFFFFF'); ctx.fillStyle = bladeGrad; ctx.fill(); ctx.strokeStyle = '#B0BEC5'; ctx.lineWidth = 1; ctx.stroke(); }
        ctx.fillStyle = '#263238'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(-2, -2, 3, 0, Math.PI*2); ctx.fill(); ctx.restore();

    } else if (type === 'HEATER') {
        const baseX = x - 30; const baseY = y - 20;
        ctx.beginPath(); ctx.moveTo(x-50, y-10); ctx.lineTo(x-30, y-10); ctx.lineWidth = 8; ctx.strokeStyle = '#546E7A'; ctx.stroke();
        ctx.fillStyle = '#90A4AE'; ctx.beginPath(); ctx.ellipse(x, baseY, 35, 10, 0, 0, Math.PI*2); ctx.fill(); 
        ctx.fillStyle = '#78909C'; ctx.fillRect(baseX, baseY, 60, 20); ctx.beginPath(); ctx.ellipse(x, y, 35, 10, 0, 0, Math.PI*2); ctx.fill(); 
        const beakerW = 60; const beakerH = 80; const beakerX = x - beakerW/2; const beakerY = baseY - beakerH + 5; const waterLevel = 60; const waterY = baseY - waterLevel + 5;
        ctx.fillStyle = 'rgba(79, 195, 247, 0.6)'; ctx.fillRect(beakerX + 2, waterY, beakerW - 4, waterLevel - 5);
        ctx.fillStyle = 'rgba(129, 212, 250, 0.8)'; ctx.beginPath(); ctx.ellipse(x, waterY, beakerW/2 - 2, 6, 0, 0, Math.PI*2); ctx.fill();
        if (temp > 80) { const bubbleCount = Math.floor((temp - 80)); ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'; ctx.lineWidth = 1; for(let i=0; i<bubbleCount; i++) { const bx = beakerX + 10 + Math.random() * (beakerW - 20); const by = waterY + 10 + Math.random() * (waterLevel - 20); const r = 2 + Math.random() * 4; ctx.beginPath(); ctx.arc(bx, by - (time%20), r, 0, Math.PI*2); ctx.fill(); ctx.stroke(); } ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; ctx.beginPath(); ctx.arc(x, beakerY - 10 - (time%20), 10, 0, Math.PI*2); ctx.fill(); }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(beakerX, beakerY); ctx.lineTo(beakerX, baseY); ctx.quadraticCurveTo(beakerX, baseY+5, beakerX+10, baseY+5); ctx.lineTo(beakerX+beakerW-10, baseY+5); ctx.quadraticCurveTo(beakerX+beakerW, baseY+5, beakerX+beakerW, baseY); ctx.lineTo(beakerX+beakerW, beakerY); ctx.stroke();
        const thermX = x + 40; const thermY = beakerY + 10; const thermH = 80; const thermW = 8;
        ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#9E9E9E'; ctx.lineWidth = 1; drawRoundRect(ctx, thermX - thermW/2, thermY, thermW, thermH, 4); ctx.fill(); ctx.stroke();
        const liquidH = 10 + ((temp - 20) / 80) * (thermH - 20); ctx.fillStyle = '#D32F2F'; ctx.beginPath(); ctx.arc(thermX, thermY + thermH, 8, 0, Math.PI*2); ctx.fill(); ctx.stroke(); ctx.fillRect(thermX - 2, thermY + thermH - liquidH, 4, liquidH);
        ctx.fillStyle = '#000'; for(let i=0; i<5; i++) { const tickY = thermY + 10 + (i * 12); ctx.fillRect(thermX + 2, tickY, 4, 1); }
        ctx.fillStyle = '#37474F'; ctx.font = 'bold 10px Arial'; ctx.fillText(`${Math.round(temp)}°C`, thermX + 12, thermY + thermH);
    }
};
