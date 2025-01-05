export default function PrivacyPolicy() {
  return (
    <div className="container max-w-4xl mx-auto p-4 prose dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2>Introduction</h2>
      <p>This Privacy Policy describes how we collect, use, and handle your information when you use our time tracking application.</p>
      
      <h2>Information We Collect</h2>
      <ul>
        <li>Authentication information when you sign in with Google</li>
        <li>Time tracking data that you create while using the application</li>
        <li>Usage information to improve our service</li>
      </ul>
      
      <h2>How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide and maintain our service</li>
        <li>Improve and personalize your experience</li>
        <li>Communicate with you about your account or our service</li>
      </ul>
      
      <h2>Data Security</h2>
      <p>We implement appropriate security measures to protect your personal information using industry standards.</p>
      
      <h2>Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, please contact us.</p>
    </div>
  );
}