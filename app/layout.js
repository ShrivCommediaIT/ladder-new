import './globals.css';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';
import { Inter, Ubuntu, Roboto } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const ubuntu = Ubuntu({
  subsets: ['latin'],
  variable: '--font-ubuntu',
  weight: ['300', '400', '500', '700'],
  display: 'swap',
});

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  weight: ['100', '300', '400', '500', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata = {
  title: "Sports Solutions Pro - Sports Competition Platform",
  description: "Run automated ladders, mini-leagues, live rankings, challenge boards, and international competitions for sports clubs, academies, schools, and organizations.",
  alternates: {
    canonical: "https://sportssolutionspro.com",
  },
  keywords: [
    "sports competition platform",
    "club competition manager",
    "automated sports ladders",
    "sports league software",
    "tennis ladder app",
    "badminton ladder builder",
    "sports rankings tracking",
    "coaching challenge boards",
    "grassroots sports engagement",
    "sports solutions pro"
  ],
  authors: [{ name: "Sports Solutions Pro" }],
  robots: "index, follow",
  openGraph: {
    title: "Sports Solutions Pro - Sports Competition Platform",
    description: "The smart way to run automated ladders, mini-leagues, live rankings, and challenge boards for modern sports clubs and academies.",
    url: "https://sportssolutionspro.com",
    siteName: "Sports Solutions Pro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sports Solutions Pro - Sports Competition Platform",
    description: "Run automated ladders, mini-leagues, live rankings, and challenge boards for modern sports clubs and academies.",
  }
};

const schemaData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://sportssolutionspro.com/#organization",
      "name": "Sports Solutions Pro",
      "url": "https://sportssolutionspro.com",
      "logo": "https://sportssolutionspro.com/topLogo.png",
      "sameAs": [
        "https://www.facebook.com/profile.php?id=61580051563946",
        "https://www.instagram.com/sports_solutions_pro",
        "https://x.com/Sports_Sol_Pro",
        "https://www.youtube.com/@sportssolutionspro",
        "https://www.linkedin.com/company/sports-solutions-pro/"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://sportssolutionspro.com/#website",
      "url": "https://sportssolutionspro.com",
      "name": "Sports Solutions Pro",
      "description": "Run automated ladders, mini-leagues, live rankings, and challenge boards for sports clubs, academies, schools, and organizations.",
      "publisher": {
        "@id": "https://sportssolutionspro.com/#organization"
      }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://sportssolutionspro.com/#software",
      "name": "Sports Solutions Pro",
      "applicationCategory": "SportsApplication",
      "operatingSystem": "All",
      "url": "https://sportssolutionspro.com",
      "publisher": {
        "@id": "https://sportssolutionspro.com/#organization"
      },
      "offers": {
        "@type": "Offer",
        "price": "24.00",
        "priceCurrency": "GBP"
      }
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${ubuntu.variable} ${roboto.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </head>
      <body>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
