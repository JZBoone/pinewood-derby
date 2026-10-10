// Red sits in the stripe, not the text, so it reads on both themes.
export default function ErrorMessage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div role="alert" className="border-l-4 border-cs-red pl-3">
      {children}
    </div>
  );
}
