import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import { PowerIcon } from '@heroicons/react/24/outline';

export default function SideNav() {
  return (
    <div className="sidebar flex h-full flex-col px-3 py-4 md:px-2 hover:bg-gray-100 transition-colors duration-300 cursor-pointer shadow-2xl"> {/* Bloque principal: sidebar */}
      <Link
        className="sidebar__logo-fondo mb-2 flex h-20 items-end justify-center rounded-md p-4 md:h-40 shadow-[6px_6px_10px_-1px_rgba(0,0,0,0.15)]"
        style={{
          backgroundImage: 'url(/cabecera9.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        href="/"
      >
        <div className="sidebar__logo-imagen h-full"> {/* Contenedor del logo */}
          <AcmeLogo />
        </div>
      </Link>
      <div className="sidebar__items flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2 shadow-[6px_6px_10px_-1px_rgba(0,0,0,0.15)] rounded-2xl"> {/* Contenedor de los items del menú */}
        <NavLinks />
        <div className="sidebar__spaciador hidden h-auto w-full grow bg-lime-300 md:block shadow-[6px_6px_10px_-1px_rgba(0,0,0,0.15)] rounded-2xl"></div>

        <div className="sidebar__logout"> {/* Contenedor del botón de logout */}
          <form>
            <button className="sidebar__logout-button flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-lime-300 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3 shadow-[6px_6px_10px_-1px_rgba(0,0,0,0.15)]">
              <PowerIcon className="w-6" />
              <div className="hidden md:block">Sign Out</div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}