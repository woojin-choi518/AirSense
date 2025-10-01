'use client';

import React, { useEffect } from 'react';

export interface SectorOverlayProps {
  map: google.maps.Map;
  center: google.maps.LatLngLiteral;
  radius: number;        // meters
  startAngle: number;    // degrees
  endAngle: number;      // degrees
  color: string;         // hex
}

function hexToRgb(hex: string) {
  const clean = hex.replace(/^#/, '');
  const bigint = parseInt(clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function SectorOverlay({
  map,
  center,
  radius,
  startAngle,
  endAngle,
  color,
}: SectorOverlayProps) {
  useEffect(() => {
    if (!map) return;

    class SectorView extends google.maps.OverlayView {
      canvas: HTMLCanvasElement;
      constructor() {
        super();
        this.canvas = document.createElement('canvas');
        this.canvas.style.pointerEvents = 'none';
      }
      onAdd() { this.getPanes()?.overlayLayer.appendChild(this.canvas); }
      draw() {
        const proj = this.getProjection(); if (!proj) return;

        const centerLatLng = new google.maps.LatLng(center);
        const centerPx = proj.fromLatLngToDivPixel(centerLatLng);
        const eastLatLng = google.maps.geometry.spherical.computeOffset(centerLatLng, radius, 90);
        if (!centerPx || !eastLatLng) { this.canvas.width = 0; this.canvas.height = 0; return; }
        const eastPx = proj.fromLatLngToDivPixel(eastLatLng);
        if (!eastPx) { this.canvas.width = 0; this.canvas.height = 0; return; }

        const pxRadius = Math.hypot(eastPx.x - centerPx.x, eastPx.y - centerPx.y);
        const diam = pxRadius * 2;

        this.canvas.width = diam; this.canvas.height = diam;
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = `${centerPx.x - pxRadius}px`;
        this.canvas.style.top  = `${centerPx.y - pxRadius}px`;

        const ctx = this.canvas.getContext('2d'); if (!ctx) return;
        ctx.clearRect(0, 0, diam, diam);

        const { r, g, b } = hexToRgb(color);
        const grad = ctx.createRadialGradient(pxRadius, pxRadius, 0, pxRadius, pxRadius, pxRadius);
        grad.addColorStop(0, `rgba(${r},${g},${b},0.4)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(pxRadius, pxRadius);

        // Maps(0°=북/시계) → Canvas(0°=오른쪽/반시계)
        const startRad = ((startAngle - 90) * Math.PI) / 180;
        const endRad   = ((endAngle   - 90) * Math.PI) / 180;

        const sweep = (endRad - startRad + 2 * Math.PI) % (2 * Math.PI);
        if (sweep > Math.PI) ctx.arc(pxRadius, pxRadius, pxRadius, endRad, startRad, true);
        else                 ctx.arc(pxRadius, pxRadius, pxRadius, startRad, endRad, false);

        ctx.closePath();
        ctx.fill();
      }
      onRemove() { this.canvas.parentNode?.removeChild(this.canvas); }
    }

    const overlay = new SectorView();
    overlay.setMap(map);
    return () => overlay.setMap(null);
  }, [map, center.lat, center.lng, radius, startAngle, endAngle, color]);

  return null;
}

export default React.memo(SectorOverlay, (p, n) =>
  p.map === n.map &&
  p.color === n.color &&
  p.radius === n.radius &&
  p.startAngle === n.startAngle &&
  p.endAngle === n.endAngle &&
  p.center.lat === n.center.lat &&
  p.center.lng === n.center.lng
);
