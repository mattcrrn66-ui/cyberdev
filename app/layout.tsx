// This component should ideally be placed in a shared components folder, e.g., components/Navbar.tsx

import Link from 'next/link';

// Define the navigation items in a reusable array for cleaner code
const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/live-tokens", label: "Live Tokens" },
  { href: "/directory", label: "Directory" },
  { href: "/dev-hub", label: "Dev Hub" },
  { href: "/community", label: "Community" },
  { href: "/whitepaper", label: "Whitepaper" },
  { href: "/roadmap", label: "Roadmap" },
];

// Assuming this navigation is part of a larger header component
export default function CyberDevNav() {
  // We're omitting the mobile menu toggle logic here for brevity, 
  // focusing on the desktop navigation structure.

  return (
    // <nav> tag is the correct semantic element for navigation
    <nav className="hidden lg:flex items-center space-x-6 text-sm">
      {NAV_ITEMS.map((item) => (
        <Link 
          key={item.href} 
          href={item.href} 
          // Use a utility function or state to determine if this link is currently active 
          // and apply the 'text-cyan-400' class for the active link.
          // For simplicity here, we assume no active state logic.
          className="text-slate-300 font-medium tracking-wide 
                     hover:text-cyan-400 
                     transition duration-200 
                     p-2 -m-2 rounded-lg" // Added padding for a larger click area
        >
          {item.label}
        </Link>
      ))}
    </nav>

    // --- You would typically wrap this in a full <header> element ---
    /*
    <header className="bg-slate-950/90 backdrop-blur-sm sticky top-0 z-50 shadow-lg border-b border-slate-800">
      <div className="container mx-auto flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-white">
          CyberDevToken
        </Link>
        <CyberDevNav /> 
        // Mobile Menu Button (omitted)
      </div>
    </header>
    */
  );
}