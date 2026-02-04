import "../globals.css";

export default function UnauthLayout({ children }: Readonly<{ children: React.ReactNode }>): React.ReactElement {

  return (
    <>
      {children}
    </>
  );
}
