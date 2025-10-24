'use client'
import { useEffect, useState } from 'react'

// Daum Postcode API 타입 정의
declare global {
  interface Window {
    daum?: {
      Postcode: new (options: { oncomplete: (data: { address: string }) => void }) => {
        open: () => void
      }
    }
  }
}

interface AddressSearchInputProps {
  address: string
  setAddress: (address: string) => void
}

/**
 * 주소 검색 입력 컴포넌트
 * @param {AddressSearchInputProps} props - 컴포넌트 props
 */
export function AddressSearchInput({ address, setAddress }: AddressSearchInputProps) {
  const [isDaumLoaded, setIsDaumLoaded] = useState(false)

  useEffect(() => {
    // Daum 우편번호 스크립트가 이미 로드되어 있으면 상태만 true로 설정
    if (window.daum && window.daum.Postcode) {
      setIsDaumLoaded(true)
      return
    }
    // Daum 우편번호 스크립트를 동적으로 로드
    const script = document.createElement('script')
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.async = true
    script.onload = () => setIsDaumLoaded(true)
    document.body.appendChild(script)
  }, [])

  const handleAddressSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('주소 검색 스크립트가 아직 로드되지 않았습니다.')
      return
    }
    // Daum 주소 검색 창 열기
    new window.daum.Postcode({
      oncomplete: function (data) {
        setAddress(data.address)
      },
    }).open()
  }

  return (
    <div className="flex w-full gap-2 border-gray-400">
      {/* 현재 주소를 표시하는 입력창 (비활성화 상태) */}
      <input
        value={address}
        onClick={handleAddressSearch}
        readOnly
        className="w-full cursor-pointer rounded-md border border-gray-300 bg-gray-100 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        placeholder="주소를 검색해주세요"
      />
      {/* 주소 검색 버튼 (스크립트 로드 전까지 비활성화됨) */}
      <button
        type="button"
        className="w-26 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={handleAddressSearch}
        disabled={!isDaumLoaded}
      >
        주소 찾기
      </button>
    </div>
  )
}
