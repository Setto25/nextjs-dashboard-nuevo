'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationTracker() {
  const pathname = usePathname();
  const lastPathname = useRef<string>('');

  useEffect(() => {
    // Solo registrar si el pathname es válido, diferente al anterior y estamos en el dashboard
    if (pathname && pathname !== lastPathname.current && pathname.startsWith('/dashboard')) {
      lastPathname.current = pathname;

      // Realizar el envío de forma completamente silenciosa y asíncrona
      const registrarNavegacion = async () => {
        try {
          await fetch('/api/admin/auditoria/navegacion', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ruta: pathname }),
          });
        } catch (error) {
          // Ignorar cualquier fallo de red para que el usuario no vea errores en la consola
        }
      };

      registrarNavegacion();
    }
  }, [pathname]);

  // Este componente es invisible, no renderiza nada en pantalla
  return null;
}
