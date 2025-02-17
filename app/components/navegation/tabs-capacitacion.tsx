import { useState, FC } from "react";
import { BsBarChartLine, BsLungs } from "react-icons/bs";
import { AiOutlineCalculator } from "react-icons/ai";
import { BsCalendarCheck } from "react-icons/bs";
import {useValueStore }from "@/app/store/store";
import { GiHeartBeats, GiWindTurbine, GiMedicines, GiVirus, GiNeedleDrill, GiBlackHandShield } from 'react-icons/gi';
import { AiOutlineAlert } from 'react-icons/ai';
import { MdBabyChangingStation, MdMonitorHeart, MdOutlineMonitorHeart } from 'react-icons/md';
import { FaCarrot, FaHandsWash, FaLungsVirus } from 'react-icons/fa';
import { Handshake, MonitorCheck, PillBottleIcon, ShieldCheckIcon, SyringeIcon } from "lucide-react";




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
}

interface TabContentProps {
    children: React.ReactNode; // Contenido de la pestaña
}

// Datos de las tabs
const tabItems: TabItem[] = [
    { name: 'Reanimación Neonatal', icon: <GiHeartBeats /> },        
    { name: 'Cuidados Básicos', icon: <MdBabyChangingStation /> },  
    { name: 'Ventilación Mecánica', icon: <BsLungs /> },       
    { name: 'Administración de Medicamentos', icon: <SyringeIcon /> }, 
    { name: 'Instalacion de PICC', icon: <GiNeedleDrill /> },  
    { name: 'Lavado de manos', icon: <FaHandsWash/> }, 
    { name: 'IAAS', icon: <GiVirus/> },              
    { name: 'Drenaje pleural', icon: <FaLungsVirus /> }             
];


// Contenido de las tabs (opcional)
// Contenido de las tabs actualizado
const tabContents = [  
    <h1 className="title-responsive">Contenidos sobre Reanimación Neonatal</h1>,  
    <h1 className="title-responsive">Contenidos sobre Cuidados Básicos</h1>,  
    <h1 className="title-responsive">Contenidos sobre Ventilación Mecánica</h1>,  
    <h1 className="title-responsive">Contenidos sobre Administración de Medicamentos</h1>,  
    <h1 className="title-responsive">Contenidos sobre Instalación de PICC</h1>,  
    <h1 className="title-responsive">Contenidos sobre Lavado de Manos</h1>,  
    <h1 className="title-responsive">Contenidos sobre IAAS (Infecciones Asociadas a la Atención de Salud)</h1>,  
    <h1 className="title-responsive">Contenidos sobre Drenaje Pleural</h1>  
];



// Componente para el contenido de las pestañas
const TabContent: FC<TabContentProps> = ({ children }) => (
    <div className="tab__content relative rounded-md mt-5 w-full h-full flex flex-col justify-center items-center ">
        {children}
    </div>
);

// Componente principal de las pestañas
export const Tabs: FC = () => {
    const [activeTab, setActiveTab] = useState<number>(0); // Estado para la pestaña activa
    const { setValue } = useValueStore();   // Store para el valor de la pestaña activa

    const seleccionar = (indice: number) => {
        setActiveTab(indice); // Cambia la pestaña activa
        setValue(indice) // Cambia el valor del store
    };

    return (
        <div className="div__contenido relative flex-wrap flex items-start justify-center w-full">
         
            <ul className="div__pestañas h-fit flex flex-wrap relative p-4 rounded-md justify-between  bg-gray-300/70 ">
                {tabItems.map((pestana, indice) => (
                    <li
                        key={pestana.name}
                        className={`
                            flex 
                            items-center 
                            justify-center 
                            p-2
                            small-text-responsive
                            h-fit
                           
                            rounded-full
                    
                            font-medium cursor-pointer z-2
                            hover:scale-105 
                            ${activeTab === indice ? "text-white bg-lime-500 overflow-hidden rounded-md" : "text-black"}
                        `}
                        onClick={() => seleccionar(indice)} // Cambia la pestaña activa al hacer clic
                    >
                        {pestana.icon}
                        <span className="ml-2  md:inline">{pestana.name}</span> {/* Texto del tab */}


                    </li>
                ))}
                {/* <span
                    className="indicador__pestañas absolute h-[54px] w-[150px] border-4 border-white z-1 rounded-full transition-transform duration-200 shadow-md opacity-50"
                    style={{ transform: `translateX(${activeTab * 150}px)` }} // Mueve el indicador a la pestaña activa
                ></span>*/}
            </ul>

            <div className="div__contenido__pestañas w-full flex md:flex-row ">
                <TabContent>
                    {tabContents[activeTab] || <p>Contenido no disponible</p>} {/* Muestra el contenido de la pestaña activa */}
                </TabContent>

            </div>

        </div>
    );
};

export default Tabs;