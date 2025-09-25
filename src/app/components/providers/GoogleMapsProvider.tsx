// components/GoogleMapsProvider.tsx
'use client';

import React from 'react';
import { LoadScriptNext } from '@react-google-maps/api';

interface Props {
  children: React.ReactNode;
}

export default function GoogleMapsProvider({ children }: Props) {
  return (
    <LoadScriptNext
      id="google-map-script"
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      libraries={['geometry']}
    >
        <main>
            {children}
        </main>
    </LoadScriptNext>
  );
}
