import React, { useState } from 'react'
import {
  ArrowUpIcon,
  BookCheck,
  MenuIcon,
  MessageCircleIcon,
  PlusIcon,
} from 'lucide-react'
import { BsCalendarCheck } from 'react-icons/bs'
import SubTabs from './subtabs'
import RegistroUsuarios from '@/app/components/registro-usuario/RegistroUsuarios'
import SearchUsers from '@/app/components/search/SearchUsers'
import AgregarVideoPage from '../operaciones-videos/AgregarVideo'
import BuscadorVideosAdmin from '../search/BuscadorVideosAdmin'
import BuscadorDocumentosAdmin from '../search/BuscadorDocumentosAdmin'
import AgregarDocumento from '../operaciones-documentos/AgregarDocumento'
import AgregarProtocolo from '../operaciones-protocolos/AgregarProtocolo'
import BuscadorProtocolosAdmin from '../search/BuscarProtocolosAdmin'
import AgregarLibro from '../operaciones-libros/AgregarLibro'
import BuscadorLibrosAdmin from '../search/BuscadorLibrosAdmin'
import BuscadorManualesAdmin from '../search/BuscadorManualesAdmin'
import AgregarManual from '../operaciones-manuales/AgregarManual'
import { JSX } from 'react'
import Mensajes from '../mensajes/Mensajes'
import AgregarPlantilla from '../operaciones-plantillas/AgregarPlantilla'

import GestionCategorias from '../operaciones-capacitacion/GestionCategoria'
import GestionTemas from '../operaciones-capacitacion/GestionTema'
import BackupSyncInfo from '../BorrarBackup/BackupInfo'

export const SelectExport2 = (seleccion: number) => {
  // Función para seleccionar la página en funcion del valor del indice de pestaña seleccionada
  switch (seleccion) {
    case 0:
      return <GestionUsers />
    case 1:
      return <GestionPlantillas />
    case 2:
      return <GestionDocumentos />
    case 3:
      return <GestionVideos />
    case 4:
      return <GestionProtocolos />
    case 5:
      return <GestionLibros />
    case 6:
      return <GestionManuales />
    case 7:
      return <Mensajeria />
    case 8:
      return <Capacitacion />

    default:
      'pagina no seleccionada'
      break
  }
}

interface Tab {
  name: string
  icon: JSX.Element
  link?: string
  component?: React.ComponentType // Añadir tipo de componente
  onClick?: () => void
}

export const GestionUsers = () => {
  const misTabs: Tab[] = [
    { name: 'Agregar', icon: <ArrowUpIcon />, component: RegistroUsuarios },
    {
      name: 'Consultar / Eliminar',
      icon: <BookCheck />,
      component: SearchUsers,
    },
  ]

  const [loading, setLoading] = useState(false)

  async function handleSyncBackup() {
    if (loading) return

    setLoading(true)
    try {
      const res = await fetch('/api/sync/', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        alert(data.message || 'Backup sincronizado correctamente')
      } else {
        alert('Error: ' + (data.error || 'fallo sin especificar'))
      }
    } catch (error: any) {
      alert('Error inesperado: ' + (error.message || error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <SubTabs tabs={misTabs} />

    </div>
  )
}

export const GestionVideos = () => {
  const misTabs: Tab[] = [
    { name: 'Agregar', icon: <ArrowUpIcon />, component: AgregarVideoPage },
    {
      name: 'Buscar / Eliminar ',
      icon: <BsCalendarCheck />,
      component: BuscadorVideosAdmin,
    },
  ]

  return (
    <div>
      <SubTabs tabs={misTabs} />
    </div>
  )
}

export const GestionDocumentos = () => {
  const misTabs: Tab[] = [
    { name: 'Agregar', icon: <ArrowUpIcon />, component: AgregarDocumento },
    {
      name: 'Buscar / Eliminar ',
      icon: <BsCalendarCheck />,
      component: BuscadorDocumentosAdmin,
    },
  ]

  return (
    <div>
      <SubTabs tabs={misTabs} />
    </div>
  )
}

export const GestionPlantillas = () => {
  const misTabs: Tab[] = [
    { name: 'Agregar', icon: <ArrowUpIcon />, component: AgregarPlantilla },
    {
      name: 'Buscar / Eliminar ',
      icon: <BsCalendarCheck />,
      // TODO: Crear y/o añadir el componente BuscadorPlantillasAdmin
      component: () => <p>Buscador de plantillas no implementado aún.</p>,
    },
  ]

  return (
    <div>
      <SubTabs tabs={misTabs} />
    </div>
  )
}

export const GestionProtocolos = () => {
  const misTabs: Tab[] = [
    { name: 'Agregar', icon: <ArrowUpIcon />, component: AgregarProtocolo },
    {
      name: 'Buscar / Eliminar ',
      icon: <BsCalendarCheck />,
      component: BuscadorProtocolosAdmin,
    },
  ]

  return (
    <div>
      <SubTabs tabs={misTabs} />
    </div>
  )
}

export const GestionLibros = () => {
  const misTabs: Tab[] = [
    { name: 'Agregar', icon: <ArrowUpIcon />, component: AgregarLibro },
    {
      name: 'Buscar / Eliminar ',
      icon: <BsCalendarCheck />,
      component: BuscadorLibrosAdmin,
    },
  ]

  return (
    <div>
      <SubTabs tabs={misTabs} />
    </div>
  )
}

export const GestionManuales = () => {
  const misTabs: Tab[] = [
    { name: 'Agregar', icon: <ArrowUpIcon />, component: AgregarManual },
    {
      name: 'Buscar / Eliminar ',
      icon: <BsCalendarCheck />,
      component: BuscadorManualesAdmin,
    },
  ]

  return (
    <div>
      <SubTabs tabs={misTabs} />
    </div>
  )
}

export const Mensajeria = () => {
  const misTabs: Tab[] = [
    {
      name: 'Enviar mensajes',
      icon: <MessageCircleIcon />,
      component: Mensajes,
    },
  ]

  return (
    <div>
      <SubTabs tabs={misTabs} />
    </div>
  )
}

export const Capacitacion = () => {
  const misTabs: Tab[] = [
    {
      name: 'Agregar pestaña Categoría',
      icon: <PlusIcon />,
      component: GestionCategorias,
    },
    {
      name: 'Agregar tema al menú',
      icon: <MenuIcon />,
      component: GestionTemas,
    },
  ]

  return (
    <div>
      <SubTabs tabs={misTabs} />
    </div>
  )
}
