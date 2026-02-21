'use client'

import { useState, FC, useEffect, useRef } from 'react'
import { useValueStore, useValueStoreTab, useValueStoreTabName } from '@/app/store/store'
import { useValueMenuSeleccionadoStore } from '@/app/store/store'
import Link from 'next/link'
import '@/app/ui/global/menus.css'
import '@/app/ui/global/texts.css'
import clsx from 'clsx'
import { set } from 'date-fns'

interface SubMenuItem {
  nombre: string
  subCategoria: string // nombre subcategoria para mostrar
}

interface TabItem {
  nombre: string
  categoria: string
  menuCategorias: SubMenuItem[]
}
interface TabContentProps {
  children: React.ReactNode
}

// Componente principal de las pestañas
export const Tabs: FC = () => {
  const { valorTab, setValueT } = useValueStoreTab() // Store para el valor de la pestaña activa
  const { setValue } = useValueStore() // Store para el valor de la pestaña activa
  const { menuSeleccionado, setMenuSeleccionado } = useValueMenuSeleccionadoStore() // Store para el valor de la pestaña activa
  //const [tabName, setTabName] = useState<string>('') // Estado para el nombre de la pestaña activa
  const {tabName, setTabName} = useValueStoreTabName() // Store para el nombre de la pestaña activa
  const seleccionar = (indice: number) => {
    setValueT(indice) // Cambia la pestaña activa
    setValue(indice) // Cambia el valor del store
  }

  const [expandedMenus, setExpandedMenus] = useState<string | null>(null) // Solo un menú expandido a la vez
  const ExpansibleMenu = (menuName: string) => {
    setExpandedMenus(prev => (prev === menuName ? null : menuName))
  }

  const menuRef = useRef<HTMLDivElement>(null) // Referencia al contenedor del menú
  const [tabItems, setTabItems] = useState<TabItem[]>([])
  //const [isActive, setIsActive] = useState<boolean>(false) // Estado para controlar la pestaña activa

  console.log('menuSeleccionado', menuSeleccionado)

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/categorias`)
      const data = await response.json()
      setTabItems(data)
      console.log('data', data)
    }
    fetchData()
  }, [])


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setExpandedMenus(null)
      }
    }



    
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <div className='div__contenido relative flex-wrap flex items-start justify-center w-full'>
      <>
        <ul className='div__pestañas h-fit flex flex-wrap relative p-4 rounded-md justify-between  bg-gray-300/70  '>
          <div
            className='relative flex-wrap flex items-start justify-center gap-2'
            ref={menuRef} // Aplica la referencia al contenedor del menú
          >
            {tabItems.map((pestana, indice) => {
              const isExpanded = expandedMenus === pestana.nombre // Verificar si este menú está expandido
              return (
                <div
                  key={pestana.nombre}
                  className='__pestañas relative rounded-md bg-slate-500-400/70 border border-gray-400 '
                >
                  {/* Enlace principal con submenú */}
                  <li
                    onClick={() => {
                      ExpansibleMenu(pestana.nombre) // Cambia la pestaña activa al hacer clic
                      seleccionar(indice)
                      // setIsActive(!isActive)
                    }} // Alternar expansión
                    className={clsx(
                      //clsx es una función que combina clases condicionalmente
                      'flex w-full cursor-pointer items-center rounded-md px-3 py-2 small-text-responsive font-bold container-sombra justify-center p-2  h-fit',
                      //isExpanded && pathname?.includes('/dashboard/biblioteca')
                      valorTab === indice
                        ? 'text-white bg-lime-500 overflow-hidden rounded-md'
                        : 'text-black'
                    )}
                  >
                    <p className='ml-2 md:inline'>{pestana.nombre}</p>
                  </li>
                 { /* Submenú flotante */}
                  {valorTab === indice && isExpanded && (
                    <div className='menu-flotante'>
                      {pestana.menuCategorias?.map((item, indice) => (
                        <Link
                          key={indice}
                          href={''}
                          onClick={() => {
                            setMenuSeleccionado(item.subCategoria)
                            setTabName(item.nombre)
                          }} // Cambia el valor del store}
                          className={clsx(
                            'block p-2 x_small-text-responsive italic hover:bg-gray-200 hover:text-blackimport container-sombra border border-gray-400 rounded-md  my-2'
                          )}
                        >
                          {
                            <p key={indice} className='ml-2'>
                              {item.nombre}
                            </p>
                          }
                        </Link>
                        
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ul>
      </>
      <div className='div__contenido__pestañas w-full flex md:flex-row subtitle-responsive pt-10 px-4'>
        {tabName || <p>Bienvenid@</p>}
      </div>
    </div>
  )
}

export default Tabs
