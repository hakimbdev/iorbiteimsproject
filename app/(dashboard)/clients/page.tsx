"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { AddClientDialog } from "@/components/clients/add-client-dialog"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { auth } from "@/lib/firebase"
import type { Client } from "@/types"
import { toast } from "sonner"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const fetchClients = async () => {
    if (!auth.currentUser) return

    try {
      const userDoc = await getDocs(
        query(collection(db, "users"), where("id", "==", auth.currentUser.uid))
      )
      const userData = userDoc.docs[0].data()
      const companyId = userData.companyId

      const clientsQuery = query(
        collection(db, "clients"),
        where("companyId", "==", companyId)
      )
      const clientsSnapshot = await getDocs(clientsQuery)
      const clientsData = clientsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Client[]

      setClients(clientsData)
    } catch (error) {
      console.error("Error fetching clients:", error)
      toast.error("Failed to fetch clients")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No clients found
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{client.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={client.status === "active" ? "default" : "secondary"}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(client.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddClientDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onClientAdded={fetchClients}
      />
    </div>
  )
} 