import { Inter, Montserrat } from 'next/font/google';
import { Lusitana } from 'next/font/google';
 
export const inter = Inter({ subsets: ['latin'] });
export const lusitana = Lusitana({ weight:['400','700'], subsets:['latin'] });
export const monserrat=  Montserrat({   
    subsets: ['latin'],   
    weight: ['400', '500', '600', '700'],   
    display: 'swap' // Opcional: mejora rendimiento  
  });  
  