import { useState, FC, useEffect } from "react";
import { BsBarChartLine, BsLungs } from "react-icons/bs";
import { AiOutlineCalculator } from "react-icons/ai";
import { BsCalendarCheck } from "react-icons/bs";


import { BabyIcon, CrossIcon, ListEndIcon, LucidePillBottle, MailSearchIcon, Monitor, MonitorCheck, MonitorCheckIcon, OrbitIcon, PillBottleIcon, SearchCheckIcon, ShieldCheckIcon, Syringe, SyringeIcon, ThermometerSun, TvIcon } from "lucide-react";
import { useValueProtocol, useValueStoreTabProtocol } from "@/app/store/store";
import { JSX } from "react/jsx-runtime";
//import { BuscadorProtocolos } from "./tabs_nav_protocolos";



// Interface
interface SubMenuItem {
    name: string; // Nombre de la pestaña
    icon: JSX.Element; // Icono de la pestaña
    link?: string; // Link de la pestaña
}


// Interfaces
interface TabItem {
    name: string; // Nombre de la pestaña
    icon: JSX.Element; // Icono de la pestaña
    submenu?: SubMenuItem[]; // Submenú de la pestaña
    link?: string;
}

interface TabContentProps {
    children: React.ReactNode; // Contenido de la pestaña
}

// Datos de las tabs con las categorías de protocolos  
const tabItems: TabItem[] = [  
    { name: 'Cuidados Generales', icon: <BabyIcon /> },  
    { name: 'Soporte Respiratorio', icon: <BsLungs /> },  
    { name: 'Manejo de Infecciones', icon: <ShieldCheckIcon /> },  
    { name: 'Nutrición / Alimentación', icon: <PillBottleIcon/> },  
    { name: 'Administración de Medicamentos', icon: <SyringeIcon /> },  
    { name: 'Procedimientos Invasivos', icon: <CrossIcon/> },  
    { name: 'Cuidados de Piel / Termoregulación', icon: <ThermometerSun /> },  
    { name: 'Monitorización UCI', icon: <MonitorCheck/> },  
    { name: 'Protocolos Institucionales', icon: <ListEndIcon/>},
     { name: 'Otros Protocolos', icon: <OrbitIcon/>},
    { name: 'Buscardor...', icon: <SearchCheckIcon/>, link: "/dashboard/protocolos/buscar-protocolo" },  
];  

const tabContents = [  
    <h1 className="subtitle-responsive">Cuidados Generales</h1>,  
    <h1 className="subtitle-responsive">Soporte Respiratorio</h1>,  
    <h1 className="subtitle-responsive">Manejo de Infecciones</h1>,  
    <h1 className="subtitle-responsive">Nutrición / Alimentación</h1>,  
    <h1 className="subtitle-responsive">Administración de Medicamentos</h1>,  
    <h1 className="subtitle-responsive">Procedimientos Invasivos</h1>,  
    <h1 className="subtitle-responsive">Cuidados de Piel / Termoregulación</h1>,  
    <h1 className="subtitle-responsive">Monitorización UCI</h1>,  
    <h1 className="subtitle-responsive">Protocolos Institucionales</h1>,
    <h1 className="subtitle-responsive">Otros Protocolos</h1>,
    <h1 className="subtitle-responsive">Buscador...</h1>,  
];  



// Componente para el contenido de las pestañas
const TabContent: FC<TabContentProps> = ({ children }) => (
    <div className="tab__content relative rounded-md mt-5 w-full h-full flex flex-col justify-center items-center ">
        {children}
    </div>
);

// Componente principal de las pestañas
export const TabsAdmin: FC = () => {
    const {numeroP, setValueP } = useValueProtocol();   // Store para el valor de la pestaña activa
      const { valorTabPro, setValuePro } = useValueStoreTabProtocol() // Store para el valor de la pestaña activa

   /* useEffect(() => {
        if (numeroP=== 0) {
            setValuePro (0); // Resetea el valor del store al cargar la pestaña
   
    }}, []);*/

    const seleccionar = (indice: number) => {
        setValuePro (indice); // Cambia la pestaña activa
        setValueP(indice) // Cambia el valor del store
    };

    return (
        <div className="div__contenido relative flex-wrap flex items-start justify-center w-full">
         
            <ul className="div__pestañas h-fit flex flex-wrap relative p-4 gap-3 bg-transparent justify-center">
                {tabItems.map((pestana, indice) => (
                    <li
                        key={pestana.name}
                        className={`
                            flex 
                            items-center 
                            justify-center 
                            p-2 px-4
                            small-text-responsive
                            h-fit
                            rounded-full
                            font-medium cursor-pointer transition-all duration-200 z-10
                            hover:scale-105 shadow-sm
                            ${valorTabPro === indice 
                                ? "bg-emerald-50 border-2 border-emerald-500 text-emerald-700 shadow-md ring-2 ring-emerald-500/20" 
                                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-md hover:text-gray-900"}
                        `}
                        onClick={() => seleccionar(indice)} // Cambia la pestaña activa al hacer clic
                    >
                        {pestana.icon}
                        <span className="ml-2  md:inline">{pestana.name}</span> {/* Texto del tab */}


                    </li>
                ))}
     
            </ul>

            <div className="div__contenido__pestañas w-full flex md:flex-row ">
                <TabContent>
                    {tabContents[valorTabPro] || <p>Contenido no disponible</p>} {/* Muestra el contenido de la pestaña activa */}
                </TabContent>

            </div>

        </div>
    );
};

export default TabsAdmin;