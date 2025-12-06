"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-black text-white min-h-screen">

      {/* HERO SECTION */}
      <section className="text-center pt-32 pb-20 px-6">
        <h1 className="text-5xl font-extrabold text-gold drop-shadow-lg">
          IdeaVault
        </h1>

        <p className="text-gray-300 mt-4 text-xl max-w-2xl mx-auto">
          Secure, protect, and grow your ideas with a full business ecosystem — 
          creators, investors, vendors, and lawyers all in one place.
        </p>

        <div className="mt-10 flex justify-center gap-6">
          <Link
            href="/auth/signup"
            className="bg-gold text-black px-8 py-3 rounded-xl font-bold hover:bg-yellow-500"
          >
            Get Started
          </Link>

          <Link
            href="/dashboard"
            className="bg-white/10 border border-gold px-8 py-3 rounded-xl font-bold hover:bg-white/20"
          >
            Explore Platform
          </Link>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="px-6 py-20 bg-white/5 border-t border-b border-gold/20">
        <h2 className="text-center text-3xl font-bold text-gold mb-10">
          Platform Features
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">

          {/* Feature 1 */}
          <div className="bg-white/10 p-6 rounded-xl border border-gold/20">
            <h3 className="text-xl font-bold text-gold">Creator Hub</h3>
            <p className="text-gray-300 mt-2">
              Upload ideas, store files, generate NDAs, and manage your innovation pipeline.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/10 p-6 rounded-xl border border-gold/20">
            <h3 className="text-xl font-bold text-gold">Marketplace</h3>
            <p className="text-gray-300 mt-2">
              Hire vendors, designers, developers, and service providers right inside IdeaVault.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/10 p-6 rounded-xl border border-gold/20">
            <h3 className="text-xl font-bold text-gold">Investor Hub</h3>
            <p className="text-gray-300 mt-2">
              Investors can browse ideas, send offers, negotiate, and open secure project rooms.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white/10 p-6 rounded-xl border border-gold/20">
            <h3 className="text-xl font-bold text-gold">Lawyer Hub</h3>
            <p className="text-gray-300 mt-2">
              Access legal professionals for contracts, NDAs, business formation, and more.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white/10 p-6 rounded-xl border border-gold/20">
            <h3 className="text-xl font-bold text-gold">Project Rooms</h3>
            <p className="text-gray-300 mt-2">
              Real-time chat, attachments, offer acceptance, and deal management.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white/10 p-6 rounded-xl border border-gold/20">
            <h3 className="text-xl font-bold text-gold">Secure NDAs</h3>
            <p className="text-gray-300 mt-2">
              Every idea is protected with built-in NDAs and encrypted storage.
            </p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-10 text-gray-400">
        © {new Date().getFullYear()} IdeaVault — All Rights Reserved
      </footer>
    </div>
  );
}
