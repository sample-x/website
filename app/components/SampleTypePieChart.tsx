'use client'

import { useEffect, useState } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'
import { Sample } from '@/types/sample'

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

interface SampleTypePieChartProps {
  samples: Sample[]
}

export default function SampleTypePieChart({ samples }: SampleTypePieChartProps) {
  const [chartData, setChartData] = useState<any>(null)

  // Get color for sample type (same as in the table and map)
  const getTypeColor = (type?: string): string => {
    if (!type) return '#6b7280' // Default gray
    
    const typeColors: Record<string, string> = {
      animal: '#ef4444',
      plant: '#65a30d',
      mineral: '#3b82f6',
      synthetic: '#8b5cf6',
      bacterial: '#10b981',
      'cell line': '#8b5cf6',
      environmental: '#3b82f6',
      soil: '#92400e',
      viral: '#db2777',
      default: '#6b7280',
    }
    
    const typeLower = type.toLowerCase()
    
    // Check if type is directly in color map
    if (typeColors[typeLower]) return typeColors[typeLower]
    
    // Check if type contains any of the keys
    for (const [key, color] of Object.entries(typeColors)) {
      if (typeLower.includes(key)) return color
    }
    
    return typeColors.default
  }

  useEffect(() => {
    if (!samples || samples.length === 0) return

    // Group samples by type
    const typeCounts: Record<string, number> = {}
    samples.forEach(sample => {
      const type = (sample.type || 'Unknown').trim()
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })

    // Sort types by count (descending)
    const sortedTypes = Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a])

    // Prepare chart data
    const data = {
      labels: sortedTypes,
      datasets: [
        {
          data: sortedTypes.map(type => typeCounts[type]),
          backgroundColor: sortedTypes.map(type => getTypeColor(type)),
          borderColor: sortedTypes.map(type => getTypeColor(type)),
          borderWidth: 1,
        },
      ],
    }

    setChartData(data)
  }, [samples])

  if (!chartData) {
    return <div className="h-[250px] flex items-center justify-center bg-gray-50">Loading chart...</div>
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Sample Type Distribution</h3>
      <div className="h-[250px] flex items-center justify-center">
        <Pie
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  boxWidth: 15,
                  padding: 15,
                  font: {
                    size: 12
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.label || ''
                    const value = context.raw as number
                    const total = context.dataset.data.reduce((acc: number, curr: number) => acc + curr, 0)
                    const percentage = ((value / total) * 100).toFixed(1)
                    return `${label}: ${value} (${percentage}%)`
                  }
                }
              }
            }
          }}
        />
      </div>
    </div>
  )
} 