export interface LivestockFarm {
  id: number
  farm_name: string
  livestock_type: string
  land_address: string
  road_address: string
  livestock_count: number
  barn_count: number
  area_sqm: number
  lat: number
  lng: number
  windData?: {
    radius: number
    startAngle: number
    endAngle: number
  } | null
}
