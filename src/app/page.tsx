import Link from "next/link"
import { Calendar05 } from "@/components/calendar-05"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export default function Home() {
  return (
    <div className="font-sans min-h-screen p-8 flex items-center justify-center relative">
      <div className="absolute top-8 right-8">
        <ModeToggle />
      </div>
      <main className="flex flex-col gap-8 items-center">
        <h1 className="title-large text-center">Calendar & Dashboard Demo</h1>
        <div className="flex gap-4">
          <Link href="/dashboard">
            <Button size="lg">
              ダッシュボードを開く
            </Button>
          </Link>
        </div>
        <div className="mt-8 space-y-4">
          <h2 className="title-medium text-center">Calendar Component</h2>
          <Calendar05 />
        </div>
      </main>
    </div>
  );
}
