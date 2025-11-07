"use client";
import { useEffect, useRef, useState, useMemo } from "react";

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawHouse(ctx, cx, cy, scale) {
  const w = 280 * scale; const h = 180 * scale;
  const roofH = 80 * scale;
  // Body
  ctx.fillStyle = "#ffe2cf";
  drawRoundedRect(ctx, cx - w/2, cy - h/2, w, h, 16 * scale);
  ctx.fill();
  // Roof
  ctx.beginPath();
  ctx.moveTo(cx - w/2 - 10*scale, cy - h/2);
  ctx.lineTo(cx, cy - h/2 - roofH);
  ctx.lineTo(cx + w/2 + 10*scale, cy - h/2);
  ctx.closePath();
  ctx.fillStyle = "#ffb38a";
  ctx.fill();
  // Door
  ctx.fillStyle = "#d07b50";
  drawRoundedRect(ctx, cx - 22*scale, cy + h/2 - 70*scale, 44*scale, 70*scale, 8*scale);
  ctx.fill();
  // Window
  ctx.fillStyle = "#ffffff";
  drawRoundedRect(ctx, cx + w/4 - 30*scale, cy - 20*scale, 60*scale, 50*scale, 8*scale);
  ctx.fill();
}

function drawStove(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#e9eef2";
  ctx.fillRect(-60, -40, 120, 80);
  ctx.fillStyle = "#cfd8df";
  ctx.fillRect(-60, 5, 120, 35);
  ctx.fillStyle = "#6b7c8a";
  for (let i=0;i<4;i++) { ctx.beginPath(); ctx.arc(-40 + i*27, -15, 9, 0, Math.PI*2); ctx.fill(); }
  // gentle flame
  ctx.fillStyle = "rgba(255,140,66,0.7)";
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.quadraticCurveTo(8, -36, 0, -44);
  ctx.quadraticCurveTo(-8, -36, 0, -18);
  ctx.fill();
  ctx.restore();
}

function drawDevice(ctx, x, y, scale, pulse) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#ff8a5b";
  ctx.beginPath();
  ctx.roundRect(-35, -50, 70, 100, 14);
  ctx.fill();
  // indicator
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-18, -10, 36, 20);
  ctx.fillStyle = pulse ? "#2ecc71" : "#f1c40f";
  ctx.beginPath(); ctx.arc(0, 15, 6, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawWhatsAppIcon(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "#25D366";
  ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(-5, -4); ctx.quadraticCurveTo(-2, -6, 1, -3);
  ctx.quadraticCurveTo(3, -1, 0, 1);
  ctx.quadraticCurveTo(-3, 4, -5, 2);
  ctx.lineTo(-8, 6); ctx.quadraticCurveTo(-7, 2, -5, -4);
  ctx.fill();
  ctx.restore();
}

function easeInOut(t){ return t<0.5 ? 2*t*t : -1+(4-2*t)*t; }

export default function Page() {
  const canvasRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [progress, setProgress] = useState(0);

  const durationMs = 15000;
  const fps = 30;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = 1080; const height = 1920; // 9:16 vertical
    canvas.width = width * dpr; canvas.height = height * dpr;
    canvas.style.width = width + "px"; canvas.style.height = height + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    let rafId; let start;

    function draw(ms){
      const t = start==null ? 0 : Math.min(1, (ms - start) / durationMs);
      setProgress(t);

      // Background gradient
      const g = ctx.createLinearGradient(0,0,0,height);
      g.addColorStop(0, "#fff3ea");
      g.addColorStop(1, "#ffdcc6");
      ctx.fillStyle = g; ctx.fillRect(0,0,width,height);

      // Floating circles for warmth
      for (let i=0;i<10;i++){
        const p = (t*2 + i*0.1)%1; const y = p * height; const x = (i%2?0.3:0.7) * width + Math.sin(p*6+i)*40;
        ctx.fillStyle = `rgba(255, 138, 91, ${0.08 + 0.05*Math.sin(i+p*6)})`;
        ctx.beginPath(); ctx.arc(x, y, 80 + (i%3)*20, 0, Math.PI*2); ctx.fill();
      }

      // Scene timing
      const s1 = 0.0, e1 = 0.2; // 0-3s Intro
      const s2 = 0.2, e2 = 0.6; // 3-9s Install demo
      const s3 = 0.6, e3 = 0.8; // 9-12s Value
      const s4 = 0.8, e4 = 1.0; // 12-15s CTA

      ctx.textAlign = "center";
      ctx.fillStyle = "#2b2b2b";

      // Intro
      if (t>=s1 && t<e1){
        const lt = (t - s1)/(e1 - s1);
        const a = easeInOut(Math.min(1, lt*1.3));
        ctx.save();
        ctx.globalAlpha = a;
        ctx.font = "700 72px ui-sans-serif";
        ctx.fillText("Gas Safety Device", width/2, 360);
        ctx.font = "500 40px ui-sans-serif";
        ctx.fillText("Prevent gas leaks & accidents at home", width/2, 430);
        ctx.restore();
      }

      // Install demo
      if (t>=s2 && t<e2){
        const lt = (t - s2)/(e2 - s2);
        const a = easeInOut(lt);
        const cy = 980; // center Y
        drawHouse(ctx, width/2, cy, 1.0);
        drawStove(ctx, width/2 - 120, cy + 120, 1.2);
        const attachX = width/2 + 130 * a;
        const attachY = cy + 60 - 40 * (1 - a);
        drawDevice(ctx, attachX, attachY, 1.0, Math.sin(lt*10) > 0);
        // Cable
        ctx.strokeStyle = "#ff8a5b"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(width/2 - 60, cy + 130); ctx.bezierCurveTo(width/2, cy + 100, attachX-40, attachY+40, attachX, attachY); ctx.stroke();

        // Caption
        ctx.save(); ctx.globalAlpha = 0.9; ctx.font = "700 56px ui-sans-serif"; ctx.fillText("Safe, Reliable, Easy Installation", width/2, 220); ctx.restore();
      }

      // Value props
      if (t>=s3 && t<e3){
        const lt = (t - s3)/(e3 - s3);
        const a = easeInOut(lt);
        ctx.save(); ctx.globalAlpha = a;
        ctx.font = "800 68px ui-sans-serif"; ctx.fillText("Safe ? Reliable ? Easy", width/2, 520);
        ctx.font = "500 40px ui-sans-serif"; ctx.fillText("Instant alerts. Peace of mind.", width/2, 590);
        ctx.restore();
      }

      // CTA
      if (t>=s4){
        const lt = (t - s4)/(e4 - s4);
        const a = easeInOut(Math.min(1, lt*1.2));
        // Card
        const cardW = width - 160; const cardH = 300; const cardX = 80; const cardY = 740;
        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = "#ffffff";
        drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 24);
        ctx.fill();
        ctx.strokeStyle = "#ffd1bd"; ctx.lineWidth = 2; ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = a;
        ctx.font = "700 60px ui-sans-serif"; ctx.fillStyle = "#2b2b2b";
        ctx.fillText("Cash on Delivery Available", width/2, cardY + 120);
        ctx.font = "700 48px ui-sans-serif";
        ctx.fillText("Order now via WhatsApp", width/2, cardY + 190);
        drawWhatsAppIcon(ctx, width/2 - 210, cardY + 185, 1.4);
        ctx.restore();
      }

      // Footer watermark
      ctx.textAlign = "center"; ctx.fillStyle = "#6b6b6b";
      ctx.font = "400 26px ui-sans-serif";
      ctx.fillText("15s promo ? Gas Safety Device", width/2, height - 36);

      rafId = requestAnimationFrame(draw);
    }

    const startAnim = (ms) => { start = ms; rafId = requestAnimationFrame(draw); };
    rafId = requestAnimationFrame(startAnim);

    return () => cancelAnimationFrame(rafId);
  }, []);

  const startRecording = async () => {
    if (isRecording) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const stream = canvas.captureStream(fps);
    const chunks = [];
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9" : "video/webm";
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 5_000_000 });

    rec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: mime });
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      setIsRecording(false);
    };

    setBlobUrl(null);
    setIsRecording(true);
    rec.start();
    setTimeout(() => rec.stop(), durationMs + 120); // small guard
  };

  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ margin: 8, color: "#2b2b2b" }}>Gas Safety Device ? 15s Video Generator</h1>
      <p style={{ marginTop: 0, color: "#5a5a5a" }}>Warm, reassuring visuals with clear text. Vertical 1080x1920.</p>

      <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", border: "1px solid #ffd1bd" }}>
        <canvas ref={canvasRef} style={{ display: "block", background: "#fff" }} />
        <div style={{ position: "absolute", top: 12, right: 12, background: "#ffffffcc", padding: "6px 10px", borderRadius: 12, fontSize: 12 }}>
          {Math.round(progress * 15)}s / 15s
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={startRecording} disabled={isRecording} style={{ background: "#ff8a5b", color: "white", border: 0, padding: "12px 18px", borderRadius: 12, fontWeight: 700, cursor: isRecording?"not-allowed":"pointer" }}>
          {isRecording ? "Recording..." : "Render 15s Video"}
        </button>
        {blobUrl && (
          <>
            <a href={blobUrl} download="gas-safety-15s.webm" style={{ background: "#2b2b2b", color: "white", textDecoration: "none", padding: "12px 18px", borderRadius: 12, fontWeight: 700 }}>Download WebM</a>
            <video src={blobUrl} controls style={{ height: 120, borderRadius: 12, border: "1px solid #ddd" }} />
          </>
        )}
      </div>

      <ul style={{ color: "#6b6b6b", fontSize: 14 }}>
        <li>Key message: <b>Safe, Reliable, Easy Installation</b></li>
        <li>Offer: <b>Cash on Delivery Available</b></li>
        <li>CTA: <b>Order now via WhatsApp</b></li>
      </ul>
    </main>
  );
}
