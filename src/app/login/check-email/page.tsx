import Link from "next/link"

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen bg-black px-3 py-20 lg:px-4">
      <div className="mx-auto max-w-md">
        <div className="block-hover rounded-2xl border-[3px] border-black bg-[#28D17C] p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-black bg-white">
            <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h1 className="font-heading text-[2rem] leading-[0.85] tracking-[-0.03em] text-black" style={{ fontWeight: 900 }}>
            CHECK YOUR EMAIL
          </h1>
          <p className="mt-4 text-[14px] font-medium text-black">
            We sent you a magic link to sign in.
          </p>
          <p className="mt-2 text-[13px] text-black/70">
            Click the link in the email to continue. The link expires in 24 hours.
          </p>
          <Link 
            href="/login"
            className="mt-6 inline-flex h-10 items-center rounded-full border-[3px] border-black bg-white px-5 text-[10px] font-black uppercase tracking-wider text-black transition-transform duration-200 hover:-translate-y-0.5"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
