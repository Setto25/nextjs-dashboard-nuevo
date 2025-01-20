"use client"; // Si estás usando Next.js  

import React from 'react';  

import 'app/ui/global.css';
import { SelectExport } from '@/app/components/navegation/tabs_nav';
import useValueStore from '@/app/store/store';
import Tabs from '@/app/components/navegation/tabs';

export default function Page() {  
    // Extraer el valor dentro del cuerpo del componente  
    const { nuevoValor } = useValueStore();  // Extraer el valor del store

    return (  
        <div>  
            <Tabs />  {/*/ Importar el componente Tabs}*/}
            {SelectExport(nuevoValor)}  {/*/ Importar la función pasando el valor de la pestaña activa de "Tabs" almacenado en el store*/}
        </div>  
    );  
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
