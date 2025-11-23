import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vision AI",
  description: "AI Assistant to help you understand and visualize images.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
