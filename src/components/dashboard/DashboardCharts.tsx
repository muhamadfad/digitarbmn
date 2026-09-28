"use client"

import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { Box, AlertTriangle } from 'lucide-react'

// Warna FASIH
const COLORS = ['#2563eb', '#16a34a', '#eab308', '#dc2626', '#64748b']

interface ChartData {
  conditionData: { name: string; value: number }[]
  categoryData: { name: string; total: number }[]
}

export default function DashboardCharts() {
  const [data, setData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulasi fetch data dari API
    // (Di real app ini di-fetch dari /api/dashboard/stats)
    setTimeout(() => {
      setData({
        conditionData: [
          { name: 'Baik', value: 85 },
          { name: 'Rusak Ringan', value: 12 },
          { name: 'Rusak Berat', value: 3 },
        ],
        categoryData: [
          { name: 'Elektronik & IT', total: 45 },
          { name: 'Furnitur & Meubel', total: 30 },
          { name: 'Kendaraan Dinas', total: 8 },
          { name: 'Peralatan Kantor', total: 17 },
        ]
      })
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 animate-pulse">
        <div className="bg-slate-100 h-[350px] rounded-sm border border-slate-200"></div>
        <div className="bg-slate-100 h-[350px] rounded-sm border border-slate-200"></div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Chart 1: Kondisi Aset */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-5">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">KONDISI BMN (PROSENTASE)</h3>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.conditionData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={95}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.conditionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={
                    entry.name === 'Baik' ? '#16a34a' : 
                    entry.name === 'Rusak Ringan' ? '#f59e0b' : '#dc2626'
                  } />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                formatter={(value: number) => [`${value}%`, 'Kondisi']}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Distribusi Kategori */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-5">
        <div className="flex items-center gap-2 mb-6">
          <Box className="w-5 h-5 text-blue-500" />
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">DISTRIBUSI BMN PER KATEGORI</h3>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} 
                angle={-20}
                textAnchor="end"
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b' }} 
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {data.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
