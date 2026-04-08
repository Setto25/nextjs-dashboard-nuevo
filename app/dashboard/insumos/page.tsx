'use client'

import React from 'react';
import OperacionesInsumos from '@/app/components/operaciones-insumos/OperacionesInsumos';
import ControlSemanalStock from '@/app/components/operaciones-insumos/ControlSemanalStock';
import { PackageOpen, Boxes, ArrowRightLeft } from 'lucide-react';
import SubTabs from '@/app/components/navegation/subtabs';
import '@/app/ui/global.css';

export default function Page() {
  const misTabs = [
    { name: 'Gestión de Insumos', icon: <PackageOpen className="w-5 h-5 mx-auto" />, component:OperacionesInsumos },
    { name: 'Movimientos de Insumos', icon: <ArrowRightLeft className="w-5 h-5 mx-auto" />, component: ControlSemanalStock }
  ];

  return (
    <div className="w-full h-full min-h-screen bg-gray-50">
      <SubTabs tabs={misTabs} variant="pills" />
    </div>
  );
}
