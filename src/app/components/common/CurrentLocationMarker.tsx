'use client';

import React from 'react';
import { Marker } from '@react-google-maps/api';

interface CurrentLocationMarkerProps {
  position: { lat: number; lng: number };
}

const CurrentLocationMarker: React.FC<CurrentLocationMarkerProps> = ({ position }) => {
  const currentLocationIcon = {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
      </svg>
    `),
    scaledSize: new google.maps.Size(24, 24),
    anchor: new google.maps.Point(12, 12),
  };

  return (
    <Marker
      position={position}
      icon={currentLocationIcon}
      title="현재 위치"
    />
  );
};

export default CurrentLocationMarker;
