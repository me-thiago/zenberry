import { Card, CardContent } from "@/src/components/ui/card";
import { Heart, Package, Star, Wallet } from "lucide-react";
import Link from "next/link";

const ACTIONS = [
  {
    href: "/profile/orders",
    icon: <Package className="w-5 h-5 text-blue-600" />,
    bg: "bg-blue-100",
    title: "My Orders",
    desc: "View the status of your current and previous orders",
  },
  {
    href: "/profile/reviews",
    icon: <Star className="w-5 h-5 text-yellow-600" />,
    bg: "bg-yellow-100",
    title: "Reviews",
    desc: "Rate products you've purchased and see your reviews",
  },
  {
    href: "/profile/wallet",
    icon: <Wallet className="w-5 h-5 text-green-600" />,
    bg: "bg-green-100",
    title: "Address",
    desc: "Manage your delivery addresses",
  },
  {
    href: "/profile/favorites",
    icon: <Heart className="w-5 h-5 text-red-600" />,
    bg: "bg-red-100",
    title: "Favorites",
    desc: "Access your favorite products list and pick up where you left off",
  },
  {
    href: "/profile/wallet",
    icon: <Wallet className="w-5 h-5 text-teal-600" />,
    bg: "bg-teal-100",
    title: "Wallet",
    desc: "Manage your payment methods and transaction history",
  },
  {
    href: "/profile/orders",
    icon: <Package className="w-5 h-5 text-blue-600" />,
    bg: "bg-blue-100",
    title: "My Orders 2",
    desc: "View the status of your current and previous orders",
  },
];

export function ProfileQuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {ACTIONS.map((action) => (
        <Link key={action.href + action.title} href={action.href}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${action.bg}`}
                >
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
