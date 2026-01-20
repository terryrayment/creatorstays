import { Container } from "@/components/layout/container"

export const metadata = {
  title: "Terms and Conditions | CreatorStays",
  description: "Terms and Conditions for using CreatorStays platform.",
}

export default function TermsPage() {
  return (
    <section className="min-h-screen bg-white py-12 md:py-16">
      <Container>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold text-black mb-2">Terms and Conditions</h1>
          <p className="text-sm text-black/60 mb-8">Last updated: January 19, 2026</p>
          
          <div className="prose prose-sm max-w-none text-black/80 space-y-6">
            
            <section>
              <h2 className="text-lg font-bold text-black mt-8 mb-3">1. Agreement to Terms</h2>
              <p>By accessing or using CreatorStays (the "Platform"), operated by Wolfpup, a California S-Corporation ("Company," "we," "us," or "our"), you ("User," "you," or "your") agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you may not access or use the Platform.</p>
              <p>These Terms constitute a legally binding agreement between you and the Company. By creating an account, accessing the Platform, or using any of our services, you acknowledge that you have read, understood, and agree to be bound by these Terms.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black mt-8 mb-3">2. Company Information</h2>
              <p>CreatorStays is owned and operated by Wolfpup, a California S-Corporation. We are an independent company and are <strong>NOT affiliated with, endorsed by, sponsored by, or in any way officially connected with Airbnb, Inc., VRBO, Booking.com, or any other vacation rental platform</strong>. All trademarks, service marks, and trade names referenced on this Platform are the property of their respective owners.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black mt-8 mb-3">3. Platform Description</h2>
              <p>CreatorStays is a marketing platform that facilitates connections between vacation rental property owners/managers ("Hosts") and content creators ("Creators"). The Platform provides tools for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Hosts to list properties and discover creators</li>
                <li>Creators to showcase their profiles and receive collaboration offers</li>
                <li>Both parties to negotiate and manage collaborations</li>
                <li>Tracking affiliate link performance</li>
                <li>Processing payments between parties</li>
              </ul>
              <p><strong>We are a facilitator only.</strong> We do not own, operate, manage, or control any vacation rental properties. We do not employ or contract with any creators. We are not a party to any agreement between Hosts and Creators.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black mt-8 mb-3">4. Eligibility</h2>
              <p>To use the Platform, you must:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Be at least 18 years of age</li>
                <li>Have the legal capacity to enter into binding contracts</li>
                <li>Not be prohibited from using the Platform under applicable laws</li>
                <li>Provide accurate, current, and complete registration information</li>
                <li>If acting on behalf of a business entity, have authority to bind that entity to these Terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black mt-8 mb-3">5. Account Registration and Security</h2>
              <p>You are responsible for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Immediately notifying us of any unauthorized use of your account</li>
                <li>Ensuring all information you provide is accurate and up-to-date</li>
              </ul>
              <p>We reserve the right to suspend or terminate accounts that violate these Terms or for any other reason at our sole discretion.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black mt-8 mb-3">6. Fees and Payments</h2>
              <p><strong>Platform Fees:</strong> We charge a 15% platform fee to both Hosts and Creators on paid collaborations. Fees are subject to change with notice.</p>
              <p><strong>Payment Processing:</strong> Payments are processed through third-party payment processors (currently Stripe). By using our payment features, you also agree to the payment processor's terms of service.</p>
              <p><strong>PAYMENT DISCLAIMER:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>We are not responsible for payment delays, failures, or errors caused by payment processors, banks, or financial institutions</li>
                <li>We are not responsible for incorrect payment information provided by users</li>
                <li>We are not responsible for chargebacks, disputes, or fraud between users</li>
                <li>We do not guarantee the timing of any payments or payouts</li>
                <li>We reserve the right to withhold payments pending investigation of suspicious activity</li>
                <li>Refunds, if any, are at our sole discretion</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black mt-8 mb-3">7. User Conduct and Responsibilities</h2>
              <p>You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Violate any applicable laws, regulations, or third-party rights</li>
                <li>Provide false, misleading, or fraudulent information</li>
                <li>Impersonate any person or entity</li>
                <li>Harass, threaten, or harm other users</li>
                <li>Use the Platform for any illegal or unauthorized purpose</li>
                <li>Circumvent Platform fees or payment systems</li>
                <li>Scrape, crawl, or use automated means to access the Platform</li>
                <li>Interfere with the Platform's operation or security</li>
                <li>Upload viruses, malware, or harmful code</li>
                <li>Spam or send unsolicited communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black mt-8 mb-3">8. Host-Specific Terms</h2>
              <p>If you are a Host, you additionally agree that:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>You have the legal right to list and offer the properties you add to the Platform</li>
                <li>All property information and images you provide are accurate and not misleading</li>
                <li>You are solely responsible for the safety, legality, and condition of your properties</li>
                <li>You are solely responsible for compliance with all applicable laws, including tax obligations, licensing, and permits</li>
                <li>You are solely responsible for any agreements, payments, or disputes with Creators</li>
                <li>Any stay arrangements are directly between you and the Creator</li>
                <li>We are not responsible for Creator content, performance, or behavior</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black mt-8 mb-3">9. Creator-Specific Terms</h2>
              <p>If you are a Creator, you additionally agree that:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>All profile information, including follower counts and engagement metrics, is accurate</li>
                <li>You have the right to create and publish content as represented</li>
                <li>You will comply with all applicable advertising disclosure laws (including FTC guidelines)</li>
                <li>You are solely responsible for the content you create and publish</li>
                <li>You are solely responsible for tax obligations on earnings</li>
                <li>You are an independent contractor, not an employee of the Platform or any Host</li>
                <li>We are not responsible for Host behavior, property conditions, or payment disputes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black mt-8 mb-3">10. Content and Intellectual Property</h2>
              <p><strong>Your Content:</strong> You retain ownership of content you create. By uploading content to the Platform, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute that content for Platform operations and marketing.</p>
              <p><strong>Our Content:</strong> The Platform, including its design, features, and content, is owned by the Company and protected by intellectual property laws. You may not copy, modify, or distribute our content without permission.</p>
              <p><strong>Creator-Generated Content:</strong> Content created by Creators for Hosts is subject to the terms agreed upon between those parties. We make no claims to ownership of such content.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black mt-8 mb-3">11. Third-Party Services and Links</h2>
              <p>The Platform may integrate with or link to third-party services, including but not limited to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Payment processors (Stripe)</li>
                <li>Social media platforms (Instagram, TikTok, YouTube)</li>
                <li>Vacation rental platforms (Airbnb, VRBO)</li>
                <li>Analytics services</li>
              </ul>
              <p>We are not responsible for the availability, accuracy, content, or practices of third-party services. Your use of third-party services is at your own risk and subject to their terms.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black mt-8 mb-3">12. Disclaimers</h2>
              <p className="uppercase font-bold">THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT</li>
                <li>WARRANTIES THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE</li>
                <li>WARRANTIES REGARDING THE ACCURACY, RELIABILITY, OR COMPLETENESS OF ANY CONTENT</li>
                <li>WARRANTIES REGARDING THE CONDUCT OF ANY USERS</li>
              </ul>
              <p className="mt-4"><strong>WE SPECIFICALLY DISCLAIM ANY RESPONSIBILITY FOR:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>The quality, safety, or legality of any properties listed</li>
                <li>The accuracy of any user profiles, listings, or content</li>
                <li>The ability of Hosts to pay Creators or fulfill agreements</li>
                <li>The ability of Creators to deliver content or perform services</li>
                <li>Any disputes between Hosts and Creators</li>
                <li>Any injuries, damages, or losses occurring during property stays</li>
                <li>Any tax, legal, or regulatory compliance issues</li>
                <li>The performance or results of any marketing campaigns</li>
                <li>Lost profits, revenues, or business opportunities</li>
                <li>Data loss or security breaches</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black mt-8 mb-3">13. Limitation of Liability</h2>
              <p className="uppercase font-bold">TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL THE COMPANY, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
                <li>ANY LOSS OF PROFITS, REVENUES, DATA, OR GOODWILL</li>
                <li>ANY DAMAGES RESULTING FROM YOUR USE OR INABILITY TO USE THE PLATFORM</li>
                <li>ANY DAMAGES RESULTING FROM UNAUTHORIZED ACCESS TO YOUR ACCOUNT</li>
                <li>ANY DAMAGES RESULTING FROM THE CONDUCT OF THIRD PARTIES</li>
              </ul>
              <p className="mt-4 font-bold">IN ANY CASE, OUR TOTAL LIABILITY SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100).</p>
              <p className="mt-4">Some jurisdictions do not allow limitation of liability for certain damages. In such jurisdictions, our liability shall be limited to the maximum extent permitted by law.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black mt-8 mb-3">14. Indemnification</h2>
              <p>You agree to indemnify, defend, and hold harmless the Company and its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising from:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your use of the Platform</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Your content or listings</li>
                <li>Any agreement between you and another user</li>
                <li>Any dispute between you and another user</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black mt-8 mb-3">15. Dispute Resolution and Arbitration</h2>
              <p><strong>Informal Resolution:</strong> Before filing any formal claim, you agree to contact us and attempt to resolve the dispute informally for at least 30 days.</p>
              <p><strong>Binding Arbitration:</strong> Any dispute that cannot be resolved informally shall be resolved by binding arbitration administered by JAMS in accordance with its rules. The arbitration shall take place in California. The arbitrator's decision shall be final and binding.</p>
              <p><strong>Class Action Waiver:</strong> YOU AGREE THAT ANY CLAIMS MUST BE BROUGHT IN YOUR INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.</p>
              <p><strong>Exceptions:</strong> Either party may bring claims in small claims court if eligible. Either party may seek injunctive relief in court for intellectual property infringement.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black mt-8 mb-3">16. Governing Law</h2>
              <p>These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any legal action not subject to arbitration shall be brought exclusively in the state or federal courts located in California.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black mt-8 mb-3">17. Termination</h2>
              <p>We may terminate or suspend your account and access to the Platform at any time, for any reason, without notice or liability. You may terminate your account at any time by contacting us.</p>
              <p>Upon termination:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your right to use the Platform immediately ceases</li>
                <li>We may delete your account and data</li>
                <li>Outstanding payment obligations survive termination</li>
                <li>Sections regarding disclaimers, limitation of liability, indemnification, and arbitration survive termination</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black mt-8 mb-3">18. Privacy</h2>
              <p>Your use of the Platform is also governed by our Privacy Policy. By using the Platform, you consent to our collection, use, and disclosure of your information as described in the Privacy Policy.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black mt-8 mb-3">19. Modifications to Terms</h2>
              <p>We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on the Platform and updating the "Last updated" date. Your continued use of the Platform after changes constitutes acceptance of the modified Terms.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black mt-8 mb-3">20. General Provisions</h2>
              <p><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and the Company regarding the Platform.</p>
              <p><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions remain in effect.</p>
              <p><strong>Waiver:</strong> Our failure to enforce any right does not waive that right.</p>
              <p><strong>Assignment:</strong> You may not assign these Terms. We may assign these Terms without restriction.</p>
              <p><strong>Force Majeure:</strong> We are not liable for failures caused by circumstances beyond our reasonable control.</p>
              <p><strong>No Agency:</strong> Nothing in these Terms creates any agency, partnership, or employment relationship.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-black mt-8 mb-3">21. Contact Information</h2>
              <p>For questions about these Terms, please contact us at:</p>
              <p className="mt-2">
                <strong>Wolfpup</strong><br />
                Email: legal@creatorstays.com<br />
                California, USA
              </p>
            </section>

            <section className="mt-12 pt-8 border-t border-black/10">
              <p className="text-xs text-black/50">
                By using CreatorStays, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree, please do not use the Platform.
              </p>
            </section>

          </div>
        </div>
      </Container>
    </section>
  )
}
