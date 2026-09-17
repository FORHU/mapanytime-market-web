import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Deletion",
  description: "How to request deletion of your MapAnytime data.",
};

export default function DataDeletionPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)] md:text-4xl">
        Data Deletion
      </h1>

      <p className="mt-6 text-sm leading-6 text-[var(--text-secondary)]">
        You can request that MapAnytime delete your account and personal data at
        any time, including if you signed up using Google or Facebook.
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          How to request deletion
        </h2>
        <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-6 text-[var(--text-secondary)]">
          <li>
            Email{" "}
            <a
              href="mailto:support@forhu.ai?subject=Data%20Deletion%20Request"
              className="font-semibold text-[var(--brand-core)] hover:underline"
            >
              support@forhu.ai
            </a>{" "}
            from the email address on your MapAnytime account, with the subject
            &ldquo;Data Deletion Request&rdquo;.
          </li>
          <li>
            We&rsquo;ll reply to confirm we&rsquo;ve received your request and
            may ask you to verify your identity, so nobody else can delete your
            account on your behalf.
          </li>
          <li>
            We&rsquo;ll delete your account and personal data within 30 days,
            and confirm once it&rsquo;s done.
          </li>
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          What we keep
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          Some records &mdash; completed order and payment history in particular
          &mdash; must be retained for the period required by Philippine tax and
          accounting law, even after account deletion. Where that applies, we
          remove what identifies you personally and keep only what the law
          requires us to keep.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          Facebook / Meta User Data Deletion Instructions
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          In compliance with Meta Platform Terms and Policies, MapAnytime
          provides a clear way for users to request deletion of their Facebook
          platform data. If you want to remove your activities and associated
          Facebook data from MapAnytime:
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-[var(--text-secondary)]">
          <li>
            Go to your Facebook profile&rsquo;s{" "}
            <strong>Settings &amp; Privacy</strong> &rarr;{" "}
            <strong>Settings</strong>.
          </li>
          <li>
            Navigate to <strong>Apps and Websites</strong> to view all apps
            linked to your Facebook account.
          </li>
          <li>
            Find <strong>MapAnytime</strong> in the list and click{" "}
            <strong>Remove</strong>.
          </li>
          <li>
            (Optional) You may check the box to delete all posts, videos, or
            events MapAnytime may have published on your behalf, then click{" "}
            <strong>Remove</strong>.
          </li>
          <li>
            To also delete your MapAnytime account and stored records from our
            database, send an email to{" "}
            <a
              href="mailto:support@forhu.ai?subject=Meta%20Data%20Deletion%20Request"
              className="font-semibold text-[var(--brand-core)] hover:underline"
            >
              support@forhu.ai
            </a>{" "}
            with the subject &ldquo;Meta Data Deletion Request&rdquo;. We will
            purge your profile and associated data within 30 days.
          </li>
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          Disconnecting Google Sign-In
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          To revoke permissions granted through Google Sign-In, visit{" "}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--brand-core)] hover:underline"
          >
            Google Account Permissions
          </a>{" "}
          and remove MapAnytime.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          Questions
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          <a
            href="mailto:support@forhu.ai"
            className="font-semibold text-[var(--brand-core)] hover:underline"
          >
            support@forhu.ai
          </a>{" "}
          &mdash; see also our{" "}
          <a
            href="/privacy"
            className="font-semibold text-[var(--brand-core)] hover:underline"
          >
            Privacy Policy
          </a>
          .
        </p>
      </section>
    </main>
  );
}
