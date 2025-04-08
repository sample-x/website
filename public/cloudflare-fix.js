// Fix for static export navigation in Cloudflare Pages
(function() {
  console.log('Running Cloudflare Pages navigation fix script - IMMEDIATE VERSION');

  // Function to apply fixes
  function applyFixes() {
    console.log('Applying navigation fixes');
    
    // Fix ALL links on the page more aggressively
    document.addEventListener('click', function(e) {
      // Find the closest anchor tag
      let target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }
      
      // If we found an anchor tag
      if (target && target.tagName === 'A') {
        const href = target.getAttribute('href');
        
        // Only handle internal links
        if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#')) {
          console.log('Intercepted click on link to:', href);
          e.preventDefault();
          e.stopPropagation();
          
          // Force navigation
          window.location.href = href;
          return false;
        }
      }
    }, true); // Use capture phase to get events before they're handled
    
    // Fix map interactions
    function fixMapInteractions() {
      const mapContainer = document.querySelector('.leaflet-container');
      if (!mapContainer) {
        console.log('No map container found yet, will retry');
        return false;
      }
      
      console.log('Map container found, adding popup handlers');
      
      // Add global click handler for map markers
      document.addEventListener('click', function(e) {
        const target = e.target;
        
        // Check if click is on or within a marker
        if (target.classList.contains('leaflet-marker-icon') || 
            target.closest('.leaflet-marker-icon')) {
          console.log('Marker clicked');
          
          // Wait for popup to appear
          setTimeout(() => {
            const popup = document.querySelector('.leaflet-popup-content');
            if (popup) {
              const button = popup.querySelector('button');
              if (button) {
                console.log('Triggering details button click');
                button.click();
              }
            }
          }, 100);
        }
      }, true);
      
      return true;
    }
    
    // Try to fix map right away
    if (!fixMapInteractions()) {
      // Retry a few times
      let attempts = 0;
      const maxAttempts = 10;
      const interval = setInterval(() => {
        attempts++;
        if (fixMapInteractions() || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 500);
    }
  }
  
  // Apply fixes immediately
  applyFixes();
  
  // Also run on DOMContentLoaded to ensure we catch everything
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFixes);
  }
  
  // And once more after everything is loaded
  window.addEventListener('load', applyFixes);
})(); 