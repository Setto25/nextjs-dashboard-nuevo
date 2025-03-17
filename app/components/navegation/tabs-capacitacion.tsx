import { useState, FC } from "react";
import { useValueStore } from "@/app/store/store";
import { GiHeartBeats, GiNeedleDrill } from 'react-icons/gi';
import { MdBabyChangingStation, MdMonitorHeart } from 'react-icons/md';
import { FaCarrot } from 'react-icons/fa';
import { PillBottleIcon, ShieldCheckIcon, SyringeIcon } from "lucide-react";
import { JSX } from "react/jsx-runtime";
import { BsLungs } from "react-icons/bs";


interface SubMenuItem {
    name: string;
    icon: JSX.Element;
    link?: string;
}

interface TabItem {
    name: string;
    icon: JSX.Element;
    submenu?: SubMenuItem[];
}

interface TabContentProps {
    children: React.ReactNode;
}

// Datos de las tabs
const tabItems: TabItem[] = [
    { name: 'Reanimación Neonatal', icon: <GiHeartBeats /> },
    { name: 'Cuidados Generales', icon: <MdBabyChangingStation /> },
    { name: 'Soporte Respiratorio', icon: <BsLungs /> },
    { name: 'Manejo de Infecciones', icon: <ShieldCheckIcon /> },
    { name: 'Nutrición / Alimentación', icon: <PillBottleIcon /> },
    { name: 'Administración de Medicamentos', icon: <SyringeIcon /> },
    { name: 'Procedimientos Invasivos', icon: <GiNeedleDrill /> },
    { name: 'Cuidados de Piel / Termoregulación', icon: <FaCarrot /> },
    { name: 'Monitorización', icon: <MdMonitorHeart /> }
];

// Contenido de las tabs (opcional)
const tabContents = [
    <h1 className="subtitle-responsive">Contenidos sobre Reanimación Neonatal</h1>,
    <h1 className="subtitle-responsive">Contenidos sobre Cuidados Generales</h1>,
    <h1 className="subtitle-responsive">Contenidos sobre Soporte Respiratorio</h1>,
    <h1 className="subtitle-responsive">Contenidos sobre Manejo de Infecciones</h1>,
    <h1 className="subtitle-responsive">Contenidos sobre Nutrición / Alimentación</h1>,
    <h1 className="subtitle-responsive">Contenidos sobre Administración de Medicamentos</h1>,
    <h1 className="subtitle-responsive">Contenidos sobre Procedimientos Invasivos</h1>,
    <h1 className="subtitle-responsive">Contenidos sobre Cuidados de Piel / Termoregulación</h1>,
    <h1 className="subtitle-responsive">Contenidos sobre Monitorización</h1>
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