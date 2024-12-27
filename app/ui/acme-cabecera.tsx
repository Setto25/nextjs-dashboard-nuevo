import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';

export default function AcmeCabecera() {  
  return (  
    <div  
      className={`${lusitana.className} flex flex-row items-center leading-none text-white w-full h-full `}  
    >  
      <Image   
        src="/cabecera2.webp"  
       layout='fill' 
        alt='logo'  
        className="h-full max-w-full max-h-full object-contain "   
      />  
      {/*<GlobeAltIcon className="h-12 w-12 rotate-[15deg]" />*/  }
      
    </div>  
  );  
}