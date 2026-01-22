"use client"; 


import { BookCheck, SheetIcon, TvIcon } from 'lucide-react'
import SubTabs from '@/app/components/navegation/subtabs'
import PaginaVideos from '@/app/components/operaciones-videos/CargaVideos';
import PaginaDocumentos from '@/app/components/operaciones-documentos/CargarDocumentoDB';
import { Tabs } from '@/app/components/navegation/tabs-capacitacion_db';
import page from '../Test/page3';
import PaginaInteractivos from '@/app/components/operaciones-Intercativos/CargarInteractivosP';
import PaginaPlantillas from '@/app/components/operaciones-plantillas/CargarPlantilla';
import BuscarPlantillas from '@/app/components/search/BuscarPlantillas';



export default function Page() {  
    // Extraer el valor dentro del cuerpo del componente  

  const misTabs = [ //Subpestañas a renderizar
    { name: 'Plantillas', icon: <SheetIcon />, component: PaginaPlantillas }, 
    { name: 'Sets', icon: <BookCheck />, component: BuscarPlantillas },
      // { name: 'Interactivos', icon: <BookCheck />, component: PaginaInteractivos }
  ]

  return (
    <div>
      <p className="flex title-responsive justify-center p-2">Plantillas y Formatos</p>
       {/*/  <Tabs />   Importar el componente Tabs}*/}
      <SubTabs tabs={misTabs} />
    </div>
  )
}  



















/*"use client";
import styled from "styled-components";
import { Tabs } from "@/app/components/navegation/tabs";

export default function Page() {
    return     <Container>
          <Tabs />
        </Container>;
  }
  
  const Container = styled.main`
  height: 100vh;
`;*/
