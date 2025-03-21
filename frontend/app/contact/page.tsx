// Make this a server component
export default function ContactPage() {
  return (
    <main className="contact-page">
      <h1>Contact Us</h1>
      <p>We'd love to hear from you!</p>
      
      {/* Client component loaded with dynamic import */}
      <div className="contact-form-container">
        <ClientContactForm />
      </div>
    </main>
  );
}

// Use dynamic import with ssr:false
import dynamic from 'next/dynamic';

const ClientContactForm = dynamic(
  () => import('./ClientContactForm'),
  { ssr: false }
); 