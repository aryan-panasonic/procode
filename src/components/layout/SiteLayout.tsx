import Header from "./Header";
import Footer from "./Footer";
import ChatWidget from "../chatbot/ChatWidget";

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
       <ChatWidget />
    </>
  );
}