import { 
  Home, 
  User, 
  MessageSquare, 
  ShoppingBag, 
  Settings,
  FileUp,
} from "lucide-react";

export const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    color: "text-sky-500",
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
    color: "text-violet-500",
  },
  {
    title: "Messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
    color: "text-pink-500",
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingBag,
    color: "text-green-500",
  },
  {
    title: "Documents",
    href: "/dashboard/documents",
    icon: FileUp,
    color: "text-amber-500",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    color: "text-gray-500",
  },
]; 