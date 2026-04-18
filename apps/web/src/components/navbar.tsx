"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, BookOpen, LayoutDashboard, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/providers/auth-provider";

const navLinks = [
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

function getInitials(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-sm">
              LS
            </span>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold tracking-tight">LearnSphere</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Learn &middot; Build &middot; Ship
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={pathname.startsWith(link.href) ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2 text-sm"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isLoading && (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="hidden h-4 w-24 sm:block" />
            </div>
          )}

          {!isLoading && !isAuthenticated && (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Get started</Button>
              </Link>
            </div>
          )}

          {!isLoading && isAuthenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(user.email)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline-block">{user.email}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8}>
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2" onClick={() => { window.location.href = "/profile"; }}>
                  <User className="h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={() => { window.location.href = "/dashboard"; }}>
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" className="gap-2" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent transition-colors md:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                    <Button
                      variant={pathname.startsWith(link.href) ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3"
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Button>
                  </Link>
                ))}
                {!isLoading && !isAuthenticated && (
                  <>
                    <div className="my-2 border-t" />
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full">Sign in</Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full">Get started</Button>
                    </Link>
                  </>
                )}
                {!isLoading && isAuthenticated && (
                  <>
                    <div className="my-2 border-t" />
                    <Link href="/profile" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-3">
                        <User className="h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-destructive"
                      onClick={() => { handleSignOut(); setMobileOpen(false); }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
