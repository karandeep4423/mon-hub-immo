import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, UsersIcon, BuildingStorefrontIcon, UserGroupIcon } from "@heroicons/react/24/outline";

const links = [
  { href: "/admin", label: "Tableau de bord", icon: <HomeIcon className="h-5 w-5" /> },
  { href: "/admin/users", label: "Gestion utilisateurs", icon: <UsersIcon className="h-5 w-5" /> },
  { href: "/admin/properties", label: "Gestion annonces", icon: <BuildingStorefrontIcon className="h-5 w-5" /> },
  { href: "/admin/collaborations", label: "Collaborations", icon: <UserGroupIcon className="h-5 w-5" /> },
 ];

export default function SidebarAdmin() {
  const pathname = usePathname();
  return (
    <nav className="h-full flex flex-col px-6 py-8 space-y-2 bg-white rounded-tr-3xl rounded-br-3xl shadow-xl">
      <div className="mb-10 font-extrabold text-2xl text-[#009CD8] select-none">
        mon<span className="text-[#00BCE4] font-black">hubimmo</span>
      </div>
      <div className="flex-1 flex flex-col space-y-2">
        {links.map(({ href, label, icon }) => {
          const isActive = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-5 py-3 rounded-lg font-medium transition
                ${isActive
                  ? "bg-[#00BCE4] text-white shadow-md"
                  : "text-gray-600 hover:bg-[#E0F4FF] hover:text-[#009CD8]"}
              `}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto text-xs text-gray-400 text-center pt-8 select-none">
        &copy; 2025 monHubImmo
      </div>
    </nav>
  );
}
