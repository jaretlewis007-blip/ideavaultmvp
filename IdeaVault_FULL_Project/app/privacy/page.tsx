export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-4xl font-bold text-gold mb-6">
        Privacy Policy
      </h1>

      <p className="text-gray-300 max-w-3xl leading-relaxed">
        This Privacy Policy explains how IdeaVault collects, uses, 
        stores, and protects your information when you use our platform. 
        By accessing IdeaVault, you agree to the terms described below.
      </p>

      <h2 className="text-2xl font-bold text-gold mt-10 mb-3">
        Information We Collect
      </h2>

      <ul className="text-gray-300 list-disc pl-8 max-w-3xl leading-8">
        <li>Account information (name, email, profile details)</li>
        <li>Uploaded ideas, files, and project information</li>
        <li>Messages and project room activity</li>
        <li>Marketplace listings and transactions</li>
        <li>Login logs and security data</li>
      </ul>

      <h2 className="text-2xl font-bold text-gold mt-10 mb-3">
        How We Use Your Information
      </h2>

      <ul className="text-gray-300 list-disc pl-8 max-w-3xl leading-8">
        <li>To operate and improve IdeaVault's services</li>
        <li>To protect intellectual property via NDAs</li>
        <li>To create secure project rooms and connections</li>
        <li>To process offers, deals, and collaborations</li>
        <li>To enhance security and prevent fraud</li>
      </ul>

      <h2 className="text-2xl font-bold text-gold mt-10 mb-3">
        Data Storage & Security
      </h2>

      <p className="text-gray-300 max-w-3xl leading-relaxed">
        All data is securely stored using industry-standard encryption 
        and security practices. IdeaVault does not sell user information 
        to third parties.
      </p>

      <h2 className="text-2xl font-bold text-gold mt-10 mb-3">
        Your Rights
      </h2>

      <ul className="text-gray-300 list-disc pl-8 max-w-3xl leading-8">
        <li>Access and update your information</li>
        <li>Delete your account or request data removal</li>
        <li>Control who sees your ideas and projects</li>
        <li>Full ownership of your uploaded content</li>
      </ul>

      <h2 className="text-2xl font-bold text-gold mt-10 mb-3">
        Contact Us
      </h2>

      <p className="text-gray-300 max-w-3xl">
        If you have questions about this Privacy Policy, 
        please contact us at:
        <br />
        <span className="text-gold font-semibold">
          support@ideavault.com
        </span>
      </p>

      <footer className="text-gray-500 mt-16 text-sm">
        © {new Date().getFullYear()} IdeaVault — All Rights Reserved
      </footer>
    </div>
  );
}
