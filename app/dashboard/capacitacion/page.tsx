"use client"; 


import { BookCheck, TvIcon } from 'lucide-react'
import SubTabs from '@/app/components/navegation/subtabs'
import PaginaVideos from '@/app/components/operaciones-videos/CargaVideos';
import PaginaDocumentos from '@/app/components/operaciones-documentos/CargarDocumentoDB';
import { Tabs } from '@/app/components/navegation/tabs-capacitacion_db';
import page from '../Test/page3';
import PaginaInteractivos from '@/app/components/operaciones-Intercativos/CargarInteractivosP';



export default function Page() {  
    // Extraer el valor dentro del cuerpo del componente  

  const misTabs = [ //Subpestañas a renderizar
    { name: 'Videos', icon: <TvIcon />, component: PaginaVideos }, 
    { name: 'Documentos', icon: <BookCheck />, component: PaginaDocumentos },
       { name: 'Interactivos', icon: <BookCheck />, component: PaginaInteractivos }
  ]

  return (
    <div>
          <Tabs />  
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
