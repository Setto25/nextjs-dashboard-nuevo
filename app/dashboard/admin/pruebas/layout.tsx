"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, UserPlus, BarChart3 } from "lucide-react";
import clsx from "clsx";

export default function AdminPruebasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";

  const tabs = [
    {
      name: "Gestión de Pruebas",
      href: "/dashboard/admin/pruebas",
      icon: ClipboardList,
      exact: true,
    },
    {
      name: "Asignaciones",
      href: "/dashboard/admin/pruebas/asignaciones",
      icon: UserPlus,
      exact: false,
    },
    {
      name: "Resultados",
      href: "/dashboard/admin/pruebas/resultados",
      icon: BarChart3,
      exact: false,
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Pestañas de Navegación del Panel de Evaluaciones */}
      <div className="flex border-b border-gray-150 overflow-x-auto no-scrollbar">
        <ul className="flex text-sm font-semibold text-center whitespace-nowrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            // Verificar si la pestaña está activa
            const isActive = tab.exact 
              ? pathname === tab.href 
              : pathname.startsWith(tab.href);

            return (
              <li key={tab.name} className="mr-2">
                <Link
                  href={tab.href}
                  className={clsx(
                    "inline-flex items-center justify-center px-4 py-3 border-b-2 rounded-t-lg gap-2 text-xs uppercase tracking-wider font-bold transition-all duration-200",
                    isActive
                      ? "border-emerald-500 text-emerald-600 bg-emerald-50/20"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="w-full">{children}</div>
    </div>
  );
}
