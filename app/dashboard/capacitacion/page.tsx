"use client"; 


import { BookCheck, TvIcon } from 'lucide-react'
import SubTabs from '@/app/components/navegation/subtabs'
import PaginaVideos from '@/app/components/operaciones-videos/CargaVideos';
import PaginaDocumentos from '@/app/components/operaciones-documentos/CargarDocumento';
import { Tabs } from '@/app/components/navegation/tabs-capacitacion_db';



export default function Page() {  
    // Extraer el valor dentro del cuerpo del componente  

  const misTabs = [
    { name: 'Videos', icon: <TvIcon />, component: PaginaVideos }, //componente a usar
    { name: 'Documentos', icon: <BookCheck />, component: PaginaDocumentos }
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
