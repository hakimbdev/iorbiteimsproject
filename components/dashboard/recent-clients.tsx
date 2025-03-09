"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Client } from "@/types"

interface RecentClientsProps {
  clients: Client[]
}

export function RecentClients({ clients }: RecentClientsProps) {
  return (
    <div className="space-y-8">
      {clients.map((client) => (
        <div key={client.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://avatar.vercel.sh/${client.email}`} alt={client.name} />
            <AvatarFallback>
              {client.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{client.name}</p>
            <p className="text-sm text-muted-foreground">
              {client.email}
            </p>
          </div>
          <div className="ml-auto font-medium">
            <Badge variant={client.status === "active" ? "default" : "secondary"}>
              {client.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
} 