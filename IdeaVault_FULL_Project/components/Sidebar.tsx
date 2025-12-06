"use client";

import Link from "next/link";
import { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  const menu = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Creator Hub", href: "/creatorhub" },
    { name: "Vendor Hub", href: "/vendorhub" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Investor Hub", href: "/investorhub" },
    { name: "Lawyer Hub", href: "/lawyerhub" },
    { name: "NDA Generator", href: "/nda" },
    { name: "Wallet", href: "/wallet" },
    { name: "Notifications", href: "/notifications" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <div
      className={`
        fixed top-0 left-0 h-screen
        ${open ? "w-64" : "w-20"}
        bg-white/10 backdrop-blur-xl
        border-r border-gold/20 shadow-xl
        transition-all duration-300
        overflow-y-auto
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="text-gold text-xl p-4"
      >
        {open ? "«" : "»"}
      </button>

      {/* Menu */}
      <div className="flex flex-col gap-3 mt-4 pb-10">
        {menu.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="
              mx-3 p-3 rounded-lg
              bg-white/5 hover:bg-white/20
              border border-gold/20
              text-white font-semibold
              transition-all
            "
          >
            {open ? item.name : item.name.charAt(0)}
          </Link>
        ))}
      </div>
    </div>
  );
}
