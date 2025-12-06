import "./globals.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "IdeaVault",
  description: "Secure Idea Collaboration Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">

        {/* Sidebar (left) */}
        <Sidebar />

        {/* Navbar (top) */}
        <Navbar />

        {/* Main content area */}
        <main className="pt-20 pl-72 p-6 min-h-screen">
          {children}
        </main>

      </body>
    </html>
  );
}
