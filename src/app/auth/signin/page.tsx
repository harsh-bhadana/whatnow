import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";
import { LogIn } from "lucide-react";

export default async function SignInPage() {
  const session = await auth();
  
  if (session) {
    redirect("/");
  }
  
  return (
    <div className="min-h-screen bg-[var(--color-m3-background)] flex flex-col items-center justify-center p-6">
      <div className="bg-[var(--color-m3-surface-container)] p-8 rounded-[28px] max-w-sm w-full shadow-lg border border-[var(--color-m3-surface-variant)]/20 text-center">
        <div className="w-16 h-16 bg-[var(--color-m3-primary-container)] text-[var(--color-m3-on-primary-container)] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <LogIn size={32} />
        </div>
        
        <h1 className="text-3xl font-heading font-bold text-[var(--color-m3-on-surface)] mb-2">
          Welcome to WhatNow?
        </h1>
        <p className="text-[var(--color-m3-on-surface-variant)] mb-8">
          Sign in to save your watch history across all your devices.
        </p>
        
        <div className="space-y-4">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 hover:bg-gray-50 py-4 px-6 rounded-full font-medium transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
