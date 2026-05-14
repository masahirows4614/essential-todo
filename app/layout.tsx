import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Essential Flow — 本当に大切なことに、集中する",
  description:
    "やるべきこと（Must）とやってもいいこと（Optional）を直感的に見分けられるToDo。",
};

export const viewport: Viewport = {
  themeColor: "#eceef9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
