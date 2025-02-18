
//import PaginaDocumentos from "@/app/components/carga_de_documentos";
//import PaginaVideosTema from "@/app/components/carga_de_videos";

import { BookCheck, TvIcon } from "lucide-react";
import { BsCalendarCheck } from "react-icons/bs";
import SubTabs from "./subtabs";
import RegistroUsuarios from "@/app/dashboard/admin/registro-usuario/RegistroUsuarios";
import SearchUsers from "@/app/dashboard/admin/buscar-usuarios/SearchUsers";
import AgregarVideoPage from "../operaciones-videos/AgregarVideo";
import BuscadorVideosAdmin from "../search/BuscadorVideosAdmin";
import BuscadorDocumentosAdmin from "../search/BuscadorDocumentosAdmin";
import AgregarDocumento from "../operaciones-documentos/AgregarDocumento";
import AgregarProtocolo from "../operaciones-protocolos/AgregarProtocolo";
import BuscadorProtocolosAdmin from "../search/BuscarProtocolosAdmin";
import AgregarLibro from "../operaciones-libros/AgregarLibro";
import BuscadorLibrosAdmin from "../search/BuscadorLibrosAdmin";
import BuscadorManualesAdmin from "../search/BuscadorManualesAdmin";
import AgregarManual from "../operaciones-manuales/AgregarManual";




export const SelectExport2 = (seleccion:number) => { // Función para seleccionar la página en funcion del valor del indice de pestaña seleccionada
    switch (seleccion) {
        case 0:
            return <GestionUsers/>
        case 1:
            return <GestionVideos/>
        case 2:
          return <GestionDocumentos/>
          case 3:
            return <GestionProtocolos/>
            case 4:
              return <GestionLibros/>
              case 5:
                return <GestionManuales/>
            
        default: "pagina no seleccionada"
            break;  
    }
}




interface Tab {
  name: string;
  icon: JSX.Element;
  link?: string;
  component?: React.ComponentType; // Añadir tipo de componente  
  onClick?: () => void;
}


export const GestionUsers = () => {


    const misTabs: Tab[] = [
        
            { name: 'Agregar', icon: <TvIcon />,component: RegistroUsuarios },
            { name: 'Consultar / Eliminar', icon: <BookCheck  />,component: SearchUsers },

      ];

    return (
        <div>

              <SubTabs tabs={misTabs} /> 
        </div>
    )
}


export const GestionVideos = () => {


  const misTabs: Tab[] = [
      
          { name: 'Agregar', icon: <TvIcon />, component: AgregarVideoPage },
          { name: 'Buscar / Eliminar ', icon: <BsCalendarCheck  />, component: BuscadorVideosAdmin },

    ];

  return (
      <div>

            <SubTabs tabs={misTabs} /> 
      </div>
  )
}

export const GestionDocumentos = () => {


  const misTabs: Tab[] = [
      
          { name: 'Agregar', icon: <TvIcon />, component: AgregarDocumento},
          { name: 'Buscar / Eliminar ', icon: <BsCalendarCheck  />, component: BuscadorDocumentosAdmin },

    ];

  return (
      <div>

            <SubTabs tabs={misTabs} /> 
      </div>
  )
}

export const GestionProtocolos = () => {


  const misTabs: Tab[] = [
      
          { name: 'Agregar', icon: <TvIcon />, component: AgregarProtocolo},
          { name: 'Buscar / Eliminar ', icon: <BsCalendarCheck  />, component: BuscadorProtocolosAdmin },
    ];

  return (
      <div>

            <SubTabs tabs={misTabs} /> 
      </div>
  )
}

export const GestionLibros = () => {


  const misTabs: Tab[] = [
      
          { name: 'Agregar', icon: <TvIcon />, component: AgregarLibro},
          { name: 'Buscar / Eliminar ', icon: <BsCalendarCheck  />, component: BuscadorLibrosAdmin },
    ];

  return (
      <div>

            <SubTabs tabs={misTabs} /> 
      </div>
  )
}

export const GestionManuales = () => {


  const misTabs: Tab[] = [
      
          { name: 'Agregar', icon: <TvIcon />, component: AgregarManual},
          { name: 'Buscar / Eliminar ', icon: <BsCalendarCheck  />, component: BuscadorManualesAdmin },
    ];

  return (
      <div>

            <SubTabs tabs={misTabs} /> 
      </div>
  )
}