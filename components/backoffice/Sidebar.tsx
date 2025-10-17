"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  WrenchScrewdriverIcon,
  CubeIcon,
  UsersIcon,
  StarIcon,
  PhotoIcon,
  ChartBarIcon,
  ListBulletIcon,
  Cog6ToothIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/backoffice", icon: HomeIcon },
  { name: "Users", href: "/backoffice/users", icon: UsersIcon },
  {
    name: "Services",
    href: "/backoffice/services",
    icon: WrenchScrewdriverIcon,
  },
  { name: "Packages", href: "/backoffice/packages", icon: CubeIcon },
  { name: "Reviews", href: "/backoffice/reviews", icon: StarIcon },
  { name: "Gallery", href: "/backoffice/gallery", icon: PhotoIcon },
  { name: "About Us", href: "/backoffice/about-us", icon: DocumentTextIcon },
  { name: "FAQs", href: "/backoffice/faqs", icon: QuestionMarkCircleIcon },
  { name: "Stats", href: "/backoffice/stats", icon: ChartBarIcon },
  { name: "Features", href: "/backoffice/features", icon: ListBulletIcon },
  { name: "SEO", href: "/backoffice/seo", icon: MagnifyingGlassIcon },
  { name: "Settings", href: "/backoffice/settings", icon: Cog6ToothIcon },
  { name: "Profile", href: "/backoffice/profile", icon: UserIcon },
  { name: "Contacts", href: "/backoffice/contacts", icon: EnvelopeIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = React.useState<{ displayName: string | null; email: string } | null>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = (typeof document !== 'undefined' && document.cookie.match(/(?:^|; )sb-access-token=([^;]+)/)?.[1]) || '';
        const res = await fetch('/api/me', {
          headers: token ? { Authorization: `Bearer ${decodeURIComponent(token)}` } : undefined,
          credentials: 'same-origin',
        });
        if (res.ok) {
          const data = await res.json();
          const u = data?.user ?? data;
          setUser({ displayName: u.displayName ?? null, email: u.email });
        }
      } catch {
        // ignore
      }
    };
    fetchUser();
    const onProfileUpdated = () => fetchUser();
    if (typeof window !== 'undefined') {
      window.addEventListener('user:profile-updated', onProfileUpdated);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('user:profile-updated', onProfileUpdated);
      }
    };
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold text-white">Visionara</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/backoffice" && pathname.startsWith(item.href));

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-white"
                    }`}
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer with user */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-300 text-center">
          {user?.displayName || user?.email || '—'}
        </div>
        <p className="mt-1 text-[10px] text-gray-500 text-center">Visionara Backoffice</p>
      </div>
    </div>
  );
}
