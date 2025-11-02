import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import "./globals.css";

export const metadata = {
  title: "Blessed House Resort - Puerto Viejo",
  description:
    "Luxury bungalows and villas in Puerto Viejo, Limón. Experience tropical adventures and beachside relaxation.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}
