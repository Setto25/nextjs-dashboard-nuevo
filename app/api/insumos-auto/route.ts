export const maxDuration = 60; //aumenta el limite timeout de vercel de 15 a 60
export const dynamic = "force-dynamic"; // <--- Indispensable para que lea los datos frescos

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { calcularDistribucionMensual } from "@/app/components/operaciones-insumos/CalculoDistribucionMensual";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
    return NextResponse.json(
      { error: "Acceso denegado: API Key no válida o ausente" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const items = Array.isArray(body) ? body : [body];

    const db = prisma as any;
    const operaciones = items.map((pack: any) => {
      
      // Creamos un objeto limpio con validaciones contra nulos
      const datosInsumo = {
          subdireccion: pack.subdireccion || null,
          enero: pack.enero || 0,
          febrero: pack.febrero || 0,
          marzo: pack.marzo || 0,
          abril: pack.abril || 0,
          mayo: pack.mayo || 0,
          junio: pack.junio || 0,
          julio: pack.julio || 0,
          agosto: pack.agosto || 0,
          septiembre: pack.septiembre || 0,
          octubre: pack.octubre || 0,
          noviembre: pack.noviembre || 0,
          diciembre: pack.diciembre || 0,
          total: pack.total || 0,
          reservado: pack.reservado || 0,
          consumo: pack.consumo || 0,
          saldo: pack.saldo || 0,
          // Uso de ?. para evitar crashes si el objeto no existe
          idArticulo: pack.articulo?.idArticulo || 0,
          articuloDescripcion: pack.articulo?.descripcion || "Sin descripción",
          idZgen: pack.articulo?.zgen?.idZgen || null,
          idServicio: pack.servicioOc?.idServicio || null,
          servicioDescripcion: pack.servicioOc?.descripcion || null,
      };

      return db.insumosAuto.upsert({
        where: { idPack: pack.idPack },
        update: datosInsumo,
        create: {
          idPack: pack.idPack,
          ...datosInsumo
        },
      });
    });

    const guardados = await prisma.$transaction(operaciones, {
  maxWait: 5000,  // Tiempo máximo de espera para agarrar la conexión
  timeout: 60000, // Tiempo máximo para terminar de guardar todo (30 segundos)
});


    return NextResponse.json({
      message: `Se guardaron ${guardados.length} packs exitosamente en Neon.`,
      status: 200,
    });
  } catch (error) {
    // AQUI ESTA EL VERDADERO ERROR
    console.error("Error detallado guardando en Neon:", error);
    
    // Devolvemos el mensaje de error de Prisma en modo desarrollo para que puedas leerlo en Python
    return NextResponse.json({ 
        error: "Error interno al guardar en Neon", 
        detalles: error instanceof Error ? error.message : "Error desconocido" 
    }, { status: 500 });
  }
}

// 2. OBTENER DE NEON Y APLICAR CÁLCULO DE CONSUMOS (GET)
export async function GET() {
  try {
    const db = prisma as any;
    const packsGuardados = await db.insumosAuto.findMany({
      orderBy: { idPack: "asc" },
    });


    // Mapeamos los datos de Neon al formato del calculador
    const procesados = packsGuardados.map((pack: any) => {
      const packFormatted = {
        idPack: pack.idPack,
        total: pack.total,
        consumo: pack.consumo,
        enero: pack.enero,
        febrero: pack.febrero,
        marzo: pack.marzo,
        abril: pack.abril,
        mayo: pack.mayo,
        junio: pack.junio,
        julio: pack.julio,
        agosto: pack.agosto,
        septiembre: pack.septiembre,
        octubre: pack.octubre,
        noviembre: pack.noviembre,
        diciembre: pack.diciembre,
        articulo: {
          idArticulo: pack.idArticulo,
          descripcion: pack.articuloDescripcion,
        },
        servicioOc: pack.idServicio
          ? {
              idServicio: pack.idServicio,
              descripcion: pack.servicioDescripcion || "",
            }
          : undefined,
      };

      // Aplica la distribución de consumos y restantes en 12 meses
      return calcularDistribucionMensual(packFormatted);
    });

    return NextResponse.json(procesados);
  } catch (error) {
    console.error("Error consultando Neon:", error);
    return NextResponse.json({ error: "Error consultando la base de datos" }, { status: 500 });
  }
}
