import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import ModalProvider from "../providers/modal-provider";
import { Toaster } from "../components/ui/toaster";


export const metadata: Metadata = {
  title: "Webb",
  description: "Webb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ModalProvider>
            {children}
            <Toaster />
          </ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
