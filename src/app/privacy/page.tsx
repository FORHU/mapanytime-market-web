import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How MapAnytime collects, uses, and protects your data.",
};

const LAST_UPDATED = "September 16, 2026";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)] md:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-[var(--text-tertiary)]">
        Last updated: {LAST_UPDATED}
      </p>

      <p className="mt-8 text-sm leading-6 text-[var(--text-secondary)]">
        MapAnytime (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates the MapAnytime
        website, mobile app, and merchant tools (together, the
        &ldquo;Service&rdquo;) &mdash; a platform that lets independent shops
        list on a live map and lets buyers reserve items online for local
        pickup. This policy explains what information we collect, why, and the
        choices you have. We built the Service for the Philippine market and aim
        to meet the Data Privacy Act of 2012 (RA 10173).
      </p>

      <Section title="1. Information we collect">
        <p>
          <strong className="text-[var(--text-primary)]">
            Account information.
          </strong>{" "}
          Email address, first/last/middle name, phone number, and country when
          you register, whether directly or by continuing with Google or
          Facebook / Meta (in which case we receive your name, email address,
          profile picture, and the account ID that provider assigns you).
        </p>
        <p>
          <strong className="text-[var(--text-primary)]">
            Facebook / Meta Platform Data.
          </strong>{" "}
          When you sign in using Facebook Login, we only request standard
          permissions (such as your public profile and email address) necessary
          to create and authenticate your account. We do not sell, rent, or
          transfer Facebook user data to data brokers or advertising networks.
          We process this data strictly in accordance with Meta&rsquo;s Platform
          Terms and Developer Policies.
        </p>
        <p>
          <strong className="text-[var(--text-primary)]">
            Seller verification documents.
          </strong>{" "}
          If you register as a seller, we collect government-issued ID, TIN, and
          business permits (DTI, Mayor&rsquo;s Permit, BIR, or SEC certificates,
          as applicable) to verify your business before your store goes live.
        </p>
        <p>
          <strong className="text-[var(--text-primary)]">
            Buyer &amp; order information.
          </strong>{" "}
          Delivery/pickup contact name, phone number, and address (for buyer
          profiles that save one), plus order history &mdash; items, amounts,
          and pickup times.
        </p>
        <p>
          <strong className="text-[var(--text-primary)]">
            Payment information.
          </strong>{" "}
          We never see or store your card or bank account numbers. Payments are
          processed by PayMongo and Xendit; we only keep their transaction
          reference, status, and amount.
        </p>
        <p>
          <strong className="text-[var(--text-primary)]">Location.</strong> With
          your permission, we use your device&rsquo;s approximate location to
          center the live map on nearby stores. Store/seller addresses are
          stored so they can be shown as pins on the map.
        </p>
        <p>
          <strong className="text-[var(--text-primary)]">
            Photos and files.
          </strong>{" "}
          Profile pictures, product photos, and (for sellers) verification
          documents that you upload, stored on Amazon S3.
        </p>
        <p>
          <strong className="text-[var(--text-primary)]">
            Usage information.
          </strong>{" "}
          Pages viewed, searches, and similar interactions, together with IP
          address and browser/device information, to keep the Service reliable
          and to understand what&rsquo;s useful.
        </p>
      </Section>

      <Section title="2. How we use your information">
        <ul className="list-disc space-y-2 pl-5">
          <li>Create and secure your account, and sign you in.</li>
          <li>Verify sellers before a store can list products publicly.</li>
          <li>Process orders, payments, refunds, and pickups.</li>
          <li>Show nearby stores and products on the live map.</li>
          <li>
            Send transactional email &mdash; order updates, password resets, and
            similar account notices.
          </li>
          <li>
            Detect fraud, abuse, and keep the Service secure and available.
          </li>
          <li>Understand usage patterns to improve the Service.</li>
        </ul>
        <p>
          We do not sell your personal information, and we do not use
          advertising or tracking cookies &mdash; only the storage strictly
          needed to keep you signed in.
        </p>
      </Section>

      <Section title="3. Who we share information with">
        <p>
          We share information only where it&rsquo;s needed to run the Service:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-[var(--text-primary)]">
              Sellers and buyers,
            </strong>{" "}
            with each other, as needed to fulfill an order (e.g. a seller sees
            the buyer&rsquo;s pickup name and contact number for their own
            orders).
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">
              PayMongo and Xendit,
            </strong>{" "}
            to process payments.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">
              Amazon Web Services,
            </strong>{" "}
            for hosting, database, and file storage.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Mapbox,</strong> to
            render the live map.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">
              Google or Facebook,
            </strong>{" "}
            only if you choose to sign in with one of them.
          </li>
          <li>Law enforcement or regulators, only when required by law.</li>
        </ul>
      </Section>

      <Section title="4. Data retention">
        <p>
          We keep account and order data for as long as your account is active
          and as needed to meet tax, accounting, and legal obligations. Seller
          verification documents are retained for the life of the seller
          relationship plus the period required by applicable law. You can
          request deletion at any time &mdash; see{" "}
          <a
            href="/data-deletion"
            className="font-semibold text-[var(--brand-core)] hover:underline"
          >
            Data Deletion
          </a>
          .
        </p>
      </Section>

      <Section title="5. Security">
        <p>
          Passwords are never stored in plain text &mdash; we store a salted
          PBKDF2 hash. Sessions can be revoked at any time by signing out, and a
          password reset signs you out of every device. Files are stored in
          access-controlled cloud storage. No method of transmission or storage
          is 100% secure, but we design the Service to fail closed rather than
          leak data by default.
        </p>
      </Section>

      <Section title="6. Your rights">
        <p>
          Under the Data Privacy Act of 2012, you have the right to be informed,
          to access your data, to object to processing, to correct inaccurate
          data, and to request erasure or blocking of your data. To exercise any
          of these, email{" "}
          <a
            href="mailto:support@forhu.ai"
            className="font-semibold text-[var(--brand-core)] hover:underline"
          >
            support@forhu.ai
          </a>{" "}
          or see{" "}
          <a
            href="/data-deletion"
            className="font-semibold text-[var(--brand-core)] hover:underline"
          >
            Data Deletion
          </a>
          .
        </p>
      </Section>

      <Section title="7. Children">
        <p>
          The Service is not directed at children under 18. We do not knowingly
          collect personal information from children.
        </p>
      </Section>

      <Section title="8. Changes to this policy">
        <p>
          We&rsquo;ll update the date at the top of this page when this policy
          changes, and post the updated version here.
        </p>
      </Section>

      <Section title="9. Contact us">
        <p>
          Questions about this policy or how your data is handled:{" "}
          <a
            href="mailto:support@forhu.ai"
            className="font-semibold text-[var(--brand-core)] hover:underline"
          >
            support@forhu.ai
          </a>
        </p>
      </Section>
    </main>
  );
}
