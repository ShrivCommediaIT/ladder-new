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
  title: "Sports Solutions Pro - Sports Competition Platform for Clubs & Coaches",
  description: "Run automated ladders, mini-leagues, live rankings, challenge boards, and international competitions for sports clubs, academies, schools, and organizations.",
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${ubuntu.variable} ${roboto.variable}`} suppressHydrationWarning>
      <body>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
