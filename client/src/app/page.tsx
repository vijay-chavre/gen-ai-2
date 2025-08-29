import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-lg font-semibold">Gen AI</h1>
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-3xl p-6 grid gap-6">
        <h1>Welcome to AI Chat Boat</h1>
        <Link href={'/login'}>Login</Link>
      </main>
    </div>
  )
}


