import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import BackgroundLayer from "@/components/shell/BackgroundLayer";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Finby - Masuk",
  description: "  Halaman Login",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <BackgroundLayer />
          {children}
        </Providers>
      </body>
    </html>
  );
}
