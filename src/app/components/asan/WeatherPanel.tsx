'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

interface WeatherPanelProps {
  onForecastSelect?: (hourData: any) => void;
  selIndex: number;
  onSelIndexChange: (i: number) => void;
  scWindSpeed: number;
  scHumidity: number;
}

const WeatherPanel: React.FC<WeatherPanelProps> = ({
  onForecastSelect,
  scWindSpeed,
  scHumidity,
  selIndex,
  onSelIndexChange,
}) => {
  const [current, setCurrent] = useState<any>(null);
  const [forecastList, setForecastList] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const guidance = useMemo(() => {
    if (scWindSpeed <= 1.0) return '바람이 약해 악취가 넓게 퍼질 수 있습니다.';
    if (scWindSpeed >= 2.0) return '바람이 강해 악취가 빠르게 분산됩니다.';
    if (scHumidity >= 70) return '습도가 높아 악취가 오래 머물 수 있습니다.';
    if (scHumidity <= 30) return '습도가 낮아 악취 확산이 제한될 수 있습니다.';
    return '현재 조건에서 악취 확산은 보통 수준입니다.';
  }, [scWindSpeed, scHumidity]);

  // 예보 데이터 1회 로드
  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const key = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY!;
        const lat = 36.7998, lon = 127.1375;
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;
        const res = await axios.get(url);
        setForecastList(res.data.list);
      } catch (e: any) {
        console.error('fetchForecast error', e);
      }
    };
    fetchForecast();
  }, []);

  // 실시간 모드: selIndex===0일 때만 current 갱신
  useEffect(() => {
    let iv: NodeJS.Timeout;
    const fetchCurrent = async () => {
      try {
        setLoading(true);
        const key = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY!;
        const lat = 36.7998, lon = 127.1375;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;
        const res = await axios.get(url);
        setCurrent(res.data);
        setLastUpdated(
          new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
        );
        setError(null);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (selIndex === 0) {
      fetchCurrent();
      iv = setInterval(fetchCurrent, 300_000);
    }
    return () => iv && clearInterval(iv);
  }, [selIndex]);

  // 예보 모드: selIndex>0 시 부모 전달
  useEffect(() => {
    if (selIndex > 0 && forecastList[selIndex]) {
      onForecastSelect?.(forecastList[selIndex]);
    }
  }, [selIndex, forecastList, onForecastSelect]);

  if (loading) return <div className="text-white text-xs">Loading…</div>;
  if (error) return <div className="text-white text-xs">Error: {error}</div>;

  const selFc = forecastList[selIndex];
  const T = current?.main?.temp;
  const H = current?.main?.humidity;
  const Wsp = current?.wind?.speed;
  const Wdir = current?.wind?.deg;
  const rain = current?.rain?.['1h'] ?? 0;

  // 3시간 단위 5일치 tick
  const tickStep = 8;
  const tickIndices = Array.from(
    { length: Math.ceil(forecastList.length / tickStep) },
    (_, i) => i * tickStep
  ).slice(0, 5);
  const tickLabels = tickIndices.map(i =>
    new Date(forecastList[i]?.dt * 1000).toLocaleDateString('ko-KR', {
      weekday: 'short',
    })
  );

  return (
    <div className="fixed top-[70px] right-4 z-40">
      <div
        onClick={() => setIsOpen(o => !o)}
        className="bg-gradient-to-r from-teal-800/20 to-blue-500/20 backdrop-blur-md border-2 border-teal-300 rounded-full px-5 py-2 flex items-center justify-between cursor-pointer select-none shadow-md transition"
      >
        <span className="text-white font-bold">날씨 정보</span>
        <span className="text-white text-lg">{isOpen ? '▾' : '▸'}</span>
      </div>

      {isOpen && (
        <div className="mt-2 bg-gradient-to-br from-teal-800/20 to-blue-500/20 backdrop-blur-md border-2 border-teal-300 rounded-2xl shadow-lg p-4 w-[200px] max-h-[80vh] overflow-y-auto transition-all">
          {/* 슬라이더 */}
          {forecastList.length > 0 && (
            <>
              <input
                type="range"
                min={0}
                max={forecastList.length - 1}
                step={1}
                value={selIndex}
                onChange={e => onSelIndexChange(+e.target.value)}
                className="w-full accent-teal-400"
              />
              <div className="mt-2 grid grid-cols-5 text-white text-xs text-center">
                {tickLabels.map((label, idx) => (
                  <span key={idx}>{label}</span>
                ))}
              </div>
              <div className="text-white text-sm text-center mt-1">
                {selIndex === 0
                  ? '실시간'
                  : `${selIndex * 3}시간 후 (${tickLabels[Math.floor(
                      selIndex / tickStep
                    )]})`}
              </div>
            </>
          )}

          {/* 데이터 블록 */}
          {selIndex === 0 ? (
            <>
              <div className="text-center text-white text-xs mb-2">
                마지막 업데이트: {lastUpdated}
              </div>
              <div className="space-y-2 mb-4">
                <div className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 p-2 rounded-full text-white text-sm text-center">
                  온도: {T}°C      
                </div>
                <div className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 p-2 rounded-full text-white text-sm text-center">
                  습도: {H}%
                </div>
                <div className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 p-2 rounded-full text-white text-sm flex items-center justify-center">
                  풍향:
                  <svg className="w-4 h-4 mx-1" style={{ transform: `rotate(${Wdir}deg)` }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l8 10h-6v8h-4v-8H4l8-10z" />
                  </svg>
                  ({Wdir}°)
                </div>
                <div className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 p-2 rounded-full text-white text-sm text-center">
                  풍속: {Wsp} m/s
                </div>
                <div className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 p-2 rounded-full text-white text-sm text-center">
                  강수량: {rain} mm
                </div>
              </div>
            </>
          ) : (
            selFc && (
              <div className="space-y-2 mb-4">
                <div className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 p-2 rounded-full text-white text-sm text-center">
                  {new Date(selFc.dt * 1000).toLocaleString('ko-KR')}
                </div>
                <div className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 p-2 rounded-full text-white text-sm text-center">
                  온도: {selFc.main.temp}°C
                </div>
                <div className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 p-2 rounded-full text-white text-sm text-center">
                  습도: {selFc.main.humidity}%
                </div>
                <div className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 p-2 rounded-full text-white text-sm flex items-center justify-center">
                  풍향:
                  <svg className="w-4 h-4 mx-1" style={{ transform: `rotate(${selFc.wind.deg}deg)` }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l8 10h-6v8h-4v-8H4l8-10z" />
                  </svg>
                  ({selFc.wind.deg}°)
                </div>
                <div className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 p-2 rounded-full text-white text-sm text-center">
                  풍속: {selFc.wind.speed} m/s
                </div>
              </div>
            )
          )}

          {/* 안내 문구 */}
          <div className="text-red-400 text-center text-sm font-bold p-2 border-2 border-red-400 rounded-lg">
            {guidance}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherPanel;
