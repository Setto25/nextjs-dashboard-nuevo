import '@/app/ui/global.css'
import { inter, monserrat } from "@/app/ui/fonts";
import { NotesProvider } from './context/notecontext';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${monserrat.className} antialiased`}>
        
       <NotesProvider>
       {children}
       </NotesProvider>
        
        </body>
    </html>
  );
}

