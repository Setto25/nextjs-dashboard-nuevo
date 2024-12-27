import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';

export default function AcmeLogo() {  
  return (  
    <div  
      className={`${lusitana.className} flex flex-row items-center leading-none text-white w-full h-full `}  
    >  
      <Image   
        src="/logo-texto3.png"  
        width={275}  
        height={275}  
        alt='logo'  
        className="h-full max-w-[275px] max-h-full object-contain hidden md:block"   
      />  
      <Image   //imagen alternativa para cuando la spantalla son pequeñas
        src="/logo4.webp"  
        width={275}  
        height={275}  
        alt='logo'  
        className="h-full max-w-[275px] max-h-full object-contain block md:hidden "   
      />  

      
      {/*<GlobeAltIcon className="h-12 w-12 rotate-[15deg]" />*/  }
      
    </div>  
  );  
}