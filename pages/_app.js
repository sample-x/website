import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Handle navigation at application level
function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  useEffect(() => {
    // This function handles all link clicks globally
    const handleLinkClicks = (e) => {
      // Find the closest link element
      let target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }
      
      // If we found a link
      if (target && target.tagName === 'A') {
        const href = target.getAttribute('href');
        
        // Only handle internal links
        if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#') && !href.startsWith('mailto:')) {
          e.preventDefault();
          console.log('App-level routing to:', href);
          
          // Use Next.js router for navigation
          router.push(href);
          return false;
        }
      }
    };
    
    // Add the global event listener
    document.addEventListener('click', handleLinkClicks);
    
    // Clean up the event listener on unmount
    return () => {
      document.removeEventListener('click', handleLinkClicks);
    };
  }, [router]);
  
  return <Component {...pageProps} />;
}

export default MyApp; 