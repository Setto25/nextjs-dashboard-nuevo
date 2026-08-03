import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';

/**
 * Registra un evento en la bitácora de auditoría de forma asíncrona.
 * Cuenta con geolocalización por IP automática no bloqueante para inicios de sesión.
 */
export async function registrarLog(
  req: NextRequest,
  accion: 'INICIO_SESION' | 'ACCESO_PAGINA',
  modulo: 'AUTENTICACION' | 'NAVEGACION',
  detalles: Record<string, any> = {},
  sessionOverride?: { id: number; email: string; role: string }
) {
  try {
    let userId: number | undefined;
    let email: string | undefined;
    let rut: string | undefined;
    let nombre: string | undefined;

    // 1. Obtener datos de la cookie de sesión o usar el override
    const sessionCookie = req.cookies.get('session');
    const sessionData = sessionOverride || (sessionCookie ? JSON.parse(sessionCookie.value) : null);

    if (sessionData) {
      try {
        userId = sessionData.id;
        email = sessionData.email;

        // Buscar datos históricos en tiempo real del usuario en la DB para máxima consistencia
        if (userId) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { rut: true, nombre: true, apellido1: true, apellido2: true }
          });
          if (user) {
            rut = user.rut;
            nombre = `${user.nombre} ${user.apellido1} ${user.apellido2 || ''}`.trim();
          }
        }
      } catch (parseError) {
        console.error('Error al decodificar sesión para log:', parseError);
      }
    }

    // 2. Extraer IP limpia
    let ip = req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1';
    ip = ip.split(',')[0].trim();
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('fe80:')) {
      ip = '127.0.0.1';
    }

    let ubicacion = 'Desarrollo Local';

    // 3. Geolocalizar solo en inicio de sesión e IPs no locales
    if (accion === 'INICIO_SESION') {
      // Autolimpieza automática: borrar registros de navegación y sesión de más de 30 días para proteger el límite de Neon gratis
      try {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 30);
        await prisma.auditLog.deleteMany({
          where: {
            fecha: {
              lt: fechaLimite
            }
          }
        });
      } catch (cleanErr) {
        console.error('Error silencioso al purgar logs antiguos:', cleanErr);
      }

      if (ip !== '127.0.0.1' && ip !== 'localhost') {
        try {
          // Hacemos una carrera (Promise.race) con un timeout estricto de 1.5s
          const geoPromise = fetch(`http://ip-api.com/json/${ip}`)
            .then((res) => res.json())
            .then((data) => {
              if (data && data.status === 'success') {
                const country = data.country || '';
                const region = data.regionName || '';
                const city = data.city || '';
                return [city, region, country].filter(Boolean).join(', ');
              }
              return 'Ubicación Desconocida';
            });

          const timeoutPromise = new Promise<string>((resolve) =>
            setTimeout(() => resolve('Ubicación Desconocida (Timeout)'), 1500)
          );

          ubicacion = await Promise.race([geoPromise, timeoutPromise]);
        } catch (err) {
          console.error('Error al geolocalizar IP:', err);
          ubicacion = 'Ubicación Desconocida (Error)';
        }
      }
    }

    // 4. Registrar en la base de datos
    const finalDetalles = { ...detalles, ubicacion };

    await prisma.auditLog.create({
      data: {
        userId,
        rut,
        nombre,
        email,
        accion,
        modulo,
        detalles: JSON.stringify(finalDetalles),
        ip
      }
    });
  } catch (error) {
    console.error('Error crítico al guardar log de auditoría:', error);
  }
}
