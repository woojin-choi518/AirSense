interface Complaint {
  id: number
  date: string
  region: string
  lat: number | null
  lng: number | null
  period: string | null
}

export const getRegionStats = (complaints: Complaint[]) => {
  const regionCounts: { [key: string]: number } = {}
  complaints.forEach((complaint) => {
    const region = complaint.region || '미분류'
    regionCounts[region] = (regionCounts[region] || 0) + 1
  })
  return Object.entries(regionCounts)
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count)
}

export const getMonthStats = (complaints: Complaint[]) => {
  const monthCounts: { [key: string]: number } = {}
  complaints.forEach((complaint) => {
    const month = (new Date(complaint.date).getMonth() + 1).toString()
    monthCounts[month] = (monthCounts[month] || 0) + 1
  })
  return Object.entries(monthCounts)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => parseInt(a.month) - parseInt(b.month))
}

export const getTimePeriodStats = (complaints: Complaint[]) => {
  const timePeriodCounts: { [key: string]: number } = {}
  complaints.forEach((complaint) => {
    const timePeriod = complaint.period || '미분류'
    timePeriodCounts[timePeriod] = (timePeriodCounts[timePeriod] || 0) + 1
  })
  return Object.entries(timePeriodCounts)
    .map(([timePeriod, count]) => ({ timePeriod, count }))
    .sort((a, b) => b.count - a.count)
}

export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000 // 지구 반지름 (미터)
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const getMarkerScale = (count: number): number => {
  if (count === 1) return 8
  if (count <= 5) return 12
  if (count <= 10) return 16
  if (count <= 20) return 20
  if (count <= 50) return 24
  return 28
}
