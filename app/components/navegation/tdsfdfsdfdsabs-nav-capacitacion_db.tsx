'use client';

import { BookCheck, TvIcon } from 'lucide-react'
import SubTabs from '@/app/components/navegation/subtabs'
import PaginaDocumentos from '../operaciones-documentos/CargarDocumento'
import PaginaVideos from '../operaciones-videos/CargaVideos'




export const SelectExport = () => {
  

  const misTabs = [
    { name: 'Videos', icon: <TvIcon />, component: PaginaVideos }, //componente a usar
    { name: 'Documentos', icon: <BookCheck />, component: PaginaDocumentos }
  ]

  return (
    <div>
      <SubTabs tabs={misTabs} />
    </div>
  )
}

