'use client'

import React, { useState } from 'react';
import OperacionesInsumos from '@/app/components/operaciones-insumos/OperacionesInsumos';
import ControlSemanalStock from '@/app/components/operaciones-insumos/ControlSemanalStock';
import { PackageOpen, Boxes } from 'lucide-react';
import clsx from 'clsx';
import '@/app/ui/global.css';

export default function Page() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-gray-50">
      {/* Tabs Header */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab(0)}
              className={clsx(
                'flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 0
                  ? 'border-lime-500 text-lime-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <PackageOpen className="w-5 h-5 mr-2" />
              Gestión de Insumos y Stock
            </button>
            <button
              onClick={() => setActiveTab(1)}
              className={clsx(
                'flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 1
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <Boxes className="w-5 h-5 mr-2" />
              Gestión del Número de Insumos
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 w-full bg-transparent">
        {activeTab === 0 && <OperacionesInsumos />}
        {activeTab === 1 && (
          <div className="w-full h-full">
            <ControlSemanalStock />
          </div>
        )}
      </div>
    </div>
  );
}
