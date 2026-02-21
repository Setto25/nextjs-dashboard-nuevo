'use client';

import '@/app/ui/global.css'
import { inter, monserrat } from "@/app/ui/fonts";
import { NotesProvider } from './context/notecontext';
import { Analytics } from "@vercel/analytics/next"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        
       <NotesProvider>
       {children}
       </NotesProvider>
         <Analytics />
        </body>
    </html>
  );
}

