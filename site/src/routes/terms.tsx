import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "~/components/shared";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-6 py-24 sm:py-32">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Last updated: July 15, 2026
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using VirtuStaff ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of the Terms, you may not access or use the Service.
            </p>
            <p className="mt-2">
              These Terms apply to all visitors, users, and others who access or use the Service ("Users"). If you are using the Service on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              2. Description of Service
            </h2>
            <p>
              VirtuStaff provides a platform that allows businesses to deploy specialized AI employees ("AI Employees") that handle tasks including but not limited to call handling, lead qualification, email and SMS communications, appointment scheduling, CRM integration, marketing content generation, and reporting.
            </p>
            <p className="mt-2">
              The Service is provided on a subscription basis, with features and limitations varying by plan as described on our website.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              3. Account Registration and Security
            </h2>
            <p>
              To use the Service, you must create an account. You agree to:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
              <li>Provide accurate, current, and complete registration information</li>
              <li>Maintain and update your account information as needed</li>
              <li>Keep your account credentials confidential and secure</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Be responsible for all activities that occur under your account</li>
            </ul>
            <p className="mt-2">
              You must be at least 18 years of age to use the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              4. Subscription and Billing
            </h2>
            <h3 className="mb-1 mt-4 font-medium text-gray-900 dark:text-white">Subscription Plans</h3>
            <p>
              The Service is offered on a monthly subscription basis. The features, limitations, and pricing for each plan are described on our website and may be updated from time to time.
            </p>

            <h3 className="mb-1 mt-4 font-medium text-gray-900 dark:text-white">Billing</h3>
            <p>
              By subscribing to the Service, you agree to pay the applicable subscription fees. Fees are billed in advance on a monthly basis and are non-refundable except as expressly stated in these Terms.
            </p>

            <h3 className="mb-1 mt-4 font-medium text-gray-900 dark:text-white">Payment Methods</h3>
            <p>
              We accept major credit cards and other payment methods as indicated on our website. You authorize us to charge your chosen payment method for all fees incurred.
            </p>

            <h3 className="mb-1 mt-4 font-medium text-gray-900 dark:text-white">Price Changes</h3>
            <p>
              We reserve the right to change our subscription fees upon 30 days' notice. Continued use of the Service after the fee change takes effect constitutes your acceptance of the new fees.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              5. Cancellation and Termination
            </h2>
            <h3 className="mb-1 mt-4 font-medium text-gray-900 dark:text-white">Cancellation by You</h3>
            <p>
              You may cancel your subscription at any time through your account settings or by contacting us. Cancellation takes effect at the end of your current billing period. You will not be charged for subsequent periods.
            </p>

            <h3 className="mb-1 mt-4 font-medium text-gray-900 dark:text-white">Termination by Us</h3>
            <p>
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, if you breach these Terms or if your use of the Service violates applicable law.
            </p>

            <h3 className="mb-1 mt-4 font-medium text-gray-900 dark:text-white">Effect of Termination</h3>
            <p>
              Upon termination, your right to use the Service will immediately cease. Your data will be retained for 30 days following termination, after which it may be deleted.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              6. Acceptable Use
            </h2>
            <p>You agree not to use the Service to:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Engage in deceptive, fraudulent, or misleading practices</li>
              <li>Transmit malicious software or harmful code</li>
              <li>Interfere with or disrupt the integrity of the Service</li>
              <li>Attempt to gain unauthorized access to the Service or its systems</li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              7. Intellectual Property
            </h2>
            <p>
              The Service, including its code, design, branding, and content, is owned by VirtuStaff and protected by intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the Service during your subscription period.
            </p>
            <p className="mt-2">
              You retain ownership of any data you provide or input into the Service. You grant us a license to process this data solely for the purpose of providing the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              8. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, in no event shall VirtuStaff, its affiliates, officers, directors, employees, or agents be liable for any indirect, punitive, incidental, special, consequential, or exemplary damages arising out of or in connection with your use of the Service.
            </p>
            <p className="mt-2">
              Our total liability for any claims under these Terms shall not exceed the amount you have paid us in the twelve (12) months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              9. Disclaimer of Warranties
            </h2>
            <p>
              The Service is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, secure, or free from viruses or other harmful components.
            </p>
            <p className="mt-2">
              We make no guarantees regarding the performance, accuracy, or reliability of AI Employees. AI outputs may contain errors or inaccuracies, and you are responsible for reviewing and verifying AI-generated content.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              10. Indemnification
            </h2>
            <p>
              You agree to indemnify and hold harmless VirtuStaff and its affiliates from any claims, damages, losses, liabilities, and expenses arising out of your use of the Service, your violation of these Terms, or your violation of any rights of a third party.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              11. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Continued use of the Service after changes take effect constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              12. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved in the courts of San Francisco County, California.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              13. Contact
            </h2>
            <p>
              For questions about these Terms, please contact us:
            </p>
            <p className="mt-2">
              Email: legal@virtustaff.ai
              <br />
              Address: VirtuStaff Inc., 100 Innovation Drive, San Francisco, CA 94105
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}