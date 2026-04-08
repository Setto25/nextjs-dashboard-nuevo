import React, { useState } from 'react';
import { JSX } from 'react/jsx-runtime';


// Definición de la interfaz Tab (con subTabs opcionales)
interface Tab {
  name: string;
  icon: JSX.Element;
  link?: string;
  component?: React.ComponentType; // Añadir tipo de componente
  subTabs?: Tab[]; // Opcional, para subpestañas // subTabs es opcional, puede contener más Tabs
}

// Parámetros del componente
interface SubTabsProps {
  tabs: Tab[];
  variant?: 'pills' | 'underlined'; // Permitir elegir estilo
}

// Componente Tabs
const SubTabs: React.FC<SubTabsProps> = ({ tabs, variant = 'underlined' }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const renderSubTabs = (subTabs: Tab[] = []) => {
    if (!subTabs || subTabs.length === 0) return null;
    return <SubTabs tabs={subTabs} variant="underlined" />; // Las subtabs internas siempre son subrayadas
  };

  return (
    <div className="t__container w-full h-full p-2">
      <div className={`flex justify-center ${variant === 'pills' ? 'mb-12' : 'mb-6'}`}>
        <div className={`pestana_arriba flex flex-wrap gap-4 justify-center ${variant === 'underlined' ? 'border-b border-gray-100 w-full' : ''}`}>
          {tabs.map((tab, index) => {
            const isActive = activeTab === index;
            
            if (variant === 'pills') {
              // ESTILO IMAGEN (Píldoras con contorno)
              return (
                <button
                  key={index}
                  className={`
                    flex items-center justify-center 
                    p-2 px-6 rounded-full font-medium transition-all duration-200
                    hover:scale-105 shadow-sm
                    ${isActive 
                        ? "bg-emerald-50 border-2 border-emerald-500 text-emerald-700 shadow-md ring-2 ring-emerald-500/20 font-bold" 
                        : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-md hover:text-gray-900"}
                  `}
                  onClick={() => handleTabClick(index)}
                >
                  <div className="ico mr-2">{tab.icon}</div>
                  <span className="text-sm md:text-base">{tab.name}</span>
                </button>
              );
            } else {
              // ESTILO ANTERIOR (Línea inferior)
              return (
                <button
                  key={index}
                  className={`
                    p-3 px-6 transition-all cursor-pointer border-b-[3px]
                    ${isActive 
                      ? 'text-emerald-600 border-emerald-500 font-bold' 
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50/50'}
                  `}
                  onClick={() => handleTabClick(index)}
                >
                  <div className="flex items-center gap-2">
                    <div className="text-lg">{tab.icon}</div>
                    <span className="text-sm font-medium">{tab.name}</span>
                  </div>
                </button>
              );
            }
          })}
        </div>
      </div>

      <div className="contenido_pestaña">
        {tabs.map((tab, index) => (
          <div 
            key={index} 
            className={`t-content transition-opacity duration-300 ${activeTab === index ? 'opacity-100 block' : 'opacity-0 hidden'}`}
          >
            {tab.component && <tab.component />}
            <div className="mt-6">
               {renderSubTabs(tab.subTabs)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubTabs; // Exportación por defecto

