"use client";

/**
 * GOOGLE ADSENSE COMPONENT
 * ═════════════════════════
 * Drop this into any page section to show ads.
 *
 * SETUP:
 * 1. Apply at https://www.google.com/adsense
 * 2. Get your publisher ID (ca-pub-XXXXXXXXXX)
 * 3. Add the script to layout.js <head>
 * 4. Replace PUBLISHER_ID below
 * 5. Create ad units in AdSense dashboard
 * 6. Replace AD_SLOT with your ad unit ID
 *
 * TIP: Apply for AdSense ASAP — approval takes 2-14 days.
 * You need some content on the site first.
 */

const PUBLISHER_ID = "ca-pub-XXXXXXXXXX"; // Replace with your ID
const AD_SLOT = "XXXXXXXXXX"; // Replace with your ad slot

export function AdBanner({ style = {} }) {
  // Don't render until AdSense is configured
  if (PUBLISHER_ID.includes("XXXX")) {
    return null;
  }

  return (
    <div style={{ textAlign: "center", margin: "16px 0", ...style }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

export function AdSidebar({ style = {} }) {
  if (PUBLISHER_ID.includes("XXXX")) {
    return null;
  }

  return (
    <div style={{ ...style }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={AD_SLOT}
        data-ad-format="vertical"
      />
    </div>
  );
}

/**
 * Add this to your layout.js <head> when AdSense is approved:
 *
 * <Script
 *   async
 *   src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUBLISHER_ID}`}
 *   crossOrigin="anonymous"
 *   strategy="afterInteractive"
 * />
 */
