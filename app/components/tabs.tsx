import { useState, FC } from "react";
import { BsBarChartLine } from "react-icons/bs";
import { AiOutlineCalculator } from "react-icons/ai";
import { BsCalendarCheck } from "react-icons/bs";

// Interfaces
interface TabItem {
    name: string; // Nombre de la pestaña
    icon: JSX.Element; // Icono de la pestaña
}

interface TabContentProps {
    children: React.ReactNode; // Contenido de la pestaña
}

// Datos de las tabs
const tabItems: TabItem[] = [
    { name: 'Estadísticas', icon: <BsBarChartLine/> }, // Añadido tamaño a los iconos
    { name: 'Calculadora', icon: <AiOutlineCalculator/> },
    { name: 'Calendario', icon: <BsCalendarCheck /> },
    { name: 'Calendario', icon: <BsCalendarCheck /> },
    { name: 'Calendario', icon: <BsCalendarCheck /> },
    { name: 'Calendario', icon: <BsCalendarCheck /> },
    { name: 'Calendario', icon: <BsCalendarCheck /> },
];

// Contenido de las tabs (opcional)
const tabContents = [
    <h1>Contenido de Estadísticas</h1>,
    <h1>Contenido de Calculadora</h1>,
    <h1>Contenido de Calendario</h1>,
    <h1>Contenido de Calendario</h1>,
    <h1>Contenido de Calendario</h1>,
    <h1>Contenido de Calendario</h1>,
    <h1>Contenido de Calendario</h1>,
];

// Componente para el contenido de las pestañas
const TabContent: FC<TabContentProps> = ({ children }) => (
    <div className="tab__content relative rounded-md mt-5 w-full h-full flex flex-col justify-center items-center text-xl">
        {children}
    </div>
);

// Componente principal de las pestañas
export const Tabs: FC = () => {
    const [activeTab, setActiveTab] = useState<number>(0); // Estado para la pestaña activa

    const seleccionar = (indice: number) => {
        setActiveTab(indice); // Cambia la pestaña activa
    };

    return (
        <div className="div__contenido relative flex-wrap flex items-start justify-center w-full  text-pink-600 ">
            <ul className="div__pestañas h-fit flex flex-wrap relative p-6 rounded-full justify-between  bg-gray-300/70  shadow-[6px_6px_10px_-1px_rgba(0,0,0,0.15)]">
                {tabItems.map((pestana, indice) => (
                    <li
                        key={pestana.name}
                        className={`
                            flex 
                            items-center 
                            justify-center 
                            p-1
                            text-xxs 
                            h-fit
                             bg-lime-300/10
                            rounded-full
                            lg:text-lg
                            font-medium cursor-pointer z-2
                            ${activeTab === indice ? "text-white bg-yellow-400/100 overflow-hidden rounded-full" : "text-black"}
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