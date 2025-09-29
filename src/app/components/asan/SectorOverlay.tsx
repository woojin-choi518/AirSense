'use client';

import { useEffect } from 'react';

export interface SectorOverlayProps {
  map: google.maps.Map;
  center: google.maps.LatLngLiteral;
  radius: number;        // in meters
  startAngle: number;    // degrees
  endAngle: number;      // degrees
  color: string;         // hex, e.g. "#FFA500"
}

function hexToRgb(hex: string) {
  const clean = hex.replace(/^#/, '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

export default function SectorOverlay({
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

      onAdd() {
        const panes = this.getPanes()!;
        panes.overlayLayer.appendChild(this.canvas);
      }

      draw() {
        const proj = this.getProjection();
        if (!proj) return;

        const centerLatLng = new google.maps.LatLng(center);
        const centerPx = proj.fromLatLngToDivPixel(centerLatLng);

        const eastLatLng = google.maps.geometry.spherical.computeOffset(
          centerLatLng,
          radius,
          90
        );
        const eastPx = proj.fromLatLngToDivPixel(eastLatLng);
        if (!eastPx || !centerPx) {
          // Fallback to 0 if projection failed
          this.canvas.width = 0;
          this.canvas.height = 0;
          return;
        }
        const pxRadius = Math.hypot(
          eastPx.x - centerPx.x,
          eastPx.y - centerPx.y
        );

        const diam = pxRadius * 2;
        this.canvas.width = diam;
        this.canvas.height = diam;
        this.canvas.style.position = 'absolute';
        if (centerPx) {
          this.canvas.style.left = `${centerPx.x - pxRadius}px`;
          this.canvas.style.top = `${centerPx.y - pxRadius}px`;
        } else {
          this.canvas.style.left = '0px';
          this.canvas.style.top = '0px';
        }

        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, diam, diam);

        const { r, g, b } = hexToRgb(color);
        const grad = ctx.createRadialGradient(
          pxRadius, pxRadius, 0,
          pxRadius, pxRadius, pxRadius
        );
        grad.addColorStop(0, `rgba(${r},${g},${b},0.4)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(pxRadius, pxRadius);

        // Google Maps (0° 북쪽, 시계방향) → Canvas (0° 오른쪽, 반시계방향) 변환
        const startRad = ((startAngle - 90) * Math.PI) / 180;
        const endRad = ((endAngle - 90) * Math.PI) / 180;

        // startAngle과 endAngle이 올바른 순서로 그리기
        const sweepAngle = (endRad - startRad + 2 * Math.PI) % (2 * Math.PI);
        if (sweepAngle > Math.PI) {
          ctx.arc(pxRadius, pxRadius, pxRadius, endRad, startRad, true); // 반시계방향
        } else {
          ctx.arc(pxRadius, pxRadius, pxRadius, startRad, endRad, false); // 시계방향
        }
        ctx.closePath();
        ctx.fill();
      }

      onRemove() {
        this.canvas.parentNode?.removeChild(this.canvas);
      }
    }

    const overlay = new SectorView();
    overlay.setMap(map);

    return () => {
      overlay.setMap(null);
    };
  }, [map, center.lat, center.lng, radius, startAngle, endAngle, color]);

  return null;
}