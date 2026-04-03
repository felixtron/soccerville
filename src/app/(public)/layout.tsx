import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { AnnouncementTicker } from "@/components/public/announcement-ticker";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnnouncementTicker />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
