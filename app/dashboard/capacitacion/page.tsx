"use client"; 

import { BookCheck, Gamepad2Icon, TvIcon } from 'lucide-react'
import SubTabs from '@/app/components/navegation/subtabs'
import PaginaVideos from '@/app/components/operaciones-videos/CargaVideos';
import PaginaDocumentos from '@/app/components/operaciones-documentos/CargarDocumentoDB';
import { Tabs } from '@/app/components/navegation/tabs-capacitacion_db';
import PaginaInteractivos from '@/app/components/operaciones-Intercativos/paginaInteractivos';

import { useEffect } from 'react';
import { useValueMenuSeleccionadoStore } from '@/app/store/store'; 
import { useContadorRecursos } from '@/app/store/useContadorRecursos'; 

export default function Page() {   
  const { menuSeleccionado } = useValueMenuSeleccionadoStore();
  const { counts, verificarContenido } = useContadorRecursos();
  
  useEffect(() => {
    verificarContenido(menuSeleccionado);
  }, [menuSeleccionado]);

  const todasLasTabs = [
    { id: 'videos', name: 'Videos', icon: <TvIcon />, component: PaginaVideos, count: counts.videos }, 
    { id: 'docs', name: 'Documentos', icon: <BookCheck />, component: PaginaDocumentos, count: counts.documentos },
    { id: 'inter', name: 'Interactivos', icon: <Gamepad2Icon/>, component: PaginaInteractivos, count: counts.interactivos }
  ];

  // Filtramos solo las pestañas que tienen contenido real
  const tabsA_Mostrar = todasLasTabs.filter(tab => tab.count > 0);

  return (
    <div className="w-full">
      <Tabs />  

      <div className="mt-6">
        {/* CASO 1: Pantalla de Bienvenida (Cuando menuSeleccionado es "Vacio") */}
        {menuSeleccionado === "Vacio" ? (
          <div className="text-center text-gray-600 bg-white border-2 p-8 rounded-xl container-sombra-4lados max-w-4xl mx-auto"> 
            <p className="text-2xl font-bold text-blue-600 mb-4">¡Bienvenido a la sección de capacitación!</p>
            <p className="text-lg leading-relaxed">
              Aquí podrás explorar contenido organizado por categorías y temas. 
              Navega por las pestañas superiores para seleccionar un área, expande los temas disponibles 
              y encuentra videos, documentos o material interactivo disponible para tu aprendizaje.
            </p>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg italic text-sm">
              Selecciona un tema en el menú para comenzar a visualizar los recursos disponibles.
            </div>
          </div>
        ) : (
          /* CASO 2: Se seleccionó un tema pero no hay recursos (counts en 0) */
          tabsA_Mostrar.length === 0 ? (
            <div className="text-center p-10 bg-gray-50 rounded-xl border border-dashed border-gray-300 mx-4">
              <p className="text-xl text-gray-500">No hay contenido disponible para este tema todavía.</p>
            </div>
          ) : (
            /* CASO 3: Hay contenido disponible -> Renderizamos las SubPestañas */
            <SubTabs tabs={tabsA_Mostrar} />
          )
        )}
      </div>
    </div>
  )
}