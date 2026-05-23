import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "product";
  twitterHandle?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
  googleSiteVerification?: string;
  noindex?: boolean;
}

const SEO = ({
  title = "Wellforged | The No Nonsense Supplement Brand",
  description = "Pure ingredients, zero fillers, and absolute clarity. Wellforged is the no nonsense supplement brand built on integrity and evidence.",
  canonical = "/",
  ogImage = "/Packaging_Updated.png",
  ogType = "website",
  twitterHandle = "@wellforged",
  jsonLd,
  googleSiteVerification = "uUXT8EOkidxG6y1nmQDFnmQYk6xex_vD_qgqY-AunuQ",
  noindex = false,
}: SEOProps) => {
  const siteName = "WellForged";
  const origin = "https://www.wellforged.in";
  const canonicalUrl = canonical.startsWith("http")
    ? canonical
    : `${origin}${canonical.startsWith("/") ? "" : "/"}${canonical}`;
  const ogImageUrl = ogImage.startsWith("http")
    ? ogImage
    : `${origin}${ogImage.startsWith("/") ? "" : "/"}${ogImage}`;
  
  // Title formatting: Append " | WellForged" if the title doesn't already contain it and isn't just "WellForged"
  const formattedTitle = title === siteName || title.includes(siteName) 
    ? title 
    : `${title} | ${siteName}`;

  // Organization Schema (Knowledge Graph support)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Wellforged",
    "url": origin,
    "logo": `${origin}/logo.png`,
    "sameAs": [
      "https://www.instagram.com/wellforged",
      "https://twitter.com/wellforged"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "hello@wellforged.in",
      "contactType": "customer service"
    }
  };

  const finalJsonLd = jsonLd 
    ? (Array.isArray(jsonLd) ? [organizationSchema, ...jsonLd] : [organizationSchema, jsonLd])
    : [organizationSchema];

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Google Search Console Verification */}
      <meta name="google-site-verification" content={googleSiteVerification} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}

      {/* Search Engine Directives */}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <meta name="googlebot" content={noindex ? "noindex, nofollow" : "index, follow"} />

      {/* Structured Data */}
      {finalJsonLd.map((ld, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(ld)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
