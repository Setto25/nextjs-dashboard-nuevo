import { create } from "zustand";



//////////////////Store para almacenar el valor de la pestaña activa////////////////////////////

// Store interface
interface Store { // Definir la interfaz del store
    nuevoValor: number; // Tipo de dato
    setValue: (nuevoValor: number) => void; // Función para actualizar el estado
}

// Create a store
const useValueStore = create<Store>((set) => ({ // Crear el store
    nuevoValor: 0, // Estado inicial
    setValue: (nuevoValor) => set({ nuevoValor }), // Función para actualizar el estado
}));

export default useValueStore;