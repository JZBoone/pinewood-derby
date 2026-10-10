import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { body, heading } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pinewood Derby',
  description: "Let's go racing!",
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
      <body className="antialiased">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
