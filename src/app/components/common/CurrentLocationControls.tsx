'use client';

import React, { useState, useCallback } from 'react';
import LocationButton from './LocationButton';
import GoToLocationButton from './GoToLocationButton';
import LocationErrorAlert from './LocationErrorAlert';
import LocationHelpModal from './LocationHelpModal';

interface CurrentLocationControlsProps {
  onLocationUpdate: (location: { lat: number; lng: number }) => void;
  currentLocation: { lat: number; lng: number } | null;
  onGoToLocation: () => void;
}

const CurrentLocationControls: React.FC<CurrentLocationControlsProps> = ({
  onLocationUpdate,
  currentLocation,
  onGoToLocation
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    // HTTPS 체크 (모바일에서 중요)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      setError('위치 서비스를 사용하려면 HTTPS 연결이 필요합니다.');
      return;
    }

    setLoading(true);
    setError(null);

    // 먼저 권한 상태 확인
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        if (result.state === 'denied') {
          setError('브라우저 설정에서 위치 권한을 허용해주세요.');
          setLoading(false);
          return;
        }
        
        // 권한이 허용되었거나 묻기 상태일 때 위치 요청
        requestLocation();
      }).catch(() => {
        // permissions API가 지원되지 않으면 바로 위치 요청
        requestLocation();
      });
    } else {
      // permissions API가 지원되지 않으면 바로 위치 요청
      requestLocation();
    }

    function requestLocation() {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          onLocationUpdate(location);
          setLoading(false);
        },
        (error) => {
          let errorMessage = '위치를 가져올 수 없습니다.';
          let suggestion = '';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '위치 접근 권한이 거부되었습니다.';
              suggestion = '브라우저 설정에서 위치 권한을 허용해주세요.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = '위치 정보를 사용할 수 없습니다.';
              suggestion = 'GPS가 켜져 있는지 확인해주세요.';
              break;
            case error.TIMEOUT:
              errorMessage = '위치 요청 시간이 초과되었습니다.';
              suggestion = '다시 시도해주세요.';
              break;
          }
          
          setError(`${errorMessage} ${suggestion}`);
          setLoading(false);
        },
        {
          enableHighAccuracy: false, // 모바일에서 더 관대한 설정
          timeout: 15000, // 타임아웃 증가
          maximumAge: 60000 // 1분으로 단축
        }
      );
    }
  }, [onLocationUpdate]);

  const handleCloseError = useCallback(() => {
    setError(null);
  }, []);

  const handleShowHelp = useCallback(() => {
    setShowHelp(true);
  }, []);

  const handleCloseHelp = useCallback(() => {
    setShowHelp(false);
  }, []);

  return (
    <>
      {/* 에러 알림 */}
      {error && (
        <LocationErrorAlert error={error} onClose={handleCloseError} />
      )}

      {/* 위치 버튼들 */}
      <div className="absolute bottom-32 right-2 z-10 flex flex-col gap-2">
        <LocationButton
          onClick={getCurrentLocation}
          loading={loading}
          title="현재 위치 가져오기"
        />
        
        {currentLocation && (
          <GoToLocationButton
            onClick={onGoToLocation}
            title="현재 위치로 이동"
          />
        )}

        {/* 도움말 버튼 */}
        <button
          onClick={handleShowHelp}
          className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-full shadow-lg transition-colors duration-200"
          title="위치 권한 설정 도움말"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      {/* 도움말 모달 */}
      <LocationHelpModal isOpen={showHelp} onClose={handleCloseHelp} />
    </>
  );
};

export default CurrentLocationControls;
