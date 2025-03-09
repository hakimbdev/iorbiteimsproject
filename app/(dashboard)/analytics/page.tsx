"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from "recharts"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { auth } from "@/lib/firebase"
import type { Property, Client } from "@/types"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export default function AnalyticsPage() {
  const [propertyStats, setPropertyStats] = useState({
    total: 0,
    byType: [] as { name: string; value: number }[],
    byStatus: [] as { name: string; value: number }[],
    averagePrice: 0,
    totalValue: 0,
    conversionRate: 0,
  })
  const [clientStats, setClientStats] = useState({
    total: 0,
    byType: [] as { name: string; value: number }[],
    byStatus: [] as { name: string; value: number }[],
    activeClients: 0,
    conversionRate: 0,
  })
  const [monthlyData, setMonthlyData] = useState<Array<{
    name: string;
    properties: number;
    clients: number;
  }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<{
    start: Date;
    end: Date;
  }>({
    start: new Date(new Date().setMonth(new Date().getMonth() - 11)),
    end: new Date(),
  })

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!auth.currentUser) return

      try {
        const userDoc = await getDocs(
          query(collection(db, "users"), where("id", "==", auth.currentUser.uid))
        )
        const userData = userDoc.docs[0].data()
        const companyId = userData.companyId

        // Fetch properties with date range filter
        const propertiesQuery = query(
          collection(db, "properties"),
          where("companyId", "==", companyId),
          where("createdAt", ">=", dateRange.start.toISOString()),
          where("createdAt", "<=", dateRange.end.toISOString())
        )
        const propertiesSnapshot = await getDocs(propertiesQuery)
        const properties = propertiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Property[]

        // Fetch clients with date range filter
        const clientsQuery = query(
          collection(db, "clients"),
          where("companyId", "==", companyId),
          where("createdAt", ">=", dateRange.start.toISOString()),
          where("createdAt", "<=", dateRange.end.toISOString())
        )
        const clientsSnapshot = await getDocs(clientsQuery)
        const clients = clientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Client[]

        // Calculate property statistics
        const propertyTypes = properties.reduce((acc, property) => {
          acc[property.type] = (acc[property.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const propertyStatuses = properties.reduce((acc, property) => {
          acc[property.status] = (acc[property.status] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const totalValue = properties.reduce((sum, property) => sum + (property.price || 0), 0)
        const averagePrice = properties.length > 0 ? totalValue / properties.length : 0
        const soldProperties = properties.filter(p => p.status === "sold").length
        const conversionRate = properties.length > 0 ? (soldProperties / properties.length) * 100 : 0

        setPropertyStats({
          total: properties.length,
          byType: Object.entries(propertyTypes).map(([name, value]) => ({
            name,
            value,
          })),
          byStatus: Object.entries(propertyStatuses).map(([name, value]) => ({
            name,
            value,
          })),
          averagePrice,
          totalValue,
          conversionRate,
        })

        // Calculate client statistics
        const clientTypes = clients.reduce((acc, client) => {
          acc[client.type] = (acc[client.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const clientStatuses = clients.reduce((acc, client) => {
          acc[client.status] = (acc[client.status] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const activeClients = clients.filter(c => c.status === "active").length
        const clientConversionRate = clients.length > 0 ? (activeClients / clients.length) * 100 : 0

        setClientStats({
          total: clients.length,
          byType: Object.entries(clientTypes).map(([name, value]) => ({
            name,
            value,
          })),
          byStatus: Object.entries(clientStatuses).map(([name, value]) => ({
            name,
            value,
          })),
          activeClients,
          conversionRate: clientConversionRate,
        })

        // Generate monthly data based on actual data
        const months = Array.from({ length: 12 }, (_, i) => {
          const date = new Date(dateRange.start)
          date.setMonth(date.getMonth() + i)
          return date
        })

        const monthly = months.map(date => {
          const monthProperties = properties.filter(property => {
            const propertyDate = new Date(property.createdAt)
            return propertyDate.getMonth() === date.getMonth() &&
                   propertyDate.getFullYear() === date.getFullYear()
          })

          const monthClients = clients.filter(client => {
            const clientDate = new Date(client.createdAt)
            return clientDate.getMonth() === date.getMonth() &&
                   clientDate.getFullYear() === date.getFullYear()
          })

          return {
            name: date.toLocaleString('default', { month: 'short' }),
            properties: monthProperties.length,
            clients: monthClients.length,
          }
        })

        setMonthlyData(monthly)
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [dateRange])

  const exportAnalyticsData = () => {
    try {
      const data = {
        dateRange: {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString(),
        },
        propertyStats,
        clientStats,
        monthlyData,
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `analytics-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Analytics data exported successfully")
    } catch (error) {
      console.error("Error exporting analytics data:", error)
      toast.error("Failed to export analytics data")
    }
  }

  if (isLoading) {
    return <div>Loading analytics...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Date Range:</span>
            <input
              type="date"
              value={dateRange.start.toISOString().split('T')[0]}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
              className="border rounded px-2 py-1"
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end.toISOString().split('T')[0]}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
              className="border rounded px-2 py-1"
            />
          </div>
          <Button onClick={exportAnalyticsData} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propertyStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Average Price: ${propertyStats.averagePrice.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Active Clients: {clientStats.activeClients}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Property Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propertyStats.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Properties Sold: {propertyStats.byStatus.find(s => s.name === "sold")?.value || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Active vs Total Clients
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlyData}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="properties"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="clients"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Property Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={propertyStats.byType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {propertyStats.byType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Property Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={propertyStats.byStatus}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Client Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={clientStats.byType}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#82ca9d"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 