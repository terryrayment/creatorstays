"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

const errorMessages: Record<string, string> = {
  Configuration: "There's a problem with the server configuration.",
  AccessDenied: "You don't have permission to sign in.",
  Verification: "The verification link has expired or has already been used.",
  OAuthSignin: "Could not start the sign-in process. Please try again.",
  OAuthCallback: "Could not complete sign-in. Please try again.",
  OAuthCreateAccount: "Could not create your account. Please try again.",
  EmailCreateAccount: "Could not create your account. Please try again.",
  Callback: "Could not complete sign-in. Please try again.",
  OAuthAccountNotLinked: "This email is already registered with a different sign-in method. Please use your original sign-in method.",
  EmailSignin: "Could not send the sign-in email. Please try again.",
  CredentialsSignin: "Invalid credentials. Please check your email and try again.",
  SessionRequired: "You need to be signed in to access this page.",
  Default: "Something went wrong. Please try again.",
}

export default function LoginErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") || "Default"
  const errorMessage = errorMessages[error] || errorMessages.Default

  return (
    <div className="min-h-screen bg-black px-3 py-20 lg:px-4">
      <div className="mx-auto max-w-md">
        <div className="block-hover rounded-2xl border-[3px] border-black bg-[#FF6B6B] p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-black bg-white">
            <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="font-heading text-[2rem] leading-[0.85] tracking-[-0.03em] text-black" style={{ fontWeight: 900 }}>
            SIGN IN ERROR
          </h1>
          <p className="mt-4 text-[14px] font-medium text-black">
            {errorMessage}
          </p>
          <Link 
            href="/login"
            className="mt-6 inline-flex h-10 items-center rounded-full border-[3px] border-black bg-white px-5 text-[10px] font-black uppercase tracking-wider text-black transition-transform duration-200 hover:-translate-y-0.5"
          >
            Try again
          </Link>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[12px] text-white/50">
            Still having trouble?{" "}
            <a href="mailto:support@creatorstays.com" className="font-bold text-white underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
