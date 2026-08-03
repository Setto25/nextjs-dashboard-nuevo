import { create } from 'zustand'

//////////////////Store para almacenar el valor de la pestaña activa////////////////////////////

// Store interface
interface Store {
  // Definir la interfaz del store
  nuevoValor: number // Tipo de dato
  setValue: (nuevoValor: number) => void // Función para actualizar el estado
}

// Create a store|
const useValueStore = create<Store>(set => ({
  // Crear el store
  nuevoValor: 0, // Estado inicial
  setValue: nuevoValor => set({ nuevoValor }) // Función para actualizar el estado
}))

// //////////////////////Store Capacitacion Pestaña activa
interface StoreAciveTab {
  // Definir la interfaz del store
  valorTab: number // Tipo de dato
  setValueT: (valorTab: number) => void // Función para actualizar el estado
}
// Create a storeTab|
const useValueStoreTab = create<StoreAciveTab>(set => ({
  // Crear el store
  valorTab: 0, // Estado inicial
  setValueT: valorTab => set({ valorTab }) // Función para actualizar el estado
}))

//create store nombre de pestaña
interface StoreTabName {
    // Definir la interfaz del store
    tabName: string // Tipo de dato
    setTabName: (tabName: string) => void // Función para actualizar el estado
    }
// Create a storeTabName|
const useValueStoreTabName = create<StoreTabName>(set => ({
    // Crear el store
    tabName: '', // Estado inicial
    setTabName: tabName => set({ tabName }) // Función para actualizar el estado
}))




//////////////////////////STORE protocolos
interface StoreProtocolos {
  numeroP: number
  setValueP: (numeroP: number) => void
}

const useValueProtocol = create<StoreProtocolos>(set => ({
  numeroP: 0,
  setValueP: numeroP => set({ numeroP })
}))


// Store Protocolos Pestaña activa
interface StoreAciveTabProtocol { // Definir la interfaz del store
    valorTabPro: number; // Tipo de dato
    setValuePro: (valorTabPro: number) => void; // Función para actualizar el estado
}
// Create a storeTab|
const useValueStoreTabProtocol = create<StoreAciveTabProtocol>((set) => ({ // Crear el store
    valorTabPro: 0, // Estado inicial
    setValuePro: (valorTabPro) => set({valorTabPro}), // Función para actualizar el estado
}));






//STORE menuSeleccionado
interface StoreMenuSeleccionado {
  menuSeleccionado: string
  setMenuSeleccionado: (menuSeleccionado: string) => void
}
const useValueMenuSeleccionadoStore = create<StoreMenuSeleccionado>(set => ({
  menuSeleccionado: 'Vacio', //Sw e inicializa en "vacio" para que no cargue contenido al inicio
  setMenuSeleccionado: menuSeleccionado => set({ menuSeleccionado })
}))

//Store ID Cookies
interface StoreCookies {
  idCookie: string
  setIdCookie: (idCookie: string) => void
}
const useValueCookies = create<StoreCookies>(set => ({
  idCookie: '',
  setIdCookie: idCookie => set({ idCookie })
}))

interface actualizacionUploadStore {
  actualizarUpload: boolean
  alternarActualizar: () => void
}
const useUploadStore = create<actualizacionUploadStore>(set => ({
  actualizarUpload: false,
  alternarActualizar: () =>
    set(state => ({ actualizarUpload: !state.actualizarUpload }))
}))


////Store tabs admin
interface StoreTabAdmin {
  valorTabAdmin: number
  setValueTabAdmin: (valorTabAdmin: number) => void
}
const useValueStoreTabAdmin = create<StoreTabAdmin>(set => ({
  valorTabAdmin: 0, // Estado inicial
  setValueTabAdmin: valorTabAdmin => set({ valorTabAdmin }) // Función para actualizar el estado
}))




export {
  useValueStore,
  useValueProtocol,
  useValueCookies,
  useValueMenuSeleccionadoStore,
  useUploadStore,
  useValueStoreTab,
useValueStoreTabProtocol,
    useValueStoreTabName,
    useValueStoreTabAdmin
} // Exportar el store
