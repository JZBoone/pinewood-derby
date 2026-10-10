import { QRCodeSVG } from 'qrcode.react';

const SITE_ORIGIN = 'https://pinewood-derby.vercel.app';

interface SiteQrCodeProps {
  path: string;
  className?: string;
}

// Dark modules on white in both themes, since many scanners can't read an
// inverted code.
export default function SiteQrCode({ path, className }: SiteQrCodeProps) {
  const url = `${SITE_ORIGIN}${path}`;
  const host = SITE_ORIGIN.replace('https://', '');
  return (
    <div className={`flex items-center gap-5 ${className ?? ''}`}>
      <div className="shrink-0 rounded-[3px] border border-divider bg-white p-1.5">
        <QRCodeSVG
          value={url}
          size={112}
          fgColor="#15214a"
          bgColor="#ffffff"
          title={`QR code for ${host}${path}`}
        />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-bold tracking-[.12em] text-accent uppercase">
          Follow along
        </div>
        <p className="mt-1 font-(family-name:--font-heading) text-lg leading-snug font-semibold font-stretch-112%">
          Scan for live results on your phone
        </p>
        <a href={url} className="mt-1 inline-block text-sm">
          {host}
          <wbr />
          {path}
        </a>
      </div>
    </div>
  );
}
