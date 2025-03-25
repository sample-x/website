import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Add your logo/brand here */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm px-3 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
} 