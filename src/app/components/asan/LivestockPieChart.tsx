'use client'

import { useEffect, useState } from 'react'
import { Cell, Legend, Pie, PieChart, PieLabelRenderProps, ResponsiveContainer, Tooltip } from 'recharts'

import { groupSmallCategories } from '@/app/lib/groupSmallCategories'

const COLORS = ['#524632', '#8f7e4f', '#c3c49e', '#d8ffdd', '#a1a488', '#565656']

export default function LivestockPieChart({ data }: { data: { name: string; value: number }[] }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 480)
    }
  }, [])

  const outerRadius = isMobile ? 70 : 90

  const groupedData = groupSmallCategories(data, 0.03) //기타 묶기 적용

  return (
    <div className="font-pretendard h-[180px] w-full px-2 sm:h-[240px]">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={groupedData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={outerRadius}
            innerRadius={40}
            fill="#8884d8"
            labelLine={false}
            label={(props: PieLabelRenderProps) => {
              type MyLabelProps = {
                name: string | number
                percent?: number
                cx: number
                cy: number
                midAngle: number
                innerRadius: number
                outerRadius: number
              }

              const { name, percent, cx, cy, midAngle, innerRadius, outerRadius } = props as unknown as MyLabelProps
              const RADIAN = Math.PI / 180
              const radius = innerRadius + (outerRadius - innerRadius) * 1.2
              const x = cx + radius * Math.cos(-midAngle * RADIAN)
              const y = cy + radius * Math.sin(-midAngle * RADIAN)

              return (
                <text
                  x={x}
                  y={y}
                  fill="#fff"
                  textAnchor={x > cx ? 'start' : 'end'}
                  dominantBaseline="central"
                  fontFamily="Pretendard"
                  fontWeight="bold"
                  fontSize={isMobile ? '10px' : '12px'}
                >
                  {`${String(name)} (${percent !== undefined ? (percent * 100).toFixed(1) : '0.0'}%)`}
                </text>
              )
            }}
            isAnimationActive
            animationDuration={800}
          >
            {groupedData.map((_, i) => (
              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} style={{ transition: 'all 0.3s ease' }} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '12px',
              border: '1px solid #45B7D1',
            }}
            itemStyle={{ color: '#333' }}
            formatter={(value: number) => `${value} 농가`}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{
              fontSize: '12px',
              fontWeight: 600,
              marginTop: 8,
              fontFamily: 'Pretendard', // 범례에도 Pretendard 적용
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
