"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getUserActivity, getRecentLoginAttempts } from "@/lib/activity"
import type { UserActivity, LoginAttempt } from "@/types/activity"
import { format } from "date-fns"
import {
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  Mail,
  UserCog,
  AlertCircle,
  Lock,
} from "lucide-react"

const ActivityIcon = ({ type, success = true }: { type: string; success?: boolean }) => {
  const iconProps = {
    className: `h-4 w-4 ${success ? "text-green-500" : "text-red-500"}`,
  }

  switch (type) {
    case "login":
    case "google_login":
      return <LogIn {...iconProps} />
    case "logout":
      return <LogOut {...iconProps} />
    case "email_verification":
      return <Mail {...iconProps} />
    case "profile_update":
      return <UserCog {...iconProps} />
    case "password_reset":
      return <Lock {...iconProps} />
    case "registration":
      return success ? <CheckCircle2 {...iconProps} /> : <XCircle {...iconProps} />
    default:
      return <AlertCircle {...iconProps} />
  }
}

const ActivityMessage = ({ activity }: { activity: UserActivity }) => {
  const messages: Record<string, string> = {
    login: "Logged in successfully",
    google_login: "Logged in with Google",
    logout: "Logged out",
    email_verification: "Email verification sent",
    profile_update: "Profile updated",
    password_reset: "Password reset requested",
    registration: "Account created",
  }

  return (
    <div className="flex items-center space-x-2">
      <ActivityIcon type={activity.type} success={activity.metadata.success} />
      <span>
        {activity.metadata.success
          ? messages[activity.type]
          : activity.metadata.error || `Failed to ${activity.type.replace("_", " ")}`}
      </span>
    </div>
  )
}

export function ActivityList() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivity = async () => {
      if (!user) return

      try {
        const [activityData, loginData] = await Promise.all([
          getUserActivity(user.uid),
          getRecentLoginAttempts(user.uid),
        ])

        setActivities(activityData)
        setLoginAttempts(loginData)
      } catch (error) {
        console.error("Error fetching activity:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivity()
  }, [user])

  if (!user || isLoading) {
    return null
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent account activity and login attempts</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <ActivityMessage activity={activity} />
                  <time className="text-sm text-muted-foreground">
                    {format(activity.timestamp, "MMM d, yyyy 'at' h:mm a")}
                  </time>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>Recent login attempts from different devices</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-4">
              {loginAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <ActivityIcon type="login" success={attempt.success} />
                      <span>
                        {attempt.success
                          ? `Logged in with ${attempt.method}`
                          : "Login failed"}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {attempt.metadata.device} • {attempt.metadata.browser}
                    </div>
                  </div>
                  <time className="text-sm text-muted-foreground">
                    {format(attempt.timestamp, "MMM d, yyyy 'at' h:mm a")}
                  </time>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
} 