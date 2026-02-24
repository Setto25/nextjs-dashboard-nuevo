'use client';
import { useValueMenuSeleccionadoStore } from '@/app/store/store';
// IMPORTAMOS EL MAPA DEL PASO 1
import mapaInteractivos from '@/app/components/operaciones-Intercativos/mapInteractivos'; 

export default function PaginaInteractivos() {
  const { menuSeleccionado } = useValueMenuSeleccionadoStore();

  // 1. Buscamos en el "Menú" qué componente toca hoy
  const ComponenteA_Renderizar = mapaInteractivos[menuSeleccionado];

  // 2. Si no existe nada para ese tema, devolvemos null o un mensaje
  if (!ComponenteA_Renderizar) {
    return <div className="p-10 text-center">Seleccione una opción válida</div>;
  }

  // 3. ¡Renderizamos el componente encontrado!
  // Nota: Como es un componente, lo usamos como etiqueta XML <... />
  return (
    <div className="w-full h-full">
       <ComponenteA_Renderizar />
    </div>
  );
}