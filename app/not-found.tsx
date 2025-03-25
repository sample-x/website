import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404 - Page Not Found</h1>
        <p>We couldn't find the page you were looking for.</p>
        <Link href="/" className="not-found-link">
          Return Home
        </Link>
      </div>
    </div>
  );
} 