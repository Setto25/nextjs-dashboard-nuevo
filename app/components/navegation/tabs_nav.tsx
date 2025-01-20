
//import PaginaDocumentos from "@/app/components/carga_de_documentos";
//import PaginaVideosTema from "@/app/components/carga_de_videos";

import { BookAIcon, BookCheck, TvIcon } from "lucide-react";
import { BsBarChartLine, BsBook, BsCalendarCheck } from "react-icons/bs";
import SubTabs from "./subtabs";
import PaginaVideosTema from "../operaciones-videos/CargaVideos";
import PaginaDocumentos from "../operaciones-documentos/CargarDocumento";




export const SelectExport = (seleccion:number) => { // Función para seleccionar la página en funcion del valor del indice de pestaña seleccionada
    switch (seleccion) {
        case 0:
            return <Reanimacion/>
        case 1:
            return <CuidadosBasicos/>
        case 2:
            
        default: "pagina no seleccionada"
            break;  
    }
}

export const Reanimacion = () => {


    interface Tab {
        name: string;
        icon: JSX.Element;
        link?: string;
        component?: React.ComponentType; // Añadir tipo de componente  
        onClick?: () => void;
      }

    const misTabs: Tab[] = [
        
            { name: 'Videos', icon: <TvIcon />,component: PaginaVideosTema },
            { name: 'Documentos', icon: <BookCheck  />, link: '/dashboard/capacitacion/reanimacion/papers',component: PaginaDocumentos },
            { name: 'PPTs', icon: <TvIcon />, link: '/dashboard/capacitacion/reanimacion/ppts' },
      ];

    return (
        <div>

              <SubTabs tabs={misTabs} /> 
        </div>
    )
}


export const CuidadosBasicos = () => {


  interface Tab {
      name: string;
      icon: JSX.Element;
      link: string;
    }

  const misTabs: Tab[] = [
      
          { name: 'Videos2', icon: <TvIcon />, link: '/dashboard/capacitacion/cuidados_basicos/videos' },
          { name: 'Papers2', icon: <BsCalendarCheck  />, link: '/dashboard/capacitacion/cuidados_basicos/papers' },
          { name: 'PPTs2', icon: <TvIcon />, link: '/dashboard/capacitacion/rcuidados_basicos/ppts' },
    ];

  return (
      <div>

            <SubTabs tabs={misTabs} /> 
      </div>
  )
}

