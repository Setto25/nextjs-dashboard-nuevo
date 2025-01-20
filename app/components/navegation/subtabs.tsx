import React, { useState } from 'react';


/*
Este archivo es el encargado de proporcionar la fucnion de renderizado de pestañas (o subpestañas...por ej. reanimacion, etc), extrae de un array de pestañas y las renderiza en la pantalla, ademas de permitir la navegación entre ellas. Recibe el array de pestañas como parametro y se usa el hook useState para manejar el estado de la pestaña activa.

*/


// Definición de la interfaz Tab (con subTabs opcionales)
interface Tab {
  name: string;
  icon: JSX.Element;
  link?: string;
  component?: React.ComponentType; // Añadir tipo de componente
  subTabs?: Tab[]; // Opcional, para subpestañas // subTabs es opcional, puede contener más Tabs
}

// Componente Tabs, recibe el array de pestañas como parametro, se usa el hook  usedState para manejar el estado de la pestaña activa.
const SubTabs: React.FC<{ tabs: Tab[] }> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };  

  // Función para renderizar subpestañas (si existen)
  const renderSubTabs = (subTabs: Tab[] = []) => { //Quite | undefined y puse = []
    if (!subTabs || subTabs.length === 0) {
      return null; // No renderizar nada si no hay subpestañas
    }

   /* return (   // quitar si no se usa
      <div className="mt-2 flex bg-gray-950">
        {subTabs.map((subTab, index) => (
          <button
            key={index}
            className={`t__tab p-2 border ${activeTab === index ? 'selected border-b-0 font-bold' : ''} cursor-pointer`}
            onClick={() => handleTabClick(index)}
          >
            {subTab.name}
          </button>
        ))}
      </div>
    );*/
  };

  // Renderizado de pestañas
  return (
    <div className="t__container rounded-md p-4 h-full"> {/* Contenedor principal */}
      <div className="pestana_arriba flex bg-white rounded-xl  border-y-2 justify-center container-sombra"> {/* Contenedor de las pestañas */}
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`t-tab p-2 ${activeTab === index ? 'pestana__seleccionada text-white border-b-0 font-bold bg-lime-400' : ''} cursor-pointer`} // Clases condicionales
            onClick={() => handleTabClick(index)} // Cambia la pestaña activa al hacer clic
          >
            <div className='flex flex-col col-span-2 items-center justify-center gap:1px mx-5'> {/* Para centrar el icono y el nombre de la pestaña */}
           
            <div className='ico md:text-base'> {tab.icon}</div>{/* Icono de la pestaña */}
            <div className='hidden md:block'> {tab.name} {/* Nombre de la pestaña */}
            </div>
            
            </div>
      
            
          </button> 
        ))}
      </div>



      <div className=" contenido_pestaña mt-4"> {/* Para contenido*/}
        {tabs.map((tab, index) => ( 
          <div key={index} className={`t-content ${activeTab === index ? 'selected' : 'hidden'}`}>
            {tab.component && <tab.component />} {/* Renderiza el componente si existe */}
            {renderSubTabs(tab.subTabs)} {/* Renderiza las subpestañas */}
          </div>
        ))}
      </div>
  
    </div>




  );
};

export default SubTabs; // Exportación por defecto

