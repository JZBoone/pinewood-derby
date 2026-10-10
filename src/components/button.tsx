import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'secondary' | 'primary' | 'danger' | 'ghost';

interface ButtonContentProps {
  icon?: LucideIcon;
  iconPosition?: 'start' | 'end';
  children: ReactNode;
}

function ButtonContent({
  icon: Icon,
  iconPosition = 'start',
  children,
}: ButtonContentProps) {
  const icon = Icon && <Icon size={16} strokeWidth={1.75} aria-hidden />;
  return (
    <>
      {iconPosition === 'start' && icon}
      {children}
      {iconPosition === 'end' && icon}
    </>
  );
}

export function buttonClassName(variant: ButtonVariant, className?: string) {
  return `btn btn-${variant} ${className ?? ''}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonContentProps & { variant?: ButtonVariant };

export default function Button({
  variant = 'secondary',
  icon,
  iconPosition,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName(variant, className)}
      {...props}
    >
      <ButtonContent icon={icon} iconPosition={iconPosition}>
        {children}
      </ButtonContent>
    </button>
  );
}

type ButtonLinkProps = ButtonContentProps & {
  href: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  title?: string;
  className?: string;
};

/**
 * A link styled as a button. When disabled it renders a non-interactive
 * span, since links can't be disabled.
 */
export function ButtonLink({
  href,
  variant = 'secondary',
  disabled,
  title,
  className,
  ...content
}: ButtonLinkProps) {
  if (disabled) {
    return (
      <span
        role="link"
        aria-disabled="true"
        title={title}
        className={buttonClassName(variant, className)}
      >
        <ButtonContent {...content} />
      </span>
    );
  }
  return (
    <Link
      href={href}
      title={title}
      className={buttonClassName(variant, className)}
    >
      <ButtonContent {...content} />
    </Link>
  );
}

export function ButtonSeparator() {
  return <span aria-hidden className="mx-1 h-7 w-px bg-divider" />;
}
