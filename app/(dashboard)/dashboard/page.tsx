"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentProperties } from "@/components/dashboard/recent-properties"
import { RecentClients } from "@/components/dashboard/recent-clients"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { auth } from "@/lib/firebase"
import type { Property, Client } from "@/types"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalClients: 0,
    availableProperties: 0,
    activeClients: 0,
  })
  const [recentProperties, setRecentProperties] = useState<Property[]>([])
  const [recentClients, setRecentClients] = useState<Client[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!auth.currentUser) return

      try {
        // Get user's company ID
        const userDoc = await getDocs(
          query(collection(db, "users"), where("id", "==", auth.currentUser.uid))
        )
        const userData = userDoc.docs[0].data()
        const companyId = userData.companyId

        // Fetch properties
        const propertiesQuery = query(
          collection(db, "properties"),
          where("companyId", "==", companyId)
        )
        const propertiesSnapshot = await getDocs(propertiesQuery)
        const properties = propertiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Property[]

        // Fetch clients
        const clientsQuery = query(
          collection(db, "clients"),
          where("companyId", "==", companyId)
        )
        const clientsSnapshot = await getDocs(clientsQuery)
        const clients = clientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Client[]

        // Calculate stats
        setStats({
          totalProperties: properties.length,
          totalClients: clients.length,
          availableProperties: properties.filter(p => p.status === "available").length,
          activeClients: clients.filter(c => c.status === "active").length,
        })

        // Get recent items
        setRecentProperties(
          properties
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5)
        )
        setRecentClients(
          clients
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5)
        )
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableProperties}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClients}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentProperties properties={recentProperties} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentClients clients={recentClients} />
        </CardContent>
      </Card>
    </div>
  )
} 