import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/properties", label: "Properties" },
  { href: "/clients", label: "Clients" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 bg-white/50 backdrop-blur-sm border-b border-sky-100 px-4 h-14">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-sky-600",
            pathname === link.href
              ? "text-sky-600"
              : "text-sky-700"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
} 