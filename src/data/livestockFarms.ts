import livestockFarmsData from './livestock-farms.json'

// JSONデータの型定義
export interface LivestockFarmData {
  id: number
  farmName: string
  livestockType: string
  landAddress: string
  roadAddress: string
  livestockCount: number
  barnCount: number
  areaSqm: number
  latitude: number
  longitude: number
}

export interface LivestockFarmsExport {
  exportDate: string
  totalCount: number
  data: LivestockFarmData[]
}

// データのエクスポート
export const LIVESTOCK_FARMS_DATA = livestockFarmsData as LivestockFarmsExport
export const LIVESTOCK_FARMS = LIVESTOCK_FARMS_DATA.data
export const TOTAL_COUNT = LIVESTOCK_FARMS_DATA.totalCount

// フロントエンド用にデータを変換する関数（既存のLivestockFarm型に合わせる）
export function convertToLivestockFarm(farmData: LivestockFarmData) {
  return {
    id: farmData.id,
    farm_name: farmData.farmName,
    livestock_type: farmData.livestockType,
    land_address: farmData.landAddress,
    road_address: farmData.roadAddress,
    livestock_count: farmData.livestockCount,
    barn_count: farmData.barnCount,
    area_sqm: farmData.areaSqm,
    lat: farmData.latitude,
    lng: farmData.longitude,
    windData: null, // 風向きデータは後で計算
  }
}

// 全てのデータを変換
export const CONVERTED_FARMS = LIVESTOCK_FARMS.map(convertToLivestockFarm)
