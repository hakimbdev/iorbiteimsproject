"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserStats } from "./user-stats"
import { PropertyManagement } from "./property-management"
import { ClientManagement } from "./client-management"
import { Analytics } from "./analytics"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "./ui/sidebar"
import { Button } from "./ui/button"
import { ModeToggle } from "./mode-toggle"
import { Building2, Users, BarChart3, Settings, LogOut } from "lucide-react"
import { trackActivity, trackLoginAttempt, trackRegistration } from "@/lib/activity"
import { ActivityList } from "@/components/activity/activity-list"

export default function Dashboard() {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center space-x-2 px-4 py-2">
              <Building2 className="h-6 w-6" />
              <span className="text-lg font-bold">iOrbit eIMS</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Button variant="ghost" className="w-full justify-start">
                        <Building2 className="mr-2 h-4 w-4" />
                        Properties
                      </Button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Button variant="ghost" className="w-full justify-start">
                        <Users className="mr-2 h-4 w-4" />
                        Clients
                      </Button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Reports</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Button variant="ghost" className="w-full justify-start">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics
                      </Button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="mt-auto p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </Sidebar>
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white dark:bg-gray-800 shadow">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
              <div className="flex items-center space-x-4">
                <ModeToggle />
                <SidebarTrigger />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4">
            <Tabs defaultValue="user-stats" className="space-y-4">
              <TabsList>
                <TabsTrigger value="user-stats">Overview</TabsTrigger>
                <TabsTrigger value="property-management">Properties</TabsTrigger>
                <TabsTrigger value="client-management">Clients</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              <TabsContent value="user-stats">
                <UserStats />
              </TabsContent>
              <TabsContent value="property-management">
                <PropertyManagement />
              </TabsContent>
              <TabsContent value="client-management">
                <ClientManagement />
              </TabsContent>
              <TabsContent value="analytics">
                <Analytics />
              </TabsContent>
            </Tabs>
            <ActivityList />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

