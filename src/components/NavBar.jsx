"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  User,
  X,
  Search,
  LogOut,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { signOut, deleteUser } from "@/app/actions/auth";

export default function NavBar({ categories = [] }) {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCat = searchParams.get("category");
  const selectValue = currentCat ?? "_default";

  const isValidId = /^\d+$/.test(search.trim());

  const onSubmit = (e) => {
    e.preventDefault();
    if (!isValidId) return;
    const id = Number(search.trim());
    router.push(`/search?id=${id}`);
  };

  const onClear = () => {
    setSearch("");
  };

  const onCategoryChange = (value) => {
    if (value === "_default") {
      router.push("/");
    } else {
      router.push(`/search?category=${encodeURIComponent(value)}`);
    }
  };

  return (
    <div className="bg-red-500 flex items-center justify-between py-4 px-8">
      <div>
        <Link href="/">
          <Image
            src="/shopleft-logo-white.png"
            alt="ShopLeft Logo"
            width={120}
            height={40}
          />
        </Link>
      </div>

      <form
        onSubmit={onSubmit}
        className="flex items-center w-full max-w-xl relative"
      >
        <Input
          placeholder="Search item"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-28 rounded-full bg-white/20 backdrop-blur-md text-white placeholder-white"
          inputMode="numeric"
          pattern="[0-9]*"
        />

        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white" />

        {search && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onClear}
            className={`absolute ${
              isValidId ? "right-14" : "right-3"
            } top-1/2 -translate-y-1/2 hover:bg-transparent hover:scale-100`}
          >
            <X className="text-white" />
          </Button>
        )}

        {isValidId && (
          <Button
            type="submit"
            size="sm"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-7 bg-white/20 hover:bg-white/30 rounded-3xl text-white"
          >
            Go
          </Button>
        )}
      </form>

      <div className="flex items-center gap-4">
        <Select value={selectValue} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-40 rounded-full bg-white/20 text-white border-0 hover:bg-white/30 focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Default" />
          </SelectTrigger>
          <SelectContent align="end" className="min-w-[12rem]">
            <SelectItem value="_default">Default</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.category} value={String(c.category)}>
                {c.category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Link href="/cart">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-white/20 hover:scale-110 transition-transform p-2"
          >
            <ShoppingCart className="text-white" />
          </Button>
        </Link>

        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-white/20 hover:scale-110 transition-transform p-2"
              >
                <User className="text-white w-6 h-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => signOut()}
                className="cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete Account</span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This is a permanent action and cannot be undone. Your account
                and all associated data will be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteUser()}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
