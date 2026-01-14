import styles from './PrivacyPolicyPage.module.scss';

export function PrivacyPolicyPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last Updated: January 14, 2026</p>

        <section className={styles.section}>
          <h2>1. Introduction</h2>
          <p>
            Welcome to our real estate platform. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Information We Collect</h2>
          <h3>2.1 Personal Information</h3>
          <p>When you use our services, we may collect the following information:</p>
          <ul>
            <li>Name and contact information (email address, phone number)</li>
            <li>Account credentials</li>
            <li>Profile information</li>
            <li>Property search preferences and saved searches</li>
            <li>Favorite properties and listings</li>
          </ul>

          <h3>2.2 Information from Third-Party Services</h3>
          <p>
            When you sign in using Facebook or other third-party authentication services, we may receive:
          </p>
          <ul>
            <li>Your name</li>
            <li>Email address</li>
            <li>Profile picture</li>
            <li>Public profile information as permitted by your privacy settings</li>
          </ul>

          <h3>2.3 Automatically Collected Information</h3>
          <p>We automatically collect certain information about your device, including:</p>
          <ul>
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>Pages visited and time spent on pages</li>
            <li>Referring website addresses</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Create and manage your account</li>
            <li>Process your property searches and save your preferences</li>
            <li>Send you property alerts and notifications</li>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Analyze usage patterns and improve user experience</li>
            <li>Comply with legal obligations</li>
            <li>Prevent fraud and ensure security</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Information Sharing and Disclosure</h2>
          <p>We do not sell your personal information. We may share your information with:</p>
          <ul>
            <li><strong>Service Providers:</strong> Third-party companies that help us operate our platform (hosting, analytics, email services)</li>
            <li><strong>Property Owners/Agents:</strong> When you inquire about a property</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>5. Facebook Login</h2>
          <p>
            When you choose to log in with Facebook, we use Facebook&apos;s authentication services. We only request access to basic profile information necessary for account creation. You can manage the information Facebook shares with us through your Facebook privacy settings.
          </p>
          <p>
            We do not post to your Facebook timeline or access your friends list without your explicit permission.
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. Data Storage and Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your data is stored securely using industry-standard encryption.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. Your Rights and Choices</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your personal information</li>
            <li>Opt-out of marketing communications</li>
            <li>Withdraw consent for data processing where applicable</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>8. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookies through your browser settings.
          </p>
        </section>

        <section className={styles.section}>
          <h2>9. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to provide our services and comply with legal obligations. You can request deletion of your account and associated data at any time.
          </p>
        </section>

        <section className={styles.section}>
          <h2>10. Children&apos;s Privacy</h2>
          <p>
            Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
          </p>
        </section>

        <section className={styles.section}>
          <h2>11. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
          </p>
        </section>

        <section className={styles.section}>
          <h2>12. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact us at:
          </p>
          <p>
            <strong>Email:</strong>ruslannikolov1@gmail.com<br />
            <strong>Address:</strong> Burgas, Bulgaria
          </p>
        </section>
      </div>
    </div>
  );
}
