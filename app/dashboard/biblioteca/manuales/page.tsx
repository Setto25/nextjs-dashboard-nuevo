'use client'; 
import '@/app/ui/global/texts.css';

import CargadorManuales from '@/app/components/operaciones-manuales/CargarManuales';

export default function Page() {
    return <div>
      <p className="flex title-responsive justify-center p-2">Manuales de Equipos</p>
<CargadorManuales/>
     
    </div>
  }