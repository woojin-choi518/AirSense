'use client'

import { useCallback } from 'react'

import { calculateDistance } from '@/utils/complaints'

interface Complaint {
  id: number
  date: string
  region: string
  lat: number | null
  lng: number | null
  period: string | null
}

interface ClusteredMarker {
  position: { lat: number; lng: number }
  count: number
  complaints: Complaint[]
  region: string
}

export const useComplaintClustering = () => {
  const createClusteredMarkers = useCallback((complaints: Complaint[]): ClusteredMarker[] => {
    const clusteredMarkers: ClusteredMarker[] = []

    // 유효한 좌표가 있는 민원만 필터링
    const validComplaints = complaints.filter((c) => c.lat && c.lng)

    if (validComplaints.length === 0) return clusteredMarkers

    // 공간 해시 맵 생성 (50m 격자)
    const gridSize = 0.0005 // 약 50m에 해당하는 위도/경도 차이
    const spatialHash = new Map<string, Complaint[]>()

    // 각 민원을 격자에 배치
    validComplaints.forEach((complaint) => {
      const gridKey = `${Math.floor(complaint.lat! / gridSize)},${Math.floor(complaint.lng! / gridSize)}`

      if (!spatialHash.has(gridKey)) {
        spatialHash.set(gridKey, [])
      }
      spatialHash.get(gridKey)!.push(complaint)
    })

    const processed = new Set<number>()

    // 각 격자에서 클러스터링 수행
    spatialHash.forEach((gridComplaints) => {
      gridComplaints.forEach((complaint) => {
        if (processed.has(complaint.id)) return

        const cluster: Complaint[] = [complaint]
        processed.add(complaint.id)

        // 인접 격자들도 확인 (3x3 격자)
        const baseGridX = Math.floor(complaint.lat! / gridSize)
        const baseGridY = Math.floor(complaint.lng! / gridSize)

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const neighborKey = `${baseGridX + dx},${baseGridY + dy}`
            const neighborComplaints = spatialHash.get(neighborKey) || []

            neighborComplaints.forEach((otherComplaint) => {
              if (processed.has(otherComplaint.id) || otherComplaint.id === complaint.id) {
                return
              }

              const distance = calculateDistance(
                complaint.lat!,
                complaint.lng!,
                otherComplaint.lat!,
                otherComplaint.lng!
              )

              if (distance <= 100) {
                cluster.push(otherComplaint)
                processed.add(otherComplaint.id)
              }
            })
          }
        }

        // 클러스터의 중심점 계산
        const avgLat = cluster.reduce((sum, c) => sum + c.lat!, 0) / cluster.length
        const avgLng = cluster.reduce((sum, c) => sum + c.lng!, 0) / cluster.length

        clusteredMarkers.push({
          position: { lat: avgLat, lng: avgLng },
          count: cluster.length,
          complaints: cluster,
          region: complaint.region,
        })
      })
    })

    return clusteredMarkers
  }, [])

  return { createClusteredMarkers }
}
