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
  title: "Sports Solutions Pro",
  description: "The #1 platform for sports clubs",
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
