'use client'; 
import '@/app/ui/global/texts.css';
import BuscadorManuales from "@/app/components/search/BuscadorManuales"

export default function Page() {
    return <div>
      <p className="flex title-responsive justify-center p-2">Manuales de Equipos</p>
<BuscadorManuales/>
     
    </div>
  }