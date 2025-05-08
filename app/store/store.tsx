import { create } from "zustand";

//////////////////Store para almacenar el valor de la pestaña activa////////////////////////////

// Store interface
interface Store { // Definir la interfaz del store
    nuevoValor: number; // Tipo de dato
    setValue: (nuevoValor: number) => void; // Función para actualizar el estado
}

// Create a store|
const useValueStore = create<Store>((set) => ({ // Crear el store
    nuevoValor: 0, // Estado inicial
    setValue: (nuevoValor) => set({ nuevoValor }), // Función para actualizar el estado
}));


//STORE protocolos
interface StoreProtocolos{
numeroP:number;
setValue: (numeroP:number)=>void;
}

const useValueProtocol= create<StoreProtocolos>((set)=>
({ numeroP:0,
setValue: (numeroP)=> set({numeroP}),
})

);

//STORE menuSeleccionado
interface StoreMenuSeleccionado{
    menuSeleccionado:string;
    setMenuSeleccionado: (menuSeleccionado:string)=>void;
}
const useValueMenuSeleccionadoStore= create<StoreMenuSeleccionado>((set)=>
({ menuSeleccionado:'',
setMenuSeleccionado: (menuSeleccionado)=> set({menuSeleccionado}),
})
);


//Store ID Cookies
interface StoreCookies{
    idCookie:string;
    setIdCookie: (idCookie:string)=>void;
}
const useValueCookies= create<StoreCookies>((set)=>
({ idCookie:'',
setIdCookie: (idCookie)=> set({idCookie}),
})
);

export {useValueStore, useValueProtocol, useValueCookies, useValueMenuSeleccionadoStore}; // Exportar el store

