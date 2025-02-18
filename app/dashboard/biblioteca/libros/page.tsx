'use client';

import BuscadorLibros from "@/app/components/search/BuscadorLibros";
import '@/app/ui/global/texts.css';


 


export default function Page() {
    return <div>
      <p className="flex title-responsive justify-center p-2">Libros</p>

      <BuscadorLibros/>
    </div>
  }