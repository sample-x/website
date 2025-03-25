import Link from 'next/link';
import Image from 'next/image';

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div className="flex-1 flex justify-center md:justify-start items-center">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo.png"
                alt="SampleX Logo"
                width={180}
                height={60}
                className="h-12 w-auto"
              />
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link href="/" className="text-gray-700 hover:text-orange-500">
                Home
              </Link>
              <Link href="/samples" className="text-gray-700 hover:text-orange-500">
                Samples
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-orange-500">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-orange-500">
                Demo
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 