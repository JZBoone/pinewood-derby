import { Archivo, Atkinson_Hyperlegible } from 'next/font/google';

export const heading = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-heading',
  display: 'swap',
});

export const body = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
});
