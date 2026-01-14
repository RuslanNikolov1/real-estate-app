import styles from './PrivacyPolicyPage.module.scss';

export function DataDeletionPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Data Deletion Instructions</h1>
        <p className={styles.lastUpdated}>Last Updated: January 14, 2026</p>

        <section className={styles.section}>
          <h2>How to Request Data Deletion</h2>
          <p>
            We respect your right to have your personal data deleted from our platform. You can request the deletion of your data at any time by following the instructions below.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Option 1: Delete Your Account</h2>
          <p>To permanently delete your account and all associated data:</p>
          <ol>
            <li>Log in to your account on our platform</li>
            <li>Navigate to Account Settings</li>
            <li>Click on &quot;Delete Account&quot;</li>
            <li>Confirm your deletion request</li>
          </ol>
          <p>
            Once you delete your account, all your personal information, saved searches, favorite properties, and preferences will be permanently removed from our system within 30 days.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Option 2: Request Data Deletion via Email</h2>
          <p>
            If you prefer, you can send a data deletion request to us via email:
          </p>
          <p>
            <strong>Email:</strong>ruslannikolov1@gmail.com<br />
            <strong>Subject:</strong> Data Deletion Request
          </p>
          <p>
            Please include the following information in your email:
          </p>
          <ul>
            <li>Your full name</li>
            <li>Email address associated with your account</li>
            <li>Confirmation that you want to delete all your data</li>
          </ul>
          <p>
            We will process your request within 30 days and send you a confirmation email once your data has been deleted.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Data Deletion for Facebook Login Users</h2>
          <p>
            If you signed up using Facebook Login, deleting your account on our platform will remove all data we collected from Facebook. However, to fully disconnect the app from your Facebook account:
          </p>
          <ol>
            <li>Go to your Facebook Settings</li>
            <li>Click on &quot;Apps and Websites&quot;</li>
            <li>Find our app in the list</li>
            <li>Click &quot;Remove&quot; to revoke our app&apos;s access</li>
          </ol>
          <p>
            This will prevent our app from accessing any future Facebook data, though you&apos;ll still need to request deletion of the data we&apos;ve already collected by following Option 1 or Option 2 above.
          </p>
        </section>

        <section className={styles.section}>
          <h2>What Data Will Be Deleted</h2>
          <p>When you request data deletion, we will permanently remove:</p>
          <ul>
            <li>Your account credentials and profile information</li>
            <li>Email address and contact information</li>
            <li>Saved property searches and preferences</li>
            <li>Favorite properties and saved listings</li>
            <li>Search history and activity logs</li>
            <li>Any information received from Facebook or other third-party login services</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Data Retention for Legal Purposes</h2>
          <p>
            Please note that we may retain certain information as required by law or for legitimate business purposes, such as:
          </p>
          <ul>
            <li>Transaction records for tax and accounting purposes</li>
            <li>Records needed to comply with legal obligations</li>
            <li>Information necessary to resolve disputes or enforce our terms</li>
          </ul>
          <p>
            Such information will be retained only for as long as legally required and will be securely stored.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Questions or Concerns</h2>
          <p>
            If you have any questions about data deletion or need assistance with the process, please contact us:
          </p>
          <p>
            <strong>Email:</strong>ruslannikolov1@gmail.com<br />
            <strong>Response Time:</strong> We typically respond within 48 hours
          </p>
        </section>

        <section className={styles.section}>
          <h2>Related Information</h2>
          <p>
            For more information about how we handle your personal data, please review our{' '}
            <a href="/privacy" className={styles.link}>Privacy Policy</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
