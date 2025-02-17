import { useState, FC } from "react";
import { BsBarChartLine } from "react-icons/bs";
import { AiOutlineCalculator } from "react-icons/ai";
import { BsCalendarCheck } from "react-icons/bs";
import {useValueStore} from "@/app/store/store";
import { BookCheckIcon, BookCopyIcon } from "lucide-react";



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
    { name: 'Gestión de Usuarios', icon: <BsBarChartLine/>, },
    { name: 'Gestión de Videos', icon: <AiOutlineCalculator/> },
    { name: 'Gestión de Documentos', icon: <BsCalendarCheck /> },
    { name: 'Gestión de Protocolos', icon: <BsCalendarCheck /> },
    { name: 'Gestión de Libros', icon: <BookCheckIcon /> },
    { name: 'Gestión de Manuales', icon: <BookCopyIcon/> },

];

// Contenido de las tabs (opcional)
const tabContents = [  
    <h1 className="title-responsive">Gestión de Usuarios</h1>,  
    <h1 className="title-responsive">Gestion de Videos</h1>,  
    <h1 className="title-responsive">Gestion de Documentos</h1>,  
    <h1 className="title-responsive">Gestion de Protocolos</h1>,  
    <h1 className="title-responsive">Gestion de Libros</h1>,  
    <h1 className="title-responsive">Gestion de Manuales</h1>,  
];  



// Componente para el contenido de las pestañas
const TabContent: FC<TabContentProps> = ({ children }) => (
    <div className="tab__content relative rounded-md mt-5 w-full h-full flex flex-col justify-center items-center ">
        {children}
    </div>
);

// Componente principal de las pestañas
export const TabsAdmin: FC = () => {
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

export default TabsAdmin;