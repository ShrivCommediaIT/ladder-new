import './globals.css';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';

export const metadata = {
  title: "Sports Solutions Pro",
  description: "The #1 platform for sports clubs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
