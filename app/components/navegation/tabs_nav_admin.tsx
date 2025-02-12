
//import PaginaDocumentos from "@/app/components/carga_de_documentos";
//import PaginaVideosTema from "@/app/components/carga_de_videos";

import { BookAIcon, BookCheck, TvIcon } from "lucide-react";
import { BsBarChartLine, BsBook, BsCalendarCheck } from "react-icons/bs";
import SubTabs from "./subtabs";
import PaginaVideosTema from "../operaciones-videos/CargaVideos";
import PaginaDocumentos from "../operaciones-documentos/CargarDocumento";
import RegistroUsuarios from "@/app/dashboard/admin/registro-usuario/RegistroUsuarios";
import SearchUsers from "@/app/dashboard/admin/buscar-usuarios/SearchUsers";
import AgregarVideoPage from "../operaciones-videos/AgregarVideo";
import BuscadorVideosAdmin from "../search/BuscadorVideosAdmin";
import BuscadorDocumentosAdmin from "../search/BuscadorDocumentosAdmin";
import AgregarDocumento from "../operaciones-documentos/AgregarDocumento";




export const SelectExport2 = (seleccion:number) => { // Función para seleccionar la página en funcion del valor del indice de pestaña seleccionada
    switch (seleccion) {
        case 0:
            return <GestionUsers/>
        case 1:
            return <GestionVideos/>
        case 2:
          return <GestionDocumentos/>
            
        default: "pagina no seleccionada"
            break;  
    }
}

export const GestionUsers = () => {


    interface Tab {
        name: string;
        icon: JSX.Element;
        link?: string;
        component?: React.ComponentType; // Añadir tipo de componente  
        onClick?: () => void;
      }

    const misTabs: Tab[] = [
        
            { name: 'Agregar', icon: <TvIcon />,component: RegistroUsuarios },
            { name: 'Consultar / Eliminar', icon: <BookCheck  />,component: SearchUsers },
           // { name: 'PPTs', icon: <TvIcon />, link: '/dashboard/capacitacion/reanimacion/ppts' },
      ];

    return (
        <div>

              <SubTabs tabs={misTabs} /> 
        </div>
    )
}


export const GestionVideos = () => {


  interface Tab {
      name: string;
      icon: JSX.Element;
      link?: string;
      component?: React.ComponentType; // Añadir tipo de componente  
      onClick?: () => void;
    }

  const misTabs: Tab[] = [
      
          { name: 'Agregar', icon: <TvIcon />, component: AgregarVideoPage },
          { name: 'Buscar / Eliminar ', icon: <BsCalendarCheck  />, component: BuscadorVideosAdmin },
          //{ name: 'PPTs2', icon: <TvIcon />, link: '/dashboard/capacitacion/rcuidados_basicos/ppts' },
    ];

  return (
      <div>

            <SubTabs tabs={misTabs} /> 
      </div>
  )
}

export const GestionDocumentos = () => {


  interface Tab {
      name: string;
      icon: JSX.Element;
      link?: string;
      component?: React.ComponentType; // Añadir tipo de componente  
      onClick?: () => void;
    }

  const misTabs: Tab[] = [
      
          { name: 'Agregar', icon: <TvIcon />, component: AgregarDocumento},
          { name: 'Buscar / Eliminar ', icon: <BsCalendarCheck  />, component: BuscadorDocumentosAdmin },
          //{ name: 'PPTs2', icon: <TvIcon />, link: '/dashboard/capacitacion/rcuidados_basicos/ppts' },
    ];

  return (
      <div>

            <SubTabs tabs={misTabs} /> 
      </div>
  )
}