import { QRCodeSVG } from 'qrcode.react';

const SITE_URL = 'https://pinewood-derby.vercel.app/';

// Dark modules on white in both themes, since many scanners can't read an
// inverted code.
export default function SiteQrCode() {
  return (
    <section className="mt-14 flex flex-col items-center gap-5 rounded-(--radius) border border-divider p-6 sm:flex-row sm:gap-8">
      <div className="shrink-0 rounded-[3px] bg-white p-2">
        <QRCodeSVG
          value={SITE_URL}
          size={152}
          fgColor="#15214a"
          bgColor="#ffffff"
          title="QR code for pinewood-derby.vercel.app"
        />
      </div>
      <div className="text-center sm:text-left">
        <div className="text-xs font-bold tracking-[.14em] text-accent uppercase">
          Follow along
        </div>
        <h2 className="mt-1 text-2xl font-semibold">Open on your phone</h2>
        <p className="mt-2 text-ink/72">
          Scan the code with your phone camera to see heats and results.
        </p>
        <a href={SITE_URL} className="mt-2 inline-block">
          pinewood-derby.vercel.app
        </a>
      </div>
    </section>
  );
}
