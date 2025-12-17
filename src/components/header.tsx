"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button"; // Assuming you have this
import { LogOut, User as UserIcon, ChevronDown } from "lucide-react"; // Icons help UI
import { auth } from "@/lib/firebase/config"; // To handle logout
import Image from "next/image";
export function Header() {
  const { user, isAdmin, loading } = useAuth();

  // Handle Logout
  const handleSignOut = async () => {
    await auth.signOut();
    window.location.href = "/";
  };

  // We no longer return null for hidden paths! The header is always here.

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* --- LEFT SIDE: Brand & Public Links --- */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-slate-900">
            <Image
              src="/logo.png"
              alt="ActivePath Investing Logo"
              width={110}
              height={25}
              className="object-contain" // This keeps the aspect ratio correct
              priority // This loads the logo immediately since it's above the fold
            />
          </Link>

          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <Link
              href="/explore"
              className="hover:text-slate-900 transition-colors"
            >
              Explore
            </Link>

            {/* Show Dashboard only if logged in */}
            {user && (
              <Link
                href="/dashboard"
                className="hover:text-slate-900 transition-colors"
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        {/* --- RIGHT SIDE: User Actions --- */}
        <div className="flex items-center gap-4">
          {loading ? (
            // 1. Loading State (prevent flickering)
            <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse" />
          ) : user ? (
            <>
              {/* 2. ADMIN MENU (Nested Dropdown) */}
              {isAdmin && (
                <div className="relative group">
                  <button className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900">
                    Admin <ChevronDown size={14} />
                  </button>

                  {/* Dropdown Content (Shows on Hover) */}
                  <div className="absolute right-0 top-full pt-2 hidden group-hover:block w-48">
                    <div className="bg-white border rounded shadow-lg py-1 flex flex-col">
                      <Link
                        href="/admin/upload"
                        className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      >
                        Upload Report
                      </Link>
                      {/* You can add 'Manage Users' here later */}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. User Profile / Logout */}
              <div className="flex items-center gap-4 pl-4 border-l ml-2">
                <div className="text-xs text-right hidden sm:block">
                  <p className="font-medium text-slate-900">My Account</p>
                  <p className="text-slate-500">{user.email}</p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  title="Sign Out"
                >
                  <LogOut size={18} className="text-slate-500" />
                </Button>
              </div>
            </>
          ) : (
            // 4. Logged Out State
            <Link href="/">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
