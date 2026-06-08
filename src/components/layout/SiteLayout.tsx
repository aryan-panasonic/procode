import Header from "./Header";
import Footer from "./Footer";

export default function SiteLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />

      <main>
        {children}
      </main>

      <Footer />
    </>
  );
}