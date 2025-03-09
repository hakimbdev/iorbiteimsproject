import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Search } from "lucide-react"

const clients = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "123-456-7890", type: "Buyer" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "234-567-8901", type: "Seller" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", phone: "345-678-9012", type: "Buyer" },
  { id: 4, name: "Alice Brown", email: "alice@example.com", phone: "456-789-0123", type: "Seller" },
  { id: 5, name: "Charlie Davis", email: "charlie@example.com", phone: "567-890-1234", type: "Buyer" },
]

export function ClientManagement() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Client Management</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Input placeholder="Search clients..." className="max-w-sm" />
        <Button variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>{client.name}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.phone}</TableCell>
              <TableCell>{client.type}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm">
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

