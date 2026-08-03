'use client';

import { useState } from 'react';
import Link from 'next/link';
import AcmeLogo from '@/app/ui/acme-logo';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import NavLinks from '@/app/components/navegation/nav-links';
import '@/app/ui/global/shadows.css'
import LogoutPage from '../../logout/Logout';

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="sidebar flex h-full flex-col px-3 py-4 md:px-2 bg-gradient-to-b from-slate-800 to-slate-900 transition-colors duration-300 border-r border-slate-700/50 shadow-xl">
      {/* Cabecera con Logo y Botón de Menú (Mobile) */}
      <div className="flex items-center justify-between md:block mb-2">
        <Link
          className="sidebar__logo-fondo flex h-20 items-end justify-center rounded-xl p-4 md:h-40 overflow-hidden ring-1 ring-white/10 w-full md:w-auto"
          style={{
            backgroundImage: 'url(/cabecera9.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
          href="/">
          <div className="sidebar__logo-imagen h-full"> {/* Contenedor del logo */}
            <AcmeLogo />
          </div>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden ml-2 p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg focus:outline-none transition-colors"
        >
          {isOpen ? <XMarkIcon className="w-8 h-8" /> : <Bars3Icon className="w-8 h-8" />}
        </button>
      </div>

      {/* Contenedor de los items del menú */}
      <div className={`sidebar__items grow flex-col space-y-2 md:space-y-1 rounded-2xl mt-2 ${isOpen ? 'flex' : 'hidden'} md:flex`}>
        <NavLinks />
        <div className="sidebar__spaciador hidden h-auto w-full grow md:block rounded-2xl"></div>

        <div className="sidebar__logout mt-4 md:mt-0">
          <form>
            <div className="sidebar__logout-button flex h-[48px] w-full grow items-center justify-center gap-2 rounded-xl bg-white/[0.05] p-3 text-sm font-medium text-slate-400 hover:bg-red-500/[0.15] hover:text-red-400 transition-all duration-200 md:flex-none md:justify-start md:p-2 md:px-3 border border-white/[0.05]">
               <LogoutPage/>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}