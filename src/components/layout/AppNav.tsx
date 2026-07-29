"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  Sword,
  Package,
  Swords,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learn", label: "Quests", icon: Sword },
  { href: "/learn/review", label: "Revisão", icon: Zap },
  { href: "/skill-tree", label: "Skill Tree", icon: Swords },
  { href: "/inventory", label: "Inventário", icon: Package },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-n-700 bg-n-900/95 backdrop-blur-sm md:static md:border-b md:border-t-0"
      aria-label="Navegação principal"
    >
      <div className="flex items-center justify-around md:justify-start md:gap-1 md:px-4 md:max-w-7xl md:mx-auto">
        {/* Logo — desktop only */}
        <div className="hidden md:flex items-center gap-2 mr-6">
          <span className="text-lg">🦉</span>
          <span className="font-display font-bold text-foreground">
            EnglishQuest
          </span>
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col md:flex-row items-center gap-1 px-3 py-2 md:py-2.5 rounded-lg transition-colors text-xs md:text-sm",
                isActive
                  ? "text-accent bg-accent/10"
                  : "text-n-400 hover:text-n-200 hover:bg-n-800",
              )}
            >
              <Icon className="h-5 w-5 md:h-4 md:w-4" aria-hidden="true" />
              <span className="text-[10px] md:text-sm font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}