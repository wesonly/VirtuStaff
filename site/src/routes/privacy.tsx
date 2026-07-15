import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "~/components/shared";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-6 py-24 sm:py-32">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Last updated: July 15, 2026
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              1. Introduction
            </h2>
            <p>
              VirtuStaff ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our AI workforce platform services.
            </p>
            <p className="mt-2">
              By accessing or using our Service, you agree to the terms of this Privacy Policy. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              2. Information We Collect
            </h2>
            <h3 className="mb-1 mt-4 font-medium text-gray-900 dark:text-white">Personal Information</h3>
            <p>
              We may collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
              <li>Sign up for our waitlist or early access program</li>
              <li>Create an account or register for our Service</li>
              <li>Subscribe to our newsletter or marketing communications</li>
              <li>Contact us for support or inquiries</li>
              <li>Participate in surveys or feedback requests</li>
            </ul>
            <p className="mt-2">
              This information may include your name, email address, phone number, company name, and billing information.
            </p>

            <h3 className="mb-1 mt-4 font-medium text-gray-900 dark:text-white">Usage Data</h3>
            <p>
              We automatically collect certain information when you visit our website or use our Service, including your IP address, browser type, operating system, referring URLs, pages viewed, and the dates/times of your visits.
            </p>

            <h3 className="mb-1 mt-4 font-medium text-gray-900 dark:text-white">AI Employee Data</h3>
            <p>
              When you use our AI employees, we process data related to calls, messages, emails, and other interactions handled by the AI. This data is processed solely to provide the Service and is stored securely.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              3. How We Use Your Information
            </h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
              <li>To provide, operate, and maintain our Service</li>
              <li>To process your subscription and billing</li>
              <li>To send you technical notices, updates, and support messages</li>
              <li>To respond to your comments, questions, and requests</li>
              <li>To monitor and analyze usage trends and improve the Service</li>
              <li>To detect, prevent, and address technical issues and fraud</li>
              <li>To send marketing communications (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              4. Cookies and Tracking Technologies
            </h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our Service and hold certain information. Cookies are files with small amounts of data that may include an anonymous unique identifier.
            </p>
            <p className="mt-2">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
            </p>
            <p className="mt-2">
              We use the following types of cookies:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
              <li><strong>Essential cookies:</strong> Required for the operation of our Service</li>
              <li><strong>Analytics cookies:</strong> Help us understand how visitors interact with our website</li>
              <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              5. Third-Party Services
            </h2>
            <p>
              We may employ third-party companies and individuals to facilitate our Service, provide the Service on our behalf, or assist us in analyzing how our Service is used. These third parties have access to your personal information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>
            <p className="mt-2">
              We may integrate with third-party services that you use (such as CRMs, calendar apps, and communication tools). When you connect these services, we will access and process data as authorized by you.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              6. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              7. Data Retention
            </h2>
            <p>
              We will retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, or as required by law. When we no longer need your information, we will delete or anonymize it.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              8. Your Rights
            </h2>
            <p>Depending on your jurisdiction, you may have the following rights:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
              <li>The right to access your personal information</li>
              <li>The right to correct inaccurate information</li>
              <li>The right to delete your information</li>
              <li>The right to restrict or object to processing</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, please contact us at privacy@virtustaff.ai.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              9. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              10. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <p className="mt-2">
              Email: privacy@virtustaff.ai
              <br />
              Address: VirtuStaff Inc., 100 Innovation Drive, San Francisco, CA 94105
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}