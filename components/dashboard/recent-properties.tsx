"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Property } from "@/types"

interface RecentPropertiesProps {
  properties: Property[]
}

export function RecentProperties({ properties }: RecentPropertiesProps) {
  return (
    <div className="space-y-8">
      {properties.map((property) => (
        <div key={property.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={property.images[0]} alt={property.title} />
            <AvatarFallback>
              {property.title.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{property.title}</p>
            <p className="text-sm text-muted-foreground">
              {property.location}
            </p>
          </div>
          <div className="ml-auto font-medium">
            <Badge variant={property.status === "available" ? "default" : "secondary"}>
              {property.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
} 