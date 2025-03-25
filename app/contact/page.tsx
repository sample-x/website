// Make this a server component
export default function Contact() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-6">We would love to hear from you!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Please contact us if you would like to test-drive Sample Exchange for your organization.
          </p>
        </div>
        
        {/* Client component loaded with dynamic import */}
        <div className="contact-form-container">
          <ClientContactForm />
        </div>
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