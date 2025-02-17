"use client"; 

import React from 'react';  
import 'app/ui/global.css';
import {useValueProtocol, useValueStore} from '@/app/store/store';
import TabsProtocolos from '@/app/components/navegation/tabs-Protocolos';
import { SelectExport2 } from '@/app/components/navegation/tabs-nav-protocolos';

export default function Page() {  
    // Extraer el valor dentro del cuerpo del componente  
    const { numeroP} = useValueProtocol();  // Extraer el valor del store

    console.log("EL valor DEL STORE PROCOLOS ES:", numeroP)

    return (  
        <div>  
 
            <TabsProtocolos />  {/*/ Importar el componente Tabs}*/}
            {SelectExport2(numeroP)}  {/*/ Importar la función pasando el valor de la pestaña activa de "Tabs" almacenado en el store*/}
        </div>  
    );  
}  
