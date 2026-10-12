// JSX types for the design team's web components.
import type React from 'react';

type CustomElement = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
>;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'tent-scout': CustomElement;
      'finish-gate': CustomElement;
    }
  }
}
