import { BabyIcon, CrossIcon, LibraryIcon, ListEndIcon, MonitorCheckIcon, OrbitIcon, PillBottleIcon, ShieldCheckIcon, SyringeIcon, ThermometerSun } from "lucide-react";  
import { BsLungs } from "react-icons/bs";  
import SubTabs from "./subtabs"; // Asegúrate de que la ruta sea correcta  
import CargarProtocolos from "../operaciones-protocolos/CargarProtocolo";
import BuscadorProtocolos from "../search/BuscarProtocolos";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

// Función para seleccionar la página en función del valor del índice de pestaña seleccionada  
export const SelectExport2 = (seleccion: number) => {  
    switch (seleccion) {  
        case 0:  
            return <CuidadosGenerales />;  
        case 1:  
            return <SoporteRespiratorio />;  
        case 2:  
            return <ManejoInfecciones />;    
        case 3:  
            return <NutricionAlimentacion />; 
        case 4:  
            return <AdministracionMedicamentos />;  
        case 5:  
            return <ProcedimientosInvasivos />; 
        case 6:  
            return <CuidadosPielTermoregulacion />; 
        case 7:  
            return <MonitorizacionUCI />; 
        case 8:  
            return <ProtocolosInstitucionales />; 
        case 9:  
            return <OtrosProtocolos />; 

        case 10:  
            return <BuscadorProtocolo/>; 
        default:  
            return <p>Página no seleccionada</p>;  
    }  
}  

// Función de Cuidados Generales  
export const CuidadosGenerales = () => {  
    const misTabs = [  
        { name: 'Cuidados Generales', icon: <BabyIcon />, component: CargarProtocolos },  
      
    ];  

    return (  
        <div>  
            <SubTabs tabs={misTabs} />  
        </div>  
    );  
}  

// Función de Soporte Respiratorio  
export const SoporteRespiratorio = () => {  
    const misTabs = [  
        { name: 'Soporte Respiratorio', icon: <BsLungs />, component: CargarProtocolos},  
  
    ];  

    return (  
        <div>  
            <SubTabs tabs={misTabs} />  
        </div>  
    );  
}  

// Función de Manejo de Infecciones  
export const ManejoInfecciones = () => {  
    const misTabs = [  
        { name: 'Manejo de Infecciones', icon: <ShieldCheckIcon />, component: CargarProtocolos},  
  
    ];  

    return (  
        <div>  
            <SubTabs tabs={misTabs} />  
        </div>  
    );  
}  

// Función de Nutrición y Alimentación  
export const NutricionAlimentacion = () => {  
    const misTabs = [  
        { name: 'Nutrición / Alimentación', icon: <PillBottleIcon />, component: CargarProtocolos },  
   
    ];  

    return (  
        <div>  
            <SubTabs tabs={misTabs} />  
        </div>  
    );  
}  

// Función de Administración de Medicamentos  
export const AdministracionMedicamentos = () => {  
    const misTabs = [  
        { name: 'Administración de Medicamentos', icon: <SyringeIcon />, component: CargarProtocolos },  

    ];  

    return (  
        <div>  
            <SubTabs tabs={misTabs} />  
        </div>  
    );  
}  

// Función de Procedimientos Invasivos  
export const ProcedimientosInvasivos = () => {  
    const misTabs = [  
        { name: 'Procedimientos Invasivos', icon: <CrossIcon />, component: CargarProtocolos },  
    
    ];  

    return (  
        <div>  
            <SubTabs tabs={misTabs} />  
        </div>  
    );  
}  

// Función de Cuidados Piel / Termoregulación  
export const CuidadosPielTermoregulacion = () => {  
    const misTabs = [  
        { name: 'Cuidados de Piel / Termoregulación', icon: <ThermometerSun />, component: CargarProtocolos },  

    ];  

    return (  
        <div>  
            <SubTabs tabs={misTabs} />  
        </div>  
    );  
}  

// Función de Monitorización UCI  
export const MonitorizacionUCI = () => {  
    const misTabs = [  
        { name: 'Monitorizacion', icon: <MonitorCheckIcon />, component: CargarProtocolos },  
   
    ];  

    return (  
        <div>  
            <SubTabs tabs={misTabs} />  
        </div>  
    );  
}  

// Función de Protocolos Institucionales  
export const ProtocolosInstitucionales = () => {  
    const misTabs = [  
        { name: 'Protocolos Institucionales', icon: <ListEndIcon />, component: CargarProtocolos },  
  
    ];  

    return (  
        <div>  
            <SubTabs tabs={misTabs} />  
        </div>  
    );  
}   

// Función de Protocolos Institucionales  
export const OtrosProtocolos = () => {  
    const misTabs = [  
        { name: 'Otros Protocolos', icon: <OrbitIcon />, component: CargarProtocolos },  
  
    ];  

    return (  
        <div>  
            <SubTabs tabs={misTabs} />  
        </div>  
    );  
}   


export const BuscadorProtocolo = () => {  
    const misTabs = [  
        { name: 'Buscador', icon: <MonitorCheckIcon />, component: BuscadorProtocolos },  

    ];  

    return (  
        <div>  
            <SubTabs tabs={misTabs} />  
        </div>  
    );  
}  