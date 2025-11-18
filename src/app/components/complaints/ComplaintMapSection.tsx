'use client'

import { GoogleMap, Marker } from '@react-google-maps/api'
import { MapPin } from 'lucide-react'

import Panel from '@/components/common/Panel'
import { ASAN_CENTER } from '@/constants'
import { useComplaintClustering } from '@/hooks/useComplaintClustering'
import { getMarkerScale } from '@/utils/complaints'

import ComplaintList from './ComplaintList'

interface Complaint {
  id: number
  date: string
  region: string
  lat: number | null
  lng: number | null
  period: string | null
}

interface Cluster {
  complaints: Complaint[]
  count: number
}

interface ComplaintMapSectionProps {
  complaints: Complaint[]
  selectedClusterComplaints: Complaint[]
  showComplaintList: boolean
  onMarkerClick: (cluster: Cluster) => void
  onCloseComplaintList: () => void
}

const getMapContainerStyle = () => ({
  width: '100%',
  height: '100%',
})

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
}

export default function ComplaintMapSection({
  complaints,
  selectedClusterComplaints,
  showComplaintList,
  onMarkerClick,
  onCloseComplaintList,
}: ComplaintMapSectionProps) {
  const { createClusteredMarkers } = useComplaintClustering()

  const clusteredMarkers = createClusteredMarkers(complaints.filter((complaint) => complaint.lat && complaint.lng))

  return (
    <Panel title="민원 발생 위치" icon={MapPin} className="flex flex-col lg:h-full">
      <div className="min-h-0 flex-1">
        <div className="h-[500px] w-full overflow-hidden rounded-lg shadow-lg lg:h-full">
          <GoogleMap mapContainerStyle={getMapContainerStyle()} center={ASAN_CENTER} zoom={12} options={mapOptions}>
            {clusteredMarkers.map((cluster, index) => (
              <Marker
                key={`cluster-${index}`}
                position={cluster.position}
                title={`${cluster.count}건의 민원`}
                onClick={() => onMarkerClick(cluster)}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: getMarkerScale(cluster.count),
                  fillColor: '#e34343',
                  fillOpacity: 0.8,
                  strokeWeight: 0,
                }}
                label={cluster.count > 1 ? cluster.count.toString() : ''}
              />
            ))}
          </GoogleMap>
        </div>
      </div>

      {/* 민원 리스트 인라인 표시 */}
      {showComplaintList && (
        <div className="mt-4 min-h-0 flex-1">
          <ComplaintList
            complaints={selectedClusterComplaints}
            totalCount={selectedClusterComplaints.length}
            onClose={onCloseComplaintList}
            isVisible={showComplaintList}
          />
        </div>
      )}
    </Panel>
  )
}
