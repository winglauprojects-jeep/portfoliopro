import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-white">
      <h1 className="text-4xl font-bold mb-4">
        Welcome to Activepath Investing
      </h1>
      <p className="text-lg text-slate-600 mb-8">
        Master your personal finances.
      </p>

      <div className="flex gap-4">
        <Link href="/login">
          <Button variant="outline">Sign In</Button>
        </Link>
        <Link href="/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
