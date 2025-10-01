'use client';
import React, { useEffect } from 'react';

export interface OdorOverlayProps {
  map: google.maps.Map;
  center: google.maps.LatLngLiteral;
  radius: number;          // meters (기준 반경)
  startAngle: number;      // degrees (Maps 기준: 0=북, 시계방향)
  endAngle: number;        // degrees
  color: string;           // hex
  showCircle?: boolean;    // 기본 true
  showSector?: boolean;    // 기본 true
  circleScale?: number;    // 기본 0.6 (기존과 동일)
  sectorScale?: number;    // 기본 0.8 (기존과 동일)
  circleAlpha?: number;    // 기본 0.35
  sectorAlpha?: number;    // 기본 0.4
}

function hexToRgb(hex: string) {
  const clean = hex.replace(/^#/, '');
  const n = parseInt(clean, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function OdorOverlay({
  map,
  center,
  radius,
  startAngle,
  endAngle,
  color,
  showCircle = true,
  showSector = true,
  circleScale = 0.6,
  sectorScale = 0.8,
  circleAlpha = 0.35,
  sectorAlpha = 0.4,
}: OdorOverlayProps) {
  useEffect(() => {
    if (!map) return;

    class OdorView extends google.maps.OverlayView {
      canvas: HTMLCanvasElement;
      constructor() {
        super();
        this.canvas = document.createElement('canvas');
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.position = 'absolute';
      }
      onAdd() {
        this.getPanes()?.overlayLayer.appendChild(this.canvas);
      }
      draw() {
        const proj = this.getProjection(); if (!proj) return;

        const centerLL = new google.maps.LatLng(center);
        const centerPx = proj.fromLatLngToDivPixel(centerLL);
        if (!centerPx) { this.canvas.width = 0; this.canvas.height = 0; return; }

        // 기준 반경을 px로 변환 (동쪽 방향으로 radius만큼 오프셋)
        const edgeLL = google.maps.geometry.spherical.computeOffset(centerLL, radius, 90);
        if (!edgeLL) { this.canvas.width = 0; this.canvas.height = 0; return; }
        const edgePx = proj.fromLatLngToDivPixel(edgeLL);
        if (!edgePx) { this.canvas.width = 0; this.canvas.height = 0; return; }

        const basePxR = Math.hypot(edgePx.x - centerPx.x, edgePx.y - centerPx.y);
        const rCircle = showCircle ? basePxR * circleScale : 0;
        const rSector = showSector ? basePxR * sectorScale : 0;
        const maxR = Math.max(rCircle, rSector);

        const diam = Math.ceil(maxR * 2);
        this.canvas.width = diam;
        this.canvas.height = diam;
        this.canvas.style.left = `${centerPx.x - maxR}px`;
        this.canvas.style.top  = `${centerPx.y - maxR}px`;

        const ctx = this.canvas.getContext('2d'); if (!ctx) return;
        ctx.clearRect(0, 0, diam, diam);

        const { r, g, b } = hexToRgb(color);

        // 1) 원형 범위 (부드러운 반경 감쇠)
        if (showCircle && rCircle > 0) {
          const gradC = ctx.createRadialGradient(maxR, maxR, 0, maxR, maxR, rCircle);
          gradC.addColorStop(0, `rgba(${r},${g},${b},${circleAlpha})`);
          gradC.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = gradC;
          ctx.beginPath();
          ctx.arc(maxR, maxR, rCircle, 0, 2 * Math.PI);
          ctx.fill();
        }

        // 2) 방향성 부채꼴 (부드러운 경계)
        if (showSector && rSector > 0) {
          // Maps(0°=북/시계) → Canvas(0°=오른쪽/반시계)
          const sRad = ((startAngle - 90) * Math.PI) / 180;
          const eRad = ((endAngle   - 90) * Math.PI) / 180;

          // 부채꼴 바깥방향으로 그라디언트
          const gradS = ctx.createRadialGradient(maxR, maxR, 0, maxR, maxR, rSector);
          gradS.addColorStop(0, `rgba(${r},${g},${b},${sectorAlpha})`);
          gradS.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = gradS;
          ctx.beginPath();
          ctx.moveTo(maxR, maxR);

          const sweep = (eRad - sRad + 2 * Math.PI) % (2 * Math.PI);
          if (sweep > Math.PI) ctx.arc(maxR, maxR, rSector, eRad, sRad, true);
          else                 ctx.arc(maxR, maxR, rSector, sRad, eRad, false);

          ctx.closePath();
          ctx.fill();
        }
      }
      onRemove() {
        this.canvas.parentNode?.removeChild(this.canvas);
      }
    }

    const ov = new OdorView();
    ov.setMap(map);
    return () => ov.setMap(null);
  }, [map, center.lat, center.lng, radius, startAngle, endAngle, color, showCircle, showSector, circleScale, sectorScale, circleAlpha, sectorAlpha]);

  return null;
}

export default React.memo(OdorOverlay, (p, n) =>
  p.map === n.map &&
  p.color === n.color &&
  p.radius === n.radius &&
  p.startAngle === n.startAngle &&
  p.endAngle === n.endAngle &&
  p.showCircle === n.showCircle &&
  p.showSector === n.showSector &&
  p.circleScale === n.circleScale &&
  p.sectorScale === n.sectorScale &&
  p.circleAlpha === n.circleAlpha &&
  p.sectorAlpha === n.sectorAlpha &&
  p.center.lat === n.center.lat &&
  p.center.lng === n.center.lng
);
