// store/useContadorRecursos.ts
import { create } from 'zustand';
import  registrosInteractivos from '../components/operaciones-Intercativos/mapInteractivos';
import { useValueMenuSeleccionadoStore } from './store';
  ; 

//Contador de recursos para la sección de capacitación, permite cargar pestañas cuanto tienen contenido.
interface ContadorState {
  counts: {
    videos: number;
    documentos: number;
    interactivos: number;
  };
  verificarContenido: (tema: string) => Promise<void>;
}

export const useContadorRecursos = create<ContadorState>((set) => ({
  counts: { videos: 0, documentos: 0, interactivos: 0 },

  
  
  verificarContenido: async (tema) => {
    // 1. Verificación INSTANTÁNEA de Interactivos (Manual)
    // Simplemente revisamos si el tema existe como clave en nuestro objeto
    const tieneInteractivo = !!registrosInteractivos[tema]; 
    const countInteractivos = tieneInteractivo ? 1 : 0;

    // Actualizamos esto primero si quieres que sea reactivo rápido, 
    // o esperamos a las APIs para actualizar todo junto.
  // Forma correcta de leer un store fuera de un componente:
const temaActual = useValueMenuSeleccionadoStore.getState().menuSeleccionado; // forma de leer el valor actual del store sin usar hooks
    console.log('El valor de menuSeleccionado EN EL CONTADOR en el contador es:', temaActual); 
    try {
      // 2. Verificación ASÍNCRONA (Base de Datos)
      const [resVideos, resDocs] = await Promise.all([
        fetch(`/api/videos?q=${tema}&tipo=tema`),

          // Verificar el valor de nuevoValor
        fetch(`/api/documents?q=${tema}&tipo=tema`) // Asumo que tienes esta ruta
      ]);

      const dataVideos = await resVideos.json();
      const dataDocs = await resDocs.json();

      set({
        counts: {
          videos: Array.isArray(dataVideos) ? dataVideos.length : 0,
          documentos: Array.isArray(dataDocs) ? dataDocs.length : 0,
          interactivos: countInteractivos, // Aquí usamos el valor manual
        }
      });
      
    } catch (error) {
      console.error("Error cargando recursos", error);
      // En caso de error de red, al menos mantenemos el estado del interactivo que es seguro
      set((state) => ({
        counts: { ...state.counts, interactivos: countInteractivos }
      }));
    }
  }
}));