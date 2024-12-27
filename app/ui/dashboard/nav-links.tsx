'use client';  

import {  
  UserGroupIcon,  
  HomeIcon,  
  DocumentDuplicateIcon,  
} from '@heroicons/react/24/outline';  
import Link from 'next/link';  
import { usePathname } from 'next/navigation';  
import clsx from 'clsx';  
import { useState } from 'react';  
import { CubeIcon } from '@heroicons/react/20/solid';
import { PlusIcon } from '@heroicons/react/24/solid';
import { PresentationChartBarIcon } from '@heroicons/react/16/solid';
import { LibraryBigIcon, LibraryIcon } from 'lucide-react';

// Lista de enlaces principales  
const links = [  
  {  
    name: 'Home',  
    href: '/dashboard',  
    icon: HomeIcon,  
  },  
  {  
    name: 'Capacitación',  
    href: '/dashboard/capacitacion',
    icon: PresentationChartBarIcon,  
 
  },  
  {  
    name: 'Protocolos',  
    href: '/dashboard/protocolos',  
    icon: DocumentDuplicateIcon ,  
  },  
  {  
    name: 'Biblioteca Digital',  
    href: '/dashboard/biblioteca',  
    icon: LibraryBigIcon,  
    submenus: [  
      { name: 'Videos', href: '/dashboard/videos' },  
      { name: 'Clases', href: '/dashboard/clases' },  
    ],  
  },  
  {  
    name: 'Herramientas',  
    href: '/dashboard/herramientas',  
    icon: CubeIcon, 
    submenus: [  
      { name: 'Videos', href: '/dashboard/videos' },  
      { name: 'Clases', href: '/dashboard/clases' },  
    ],  
  },  
  {  
    name: 'Noticias',  
    href: '/dashboard/noticias',  
    icon: PlusIcon,  
  },  
  {  
    name: 'Mi Perfil',  
    href: '/dashboard/mi_perfil',  
    icon: DocumentDuplicateIcon ,  
  },  
];  

export default function NavLinks() {  
  const pathname = usePathname(); // Obtiene la ruta actual  
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]); // Lista de menús expandidos  
  

  // Función para alternar la expansión de un menú  
  const ExpansibleMenu = (menuName: string) => {   // Actualiza el estado expandedMenus usando una función de callback para acceder al valor anterior (prev)
 setExpandedMenus((prev) =>      // Verifica si el menuName ya está incluido en el array prev (si ya está expandido)
  
  prev.includes(menuName)   // Si menuName está incluido (ya está expandido), se ejecuta esta parte (CONTRAER)
    ?                       // Crea un nuevo array excluyendo el menuName usando filter
      prev.filter((name) => name !== menuName)
    : // Si menuName NO está incluido (no está expandido), se ejecuta esta parte (EXPANDIR)
      [...prev, menuName]  // Crea un nuevo array con los elementos de prev más el menuName usando el spread operator
);
};
  return (  
    <>  
      {links.map((link) => {  
        const LinkIcon = link.icon; // Extraer el ícono del enlace  
        const onOff = useState<boolean>(false);
        const isExpanded = expandedMenus.includes(link.name); // Verificar si este menú está expandido, es decir, si el array de menús expandidos incluye el nombre de este menú 
        

        // Si el enlace tiene submenús  
        if (link.submenus) {  
     

          return (  
            <div key={link.name} className="w-full">  


            

              {/* Enlace principal con submenú */}  
              <div  
                onClick={() => ExpansibleMenu(link.name)} // Alternar expansión  
                className={clsx(   //clsx es una función que combina clases condicionalmente
                  'flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-sm font-bold shadow-md',  
                  isExpanded  && pathname.includes('/dashboard/capacitacion') 
                    ? 'bg-sky-400 text-white'  
                    : 'bg-lime-300 hover:bg-sky-100 hover:text-black',  
                )}  
              >  
                <LinkIcon className="w-6" />  
                <p className="ml-2 hidden md:block">{link.name}</p>  
              </div>  

              {/* Submenú (solo visible si está expandido) */}  
              {isExpanded && (  
                <div className="ml-6 mt-2 space-y-1">  
                  {link.submenus.map((submenu) => (  
                    <Link  
                      key={submenu.name}  
                      href={submenu.href}  
                      className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 hover:text-black"  
                    >  
                      {submenu.name}  
                    </Link>  
                  ))}  
                </div>  
              )}  
            </div>  
          );  
        }  

        // Para los enlaces regulares (sin submenú)  
        return (  
          <Link  
      
            key={link.name}  
            href={link.href}  
            onClick={() => ExpansibleMenu(link.name)} 
            className={clsx(  
              'flex h-[48px] w-full items-center rounded-md px-3 py-2 text-sm font-bold shadow-md',  
              pathname === link.href 
                ? 'bg-sky-400 text-white'  
                : 'bg-lime-300 hover:bg-sky-100 hover:text-black',  
            )}  
          >  
            <LinkIcon className="w-6" />  
            <p className="ml-2 hidden md:block">{link.name}</p>  
          </Link>  
        );  
      })}  
    </>  
  );  
}

/*
Este componente renderiza un menú de navegación dinámico en React.
Utiliza un array 'links' para definir los enlaces, incluyendo iconos, rutas y submenús.
'usePathname' obtiene la ruta actual para aplicar estilos de "activo".
'useState' maneja el estado de expansión de los submenús (almacena los nombres de los menús expandidos).
La función 'ExpansibleMenu' actualiza el estado de expansión:
  - Si un menú ya está en 'expandedMenus', lo elimina (contrae).
  - Si no está, lo añade (expande).
El componente itera sobre 'links' y renderiza un 'Link' de Next.js para cada enlace.
Si un enlace tiene 'submenus', renderiza un menú desplegable condicionalmente según 'isExpanded'.
'clsx' se usa para aplicar clases CSS condicionales de forma más concisa.

-En el if, se verifica si el enlace tiene submenús.Dependiendo de eso estan las siguientes acciones:
  -Si el enlace tiene submenús, se verifica si está expandido y se renderiza el submenú si es así.
  -Si no tiene submenús, se renderiza un enlace regular.
*/