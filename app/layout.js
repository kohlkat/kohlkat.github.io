import "./globals.css";
import GoogleAnalytics from "./google-analytics";
import { siteOrigin } from "../lib/site";

const siteTitle = "SAGE Suite | Assurance-First Manufacturing Intelligence";
const siteDescription =
  "SAGE Suite is an assurance-first manufacturing intelligence platform with a reproducible public CNC-like simulation, evidence-linked planning, verification, and human approval.";
const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "form-action 'self'",
  "img-src 'self' data: https://www.google-analytics.com",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com",
  "upgrade-insecure-requests",
].join("; ");

export const metadata = {
  metadataBase: new URL(siteOrigin),
  applicationName: "SAGE Suite",
  title: {
    default: siteTitle,
    template: "%s | SAGE Suite",
  },
  description: siteDescription,
  category: "technology",
  authors: [
    {
      name: "David Kohler",
      url: "https://www.linkedin.com/in/david-kohler22",
    },
  ],
  creator: "David Kohler",
  publisher: "SAGE Suite",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: "SAGE Suite",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "SAGE Suite assurance flow for evidence-linked CNC process planning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/opengraph-image.png"],
  },
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
};

export const viewport = {
  themeColor: "#071115",
  colorScheme: "light",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta httpEquiv="Content-Security-Policy" content={contentSecurityPolicy} />
      </head>
      <body>
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
