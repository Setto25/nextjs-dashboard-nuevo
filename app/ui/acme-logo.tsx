import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';

export default function AcmeLogo() {  
  return (  
    <div  
      className={`${lusitana.className} flex flex-row items-center leading-none text-white w-full h-full `}  
    >  
      <Image   
        src="/UPC7.png"  
        width={250}  
        height={260}  
        alt='logo'  
        className="h-full max-w-[275px] max-h-full object-contain hidden md:block"   
      />  
      <Image   //imagen alternativa para cuando la spantalla son pequeñas
         src="/UPC2.png" 
        width={200}  
        height={200}  
        alt='logo'  
        className="h-full max-w-[275px] max-h-full object-contain block md:hidden "   
      />  

      
      {/*<GlobeAltIcon className="h-12 w-12 rotate-[15deg]" />*/  }
      
    </div>  
  );  
}