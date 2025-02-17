import { BookAIcon, BookCheck, TvIcon } from "lucide-react";
import { BsBarChartLine, BsBook, BsCalendarCheck } from "react-icons/bs";
import SubTabs from "@/app/components/navegation/subtabs";
import PaginaVideosTema from "../operaciones-videos/CargaVideos";
import PaginaDocumentos from "../operaciones-documentos/CargarDocumento";
import PaginaVideos from "../operaciones-videos/CargaVideos";




export const SelectExport = (seleccion: number) => { // Función para seleccionar la página en función del valor del índice de pestaña seleccionada
  switch (seleccion) {
      case 0:
          return <Reanimacion />;  // Componente para la primera pestaña
      case 1:
          return <CuidadosBasicos />;  // Componente para la segunda pestaña
      case 2:
          return <VentilacionMecanica />;  // Componente para la tercera pestaña
      case 3:
          return <AdministracionMedicamentos />;  // Componente para la cuarta pestaña
      case 4:
          return <InstalacionPICC />;  // Componente para la quinta pestaña
      case 5:
          return <LavadoManos />;  // Componente para la sexta pestaña
      case 6:
          return <IASS />;  // Componente para la séptima pestaña
      case 7:
          return <DrenajePleural />;  // Componente para la octava pestaña
      default:
          return <p>Página no seleccionada</p>;  // Mensaje por defecto si el índice no coincide
  }
}
interface Tab {
  name: string;
  icon: JSX.Element;
  link?: string;
  component?: React.ComponentType; // Añadir tipo de componente  
  onClick?: () => void;
}

export const Reanimacion = () => {


    

    const misTabs: Tab[] = [
        
            { name: 'Videos', icon: <TvIcon />,component: PaginaVideos },
            { name: 'Documentos', icon: <BookCheck  />, link: '/dashboard/capacitacion/reanimacion/papers',component: PaginaDocumentos },
            //{ name: 'PPTs', icon: <TvIcon />, link: '/dashboard/capacitacion/reanimacion/ppts' },
      ];

    return (
        <div>

              <SubTabs tabs={misTabs} /> 
        </div>
    )
}


export const CuidadosBasicos = () => {




  const misTabs: Tab[] = [
      
   
    { name: 'Videos', icon: <TvIcon />,component: PaginaVideos },
    { name: 'Documentos', icon: <BookCheck  />, link: '/dashboard/capacitacion/reanimacion/papers',component: PaginaDocumentos },
    ];

  return (
      <div>

            <SubTabs tabs={misTabs} /> 
      </div>
  )

}


export const VentilacionMecanica = () => {

    const misTabs: Tab[] = [
      { name: 'Videos', icon: <TvIcon />,component: PaginaVideos },
      { name: 'Documentos', icon: <BookCheck  />, link: '/dashboard/capacitacion/reanimacion/papers',component: PaginaDocumentos },
    ];

    return (
        <div>
            <SubTabs tabs={misTabs} />
        </div>
    );
};


export const AdministracionMedicamentos = () => {


    const misTabs: Tab[] = [
      { name: 'Videos', icon: <TvIcon />,component: PaginaVideos },
      { name: 'Documentos', icon: <BookCheck  />, link: '/dashboard/capacitacion/reanimacion/papers',component: PaginaDocumentos },
    ];

    return (
        <div>
            <SubTabs tabs={misTabs} />
        </div>
    );
};


export const InstalacionPICC = () => {


    const misTabs: Tab[] = [
      { name: 'Videos', icon: <TvIcon />,component: PaginaVideos },
      { name: 'Documentos', icon: <BookCheck  />, link: '/dashboard/capacitacion/reanimacion/papers',component: PaginaDocumentos },
    ];

    return (
        <div>
            <SubTabs tabs={misTabs} />
        </div>
    );
};


export const LavadoManos = () => {

    const misTabs: Tab[] = [
      { name: 'Videos', icon: <TvIcon />,component: PaginaVideos },
      { name: 'Documentos', icon: <BookCheck  />, link: '/dashboard/capacitacion/reanimacion/papers',component: PaginaDocumentos },
    ];

    return (
        <div>
            <SubTabs tabs={misTabs} />
        </div>
    );
};


export const IASS = () => {

    const misTabs: Tab[] = [
      { name: 'Videos', icon: <TvIcon />,component: PaginaVideos },
      { name: 'Documentos', icon: <BookCheck  />, link: '/dashboard/capacitacion/reanimacion/papers',component: PaginaDocumentos },
    ];

    return (
        <div>
            <SubTabs tabs={misTabs} />
        </div>
    );
};


export const DrenajePleural = () => {

    const misTabs: Tab[] = [
      { name: 'Videos', icon: <TvIcon />,component: PaginaVideos },
      { name: 'Documentos', icon: <BookCheck  />, link: '/dashboard/capacitacion/reanimacion/papers',component: PaginaDocumentos },
    ];

    return (
        <div>
            <SubTabs tabs={misTabs} />
        </div>
    );
};



