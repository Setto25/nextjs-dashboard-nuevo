'use client';

import Link from 'next/link';
import AcmeLogo from '@/app/ui/acme-logo';
import { PowerIcon } from '@heroicons/react/24/outline';
import NavLinks from '@/app/components/navegation/nav-links';
import '@/app/ui/global/shadows.css'
import LogoutPage from '../../logout/Logout';

export default function SideNav() {
  return (
    <div className="sidebar flex h-full flex-col px-3 py-4 md:px-2 bg-gradient-to-b from-slate-800 to-slate-900 transition-colors duration-300 border-r border-slate-700/50 shadow-xl"> {/* Sidebar Oscuro Premium */}
      <Link
        className="sidebar__logo-fondo mb-2 flex h-20 items-end justify-center rounded-xl p-4 md:h-40 overflow-hidden ring-1 ring-white/10"
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
      <div className="sidebar__items flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-1 rounded-2xl mt-2"> {/* Contenedor de los items del menú */}
        <NavLinks />
        <div className="sidebar__spaciador hidden h-auto w-full grow md:block rounded-2xl"></div>

        <div className="sidebar__logout"> {/* Contenedor del botón de logout */}
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