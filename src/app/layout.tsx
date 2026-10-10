import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from 'next-themes';
import EasterEggs from '@/components/easter-eggs';
import SiteFooter from '@/components/site-footer';
import { ToastProvider } from '@/components/toast';
import { body, heading } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Pack 272 Pinewood Derby',
    template: '%s · Pack 272 Derby',
  },
  description: "Let's go racing!",
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4efe2' },
    { media: '(prefers-color-scheme: dark)', color: '#132150' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${heading.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col antialiased">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
        >
          <ToastProvider>
            <div className="flex-1">{children}</div>
            <SiteFooter />
            <EasterEggs />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
