import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Search } from "lucide-react"

const properties = [
  { id: 1, address: "123 Main St", type: "Residential", status: "For Sale", price: "$350,000" },
  { id: 2, address: "456 Elm St", type: "Commercial", status: "For Rent", price: "$2,500/mo" },
  { id: 3, address: "789 Oak Ave", type: "Residential", status: "Sold", price: "$425,000" },
  { id: 4, address: "101 Pine Rd", type: "Land", status: "For Sale", price: "$150,000" },
  { id: 5, address: "202 Maple Dr", type: "Residential", status: "For Rent", price: "$1,800/mo" },
]

export function PropertyManagement() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Property Management</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Input placeholder="Search properties..." className="max-w-sm" />
        <Button variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <TableRow key={property.id}>
              <TableCell>{property.address}</TableCell>
              <TableCell>{property.type}</TableCell>
              <TableCell>{property.status}</TableCell>
              <TableCell>{property.price}</TableCell>
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

