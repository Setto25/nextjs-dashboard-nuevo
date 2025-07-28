'use client';

import { useValueMenuSeleccionadoStore} from '@/app/store/store';
import { useState, useEffect, ReactElement } from 'react';
import DocxViewer from '../docx_viewer/docx_viewer';
import '@/app/ui/global/containers.css'
import '@/app/ui/global/shadows.css'
import '@/app/ui/global/docx.css'
import '@/app/ui/global/texts.css'
import { Component } from 'lucide-react';
import HandwashingTraining from '@/app/dashboard/Test/page';
import VenousAccessDragAndDrop from '@/app/dashboard/Test/page3';




function PaginaInteractivos() {


 // const [documentos, setDocumentos] = useState<Documento[]>([]);
 // const [cargando, setCargando] = useState(true);
  const {menuSeleccionado} = useValueMenuSeleccionadoStore();
  const Interactivo = () => {
    // Función para seleccionar la página en función del valor del índice de pestaña seleccionada
    switch (menuSeleccionado) {
      case "ViaVenosa":
        return <VenousAccessDragAndDrop />;
      case "Lavadodemanos":
        return <HandwashingTraining />;



        
     
      default:
        return <p>Página no seleccionada</p>;
    }
  };








  return (
    <div><Interactivo/></div>
  )
}

export default PaginaInteractivos;