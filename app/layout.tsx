import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/lib/store";
import { TripProvider } from "@/lib/trip-context";

// Use system fonts as fallback when Google Fonts can't be fetched
const fontVariables = "--font-geist-sans --font-geist-mono";

export const metadata: Metadata = {
  title: "HyperSpace - Collaborative Trip Planning",
  description: "A collaborative workspace for planning trips with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
            <TripProvider>
              {children}
            </TripProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
