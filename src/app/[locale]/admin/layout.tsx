"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  ArrowLeft,
  Shield,
} from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard },
  { href: "/admin/lessons", label: "Lições", icon: BookOpen },
  { href: "/admin/users", label: "Usuários", icon: Users },
  { href: "/admin/analytics", label: "Análises", icon: BarChart3 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg flex">
      <aside className="hidden md:flex flex-col w-64 border-r border-n-700 bg-n-900 p-4">
        <div className="flex items-center gap-2 mb-6 px-2">
          <Shield className="w-5 h-5 text-accent" />
          <span className="font-display font-bold text-foreground">Admin</span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {ADMIN_NAV.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left",
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-n-400 hover:text-n-200 hover:bg-n-800",
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-n-400 hover:text-n-200 hover:bg-n-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao App
        </button>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center gap-3 p-4 border-b border-n-700 bg-n-900">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-lg hover:bg-n-800 text-n-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Shield className="w-5 h-5 text-accent" />
          <span className="font-display font-bold text-foreground">Admin</span>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
