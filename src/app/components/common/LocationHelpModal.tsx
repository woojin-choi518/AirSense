'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface LocationHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LocationHelpModal: React.FC<LocationHelpModalProps> = ({ isOpen, onClose }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = document.createElement('div');
    containerRef.current = el;
    document.body.appendChild(el);
    return () => {
      if (el.parentNode) el.parentNode.removeChild(el);
      containerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !containerRef.current) return null;

  return createPortal(
    <div aria-modal="true" role="dialog" className="fixed inset-0 z-[9999] select-none">
      {/* ✅ 수정: 한 줄 className */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute inset-0 w-full h-full cursor-pointer bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),rgba(0,0,0,0.6))] backdrop-blur-xl transition-opacity duration-300 ease-out opacity-100"
      />

      <div className="pointer-events-none absolute inset-0 flex items-end justify-center p-4 sm:items-center">
        <div
          className="pointer-events-auto w-full sm:max-w-lg sm:w-[90vw] rounded-2xl border border-white/20 bg-white/10 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl text-white outline-none transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transformOrigin: 'center' }}
        >
          <div className="absolute inset-0 rounded-2xl pointer-events-none">
            <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-cyan-300/60 via-indigo-300/40 to-purple-300/30" />
          </div>

          {/* 헤더 */}
          <div className="relative p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white">
                위치 권한 설정 도움말
              </h2>
              <button
                onClick={onClose}
                className="group inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-2.5 py-2 text-white/90 hover:bg-white/15 hover:text-white active:scale-95 transition cursor-pointer"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* 본문 */}
          <div className="relative px-5 pb-5 sm:px-6 sm:pb-6 max-h-[78vh] overflow-y-auto">
            <div className="space-y-5 text-sm leading-6 text-white/90">
              <section>
                <h3 className="mb-2 font-semibold text-white/95">📱 모바일 브라우저 설정</h3>
                <div className="space-y-3">
                  <div>
                    <strong>Chrome:</strong>
                    <ol className="mt-1 ml-4 list-decimal space-y-1">
                      <li>주소창 옆 자물쇠 아이콘 클릭</li>
                      <li>“위치” 권한을 “허용”으로 변경</li>
                      <li>페이지 새로고침 후 다시 시도</li>
                    </ol>
                  </div>
                  <div>
                    <strong>Safari:</strong>
                    <ol className="mt-1 ml-4 list-decimal space-y-1">
                      <li>설정 → Safari → 위치 서비스</li>
                      <li>“위치 서비스” 활성화</li>
                      <li>Safari에서 “허용” 선택</li>
                    </ol>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-2 font-semibold text-white/95">🔒 HTTPS 연결 필요</h3>
                <p>모바일에서는 보안상 HTTPS 연결이 필요합니다. HTTP 사이트에서는 위치 서비스를 사용할 수 없습니다.</p>
              </section>

              <section>
                <h3 className="mb-2 font-semibold text-white/95">📍 GPS 설정 확인</h3>
                <p>기기의 위치 서비스(GPS)가 켜져 있는지 확인해주세요.</p>
              </section>

              <section className="rounded-xl border border-cyan-200/20 bg-cyan-300/10 p-3">
                <div className="flex items-start gap-2.5">
                  <svg className="mt-0.5 h-5 w-5 text-cyan-200" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    />
                  </svg>
                  <p>
                    <strong>팁:</strong> 권한 허용 후에도 문제가 지속되면 브라우저를 완전히 종료하고 다시 실행하세요.
                  </p>
                </div>
              </section>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="cursor-pointer inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-white hover:bg-white/15 active:scale-95 transition"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      </div>

       {/* 모바일 bottom-sheet 애니메이션 */}
       <style dangerouslySetInnerHTML={{
         __html: `
           @media (max-width: 639px) {
             [role='dialog'] > div > div {
               transform: translateY(8px) scale(0.99);
               opacity: 0;
               animation: sheetIn 260ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
             }
             @keyframes sheetIn {
               to {
                 transform: translateY(0) scale(1);
                 opacity: 1;
               }
             }
           }
         `
       }} />
    </div>,
    containerRef.current
  );
};

export default LocationHelpModal;
