import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | CreatorStays",
  robots: "noindex",
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white py-16 px-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-black mb-2">Privacy Policy</h1>
        <p className="text-sm text-black/60 mb-8">Last updated: January 2025</p>

        <div className="space-y-8 text-[15px] leading-relaxed text-black/80">
          <section>
            <h2 className="text-lg font-semibold text-black mb-3">What We Collect</h2>
            <p>
              When you create an account on CreatorStays, we collect your name and email address. 
              This information is required to create and manage your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black mb-3">Social Account Connections</h2>
            <p className="mb-3">
              You may optionally connect your Instagram or TikTok accounts to your CreatorStays profile. 
              When you do, we access only publicly available information from these platforms, including:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Your username</li>
              <li>Your follower count</li>
              <li>Your account type (personal, creator, or business)</li>
            </ul>
            <p className="mt-3 font-medium text-black">
              CreatorStays does not post content on your behalf and cannot take any actions on your social media accounts.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black mb-3">How We Use Your Data</h2>
            <p>We use your information to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li>Operate and maintain the CreatorStays platform</li>
              <li>Match content creators with vacation rental hosts</li>
              <li>Facilitate collaboration offers and communications between users</li>
              <li>Send account-related notifications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black mb-3">Data Sharing</h2>
            <p className="font-medium text-black">
              We do not sell your personal data to third parties.
            </p>
            <p className="mt-2">
              Your profile information may be visible to other users on the platform as part of 
              the normal operation of the service (for example, hosts can view creator profiles 
              when considering collaboration opportunities).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black mb-3">Data Retention and Deletion</h2>
            <p>
              We retain your data for as long as your account is active. You may request deletion 
              of your account and associated data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black mb-3">Contact Us</h2>
            <p>
              To request data deletion or ask questions about this policy, email us at:{" "}
              <a 
                href="mailto:support@creatorstays.com" 
                className="text-black font-medium underline underline-offset-2"
              >
                support@creatorstays.com
              </a>
            </p>
          </section>

          <section className="pt-4 border-t border-black/10">
            <p className="text-sm text-black/50">
              CreatorStays is operated by Wolfpup, Inc.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
