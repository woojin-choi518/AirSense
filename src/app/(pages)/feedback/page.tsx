'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { AddressSearchInput } from '@/components/feedback/AddressSearchInput'
import RequiredMaker from '@/utils/RequiredMaker'

interface ComplaintFormData {
  contact?: string
  coordinates: string
  address: string
  intensity: number
  content: string
  categories: string[]
}

const COMPLAINT_CATEGORIES = [
  '가축·분뇨 냄새',
  '음식물 쓰레기 냄새',
  '하수·정화조 냄새',
  '화학물질·공장 냄새',
  '담배·생활 냄새',
  '기타',
]

const INTENSITY_LABELS = [
  '전혀 불편하지 않음',
  '조금 불편함',
  '보통 불편함',
  '매우 불편함',
  '매우 불편함 (짜증 및 두통 유발)',
]

export default function FeedbackPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [coordinates, setCoordinates] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [otherCategoryText, setOtherCategoryText] = useState<string>('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ComplaintFormData>({
    defaultValues: {
      intensity: 1,
      categories: [],
    },
  })

  // 페이지 로드 시 자동으로 좌표 획득
  useEffect(() => {
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            const coordString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            setCoordinates(coordString)
            setValue('coordinates', coordString)
          },
          (error) => {
            console.log('위치 정보 획득 실패:', error)
            setCoordinates('위치 정보를 가져올 수 없습니다')
            setValue('coordinates', '위치 정보를 가져올 수 없습니다')
          }
        )
      } else {
        setCoordinates('이 브라우저는 위치 정보를 지원하지 않습니다')
        setValue('coordinates', '이 브라우저는 위치 정보를 지원하지 않습니다')
      }
    }

    getCurrentLocation()
  }, [setValue])

  // 주소 변경 처리
  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress)
    setValue('address', newAddress)
  }
  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category])
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
      // 기타 카테고리가 해제되면 텍스트도 초기화
      if (category === '기타') {
        setOtherCategoryText('')
      }
    }
  }

  // 폼 제출 처리
  const onSubmit = async (data: ComplaintFormData) => {
    try {
      // 기타 카테고리가 선택되고 텍스트가 있으면 기타 대신 텍스트를 사용
      const processedCategories = selectedCategories.map((category) =>
        category === '기타' && otherCategoryText.trim() ? otherCategoryText.trim() : category
      )

      const formData = {
        contact: data.contact || null,
        coordinates,
        address,
        intensity: data.intensity,
        content: data.content,
        categories: processedCategories,
      }

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        alert('민원이 성공적으로 제출되었습니다!')

        // 폼 리셋
        setSelectedCategories([])
        setAddress('')
        setOtherCategoryText('')
        setValue('contact', '')
        setValue('coordinates', '')
        setValue('address', '')
        setValue('intensity', 1)
        setValue('content', '')
      } else {
        alert(`민원 제출에 실패했습니다: ${result.error}`)
      }
    } catch (error) {
      console.error('민원 제출 오류:', error)
      alert('민원 제출 중 오류가 발생했습니다.')
    }
  }

  const intensity = watch('intensity')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/30 py-8">
      <div className="mx-auto max-w-2xl px-4">
        <div className="rounded-lg border border-black/20 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">민원 접수</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 연락처 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">연락처 (선택)</label>
              <input
                type="text"
                {...register('contact')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="전화번호 또는 이메일 주소"
              />
            </div>
            {coordinates && <label className="text-gray-700D mb-2 block text-sm font-medium">GPS: {coordinates}</label>}
            {/* 주소 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                주소
                <RequiredMaker />
              </label>
              <AddressSearchInput address={address} setAddress={handleAddressChange} />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
            </div>

            {/* 강도 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                강도
                <RequiredMaker />: {intensity} - {INTENSITY_LABELS[intensity - 1]}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                {...register('intensity', { required: true })}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>

            {/* 악취 유형 체크박스 */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                악취 유형 <RequiredMaker />
              </label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {COMPLAINT_CATEGORIES.map((category) => (
                  <label key={category} className="flex cursor-pointer items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={(e) => handleCategoryChange(category, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>

              {/* 기타 카테고리 선택 시 추가 입력 필드 */}
              {selectedCategories.includes('기타') && (
                <div className="mt-3">
                  <label className="mb-2 block text-sm font-medium text-gray-700">기타 악취 유형을 입력해주세요</label>
                  <input
                    type="text"
                    value={otherCategoryText}
                    onChange={(e) => setOtherCategoryText(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="예: 화장품 냄새, 페인트 냄새 등"
                  />
                </div>
              )}
            </div>

            {/* 민원 내용 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                민원 내용
                <RequiredMaker />
              </label>
              <textarea
                {...register('content', { required: '민원 내용을 입력해주세요' })}
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="구체적인 민원 내용을 작성해주세요"
              />
              {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                민원 제출
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategories([])
                  setAddress('')
                  setOtherCategoryText('')
                  setValue('contact', '')
                  setValue('coordinates', '')
                  setValue('address', '')
                  setValue('intensity', 1)
                  setValue('content', '')
                }}
                className="rounded-md bg-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:outline-none"
              >
                리셋
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
