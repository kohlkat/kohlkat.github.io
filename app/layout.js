import "./globals.css";

export const metadata = {
  title: {
    default: "SAGE Suite | Assurance-First Manufacturing Intelligence",
    template: "%s | SAGE Suite",
  },
  description:
    "SAGE Suite is an assurance-first manufacturing intelligence platform for evidence-linked CNC process planning.",
  keywords: [
    "manufacturing intelligence",
    "CNC process planning",
    "manufacturing AI",
    "assurance",
    "Pittsburgh",
  ],
  openGraph: {
    title: "SAGE Suite",
    description:
      "Complete process planning, bounded by evidence and human approval.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
