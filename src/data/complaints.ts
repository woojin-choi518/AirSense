import complaintsData from './complaints.json'

// JSONデータの型定義
export interface ComplaintData {
  id: number
  receivedDate: string
  content: string
  region: string | null
  year: number | null
  timePeriod: string | null
  latitude: number | null
  longitude: number | null
  roadAddress: string | null
  landAddress: string | null
  createdAt: string
  updatedAt: string
}

export interface ComplaintsExport {
  exportDate: string
  totalCount: number
  data: ComplaintData[]
}

// データのエクスポート
export const COMPLAINTS_DATA = complaintsData as ComplaintsExport
export const COMPLAINTS = COMPLAINTS_DATA.data
export const TOTAL_COUNT = COMPLAINTS_DATA.totalCount

// フロントエンド用にデータを変換する関数
export function convertToComplaint(complaintData: ComplaintData) {
  return {
    id: complaintData.id,
    received_date: complaintData.receivedDate,
    content: complaintData.content,
    region: complaintData.region,
    year: complaintData.year,
    time_period: complaintData.timePeriod,
    latitude: complaintData.latitude,
    longitude: complaintData.longitude,
    road_address: complaintData.roadAddress,
    land_address: complaintData.landAddress,
    created_at: complaintData.createdAt,
    updated_at: complaintData.updatedAt,
  }
}

// 全てのデータを変換
export const CONVERTED_COMPLAINTS = COMPLAINTS.map(convertToComplaint)

