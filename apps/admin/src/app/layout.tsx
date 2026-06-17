import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import I18nProvider from '@/components/layout/I18nProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SwissFarm Admin',
  description: 'Admin panel for SwissFarm',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}