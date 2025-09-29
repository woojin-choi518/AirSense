// CircleOverlay.tsx
'use client';
import { useEffect } from 'react';

// NOTE: google.maps가 전역으로 선언되어 있다는 가정 하에 작성됩니다.
// 만약 map prop의 타입이 정확하지 않다면, 구글 맵스 라이브러리의 타입 정의를 확인하세요.
declare const google: any; 

export interface CircleOverlayProps {
  map: google.maps.Map;
  center: google.maps.LatLngLiteral;
  radius: number;     // meters
  color: string;      // hex
}

function hexToRgb(hex: string) {
  const c = hex.replace(/^#/, '');
  // Number.parseInt를 사용하면 radix 16을 명시하는 것이 명확합니다.
  const i = Number.parseInt(c, 16); 
  return { r: (i >> 16) & 255, g: (i >> 8) & 255, b: i & 255 };
}

export default function CircleOverlay({
  map, center, radius, color
}: CircleOverlayProps){
  useEffect(()=>{
    if(!map) return;
    
    // google.maps.OverlayView는 클래스이므로, useEffect 내부에서 정의합니다.
    class CircleView extends google.maps.OverlayView {
      canvas = document.createElement('canvas');
      
      constructor(){ super(); this.canvas.style.pointerEvents='none'; }
      
      onAdd(){
        // ! 대신 조건부 체이닝을 사용하는 것이 더 안전합니다.
        this.getPanes()?.overlayLayer.appendChild(this.canvas);
      }
      
      draw(){
        const proj = this.getProjection(); if(!proj) return;
        const latlng = new google.maps.LatLng(center);
        const pxCenter = proj.fromLatLngToDivPixel(latlng);
        
        // **[수정 시작] computeOffset의 반환 값에 대한 안정성 확보**
        
        // 1. computeOffset의 결과를 변수에 저장
        const edgeLatLng = google.maps.geometry.spherical.computeOffset(
          latlng, radius, 90
        );

        // 2. edgeLatLng이 null 또는 undefined가 아닌지 확인 (타입 에러 해결 핵심)
        if (!edgeLatLng) return; 

        // 3. 안전한 값을 사용하여 pxEdge 계산
        const pxEdge  = proj.fromLatLngToDivPixel(edgeLatLng);
        
        // 4. (추가 안정성) fromLatLngToDivPixel도 null을 반환할 수 있으므로 체크
        if (!pxCenter || !pxEdge) return;
        
        // **[수정 종료]**
        
        // pxEdge와 pxCenter가 이제 null이 아님을 TypeScript가 인식합니다.
        const rpx = Math.hypot(pxEdge.x - pxCenter.x, pxEdge.y - pxCenter.y);
        const d = rpx * 2;
        
        this.canvas.width = d; this.canvas.height = d;
        this.canvas.style.position='absolute';
        this.canvas.style.left=`${pxCenter.x - rpx}px`;
        this.canvas.style.top =`${pxCenter.y - rpx}px`;

        const ctx = this.canvas.getContext('2d');
        if (!ctx) return; // context null 체크

        ctx.clearRect(0, 0, d, d);
        const {r, g, b} = hexToRgb(color);
        const grad = ctx.createRadialGradient(rpx, rpx, 0, rpx, rpx, rpx);
        
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.4)`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(rpx, rpx, rpx, 0, 2 * Math.PI); ctx.fill();
      }
      
      onRemove(){
        this.canvas.parentNode?.removeChild(this.canvas);
      }
    }
    
    const ov = new CircleView();
    ov.setMap(map);
    
    // 컴포넌트 정리(cleanup) 함수: 오버레이 제거
    return ()=>ov.setMap(null);
  },[map, center.lat, center.lng, radius, color]); // 의존성 배열에 center.lat/lng을 명시
  
  return null;
}