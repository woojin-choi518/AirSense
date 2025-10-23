import { InfoWindow } from '@react-google-maps/api'
import React from 'react'

import type { LivestockFarm } from '@/lib/types'

interface FarmInfoWindowProps {
  farm: LivestockFarm
  onClose: () => void
}

interface InfoItemProps {
  label: string
  value: string | number
  formatter?: (value: string | number) => string
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, formatter }) => {
  const displayValue = formatter ? formatter(value) : String(value)

  return (
    <div className="flex items-center gap-2">
      <span className="min-w-[5rem] rounded-full bg-green-100 px-4 py-2 text-center font-medium text-green-600">
        {label}
      </span>
      <span>{displayValue}</span>
    </div>
  )
}

const FarmInfoWindow: React.FC<FarmInfoWindowProps> = ({ farm, onClose }) => {
  const infoItems = [
    { label: '축종', value: farm.livestock_type },
    {
      label: '사육두수',
      value: farm.livestock_count,
      formatter: (value) => `${Number(value).toLocaleString()}두`,
    },
    {
      label: '면적',
      value: farm.area_sqm,
      formatter: (value) => `${Number(value).toLocaleString()}㎡`,
    },
    {
      label: '도로명',
      value: farm.road_address || '없음',
    },
    {
      label: '지번',
      value: farm.land_address || '없음',
    },
  ]

  return (
    <InfoWindow
      position={{ lat: farm.lat, lng: farm.lng }}
      onCloseClick={onClose}
      options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
    >
      <div className="w-full max-w-[90vw] space-y-3 rounded-xl border-2 border-green-300 bg-white/80 p-4 text-sm break-words text-gray-800 backdrop-blur-md sm:max-w-[20rem]">
        <h3 className="text-lg font-bold text-green-700">{farm.farm_name}</h3>
        {infoItems.map((item, index) => (
          <InfoItem key={index} label={item.label} value={item.value} formatter={item.formatter} />
        ))}
      </div>
    </InfoWindow>
  )
}

export default FarmInfoWindow
