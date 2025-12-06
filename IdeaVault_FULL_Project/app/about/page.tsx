export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-4xl font-bold text-gold mb-6">About IdeaVault</h1>

      <p className="text-gray-300 leading-relaxed max-w-3xl">
        IdeaVault is a secure collaboration platform designed to protect, 
        develop, and grow innovative ideas. Whether you're a creator, investor, 
        vendor, or legal professional, IdeaVault gives you the tools you need 
        to turn ideas into real business opportunities.
      </p>

      <p className="text-gray-300 mt-4 leading-relaxed max-w-3xl">
        With features such as NDAs, investor offers, project rooms, messaging, 
        vendor services, and legal support, IdeaVault connects all sides of the 
        business world into one powerful ecosystem. We believe every idea 
        deserves protection, ownership clarity, and a path to success.
      </p>

      <h2 className="text-2xl font-bold text-gold mt-10 mb-3">
        Our Mission
      </h2>

      <p className="text-gray-300 max-w-3xl">
        To empower creators and entrepreneurs by providing a secure, 
        professional environment where ideas can grow without fear of theft, 
        loss, or unfair deals.
      </p>

      <h2 className="text-2xl font-bold text-gold mt-10 mb-3">
        What Makes IdeaVault Unique
      </h2>

      <ul className="text-gray-300 list-disc pl-8 max-w-3xl leading-8">
        <li>Automatic NDA protection</li>
        <li>Idea-to-investor deal pipeline</li>
        <li>Secure project rooms with messaging</li>
        <li>Marketplace for hiring vendors</li>
        <li>Legal support built directly into the platform</li>
        <li>Wallet, payments, and full business workflow</li>
      </ul>

      <h2 className="text-2xl font-bold text-gold mt-10 mb-3">
        Our Vision
      </h2>

      <p className="text-gray-300 max-w-3xl">
        To become the #1 global platform for idea collaboration — 
        a place where anyone, anywhere, can turn their vision into a business.
      </p>

      <footer className="text-gray-500 mt-16 text-sm">
        © {new Date().getFullYear()} IdeaVault — All Rights Reserved
      </footer>
    </div>
  );
}
