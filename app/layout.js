import "./globals.css";

export const metadata = {
  title: "Director AI | AI Video Pre-Production Planner",
  description:
    "A guided AI workflow prototype for planning video briefs, continuity, scene sequences, and generation-ready outputs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
