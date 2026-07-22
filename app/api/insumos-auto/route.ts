// app/api/packs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { calcularDistribucionMensual } from "@/app/components/operaciones-insumos/CalculoDistribucionMensual";

// 1. RECIBIR Y GUARDAR DESDE PYTHON (POST)
export async function POST(req: NextRequest) {

  //IMPORTANTE: Este endpoint recibira datos de un script, por seguridad se validara mediante apikey
  //Validar la API Key enviada en la cabecera HTTP
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
    return NextResponse.json(
      { error: "Acceso denegado: API Key no válida o ausente" },
      { status: 401 }
    );
  }
  // Si la clave es correcta, procede a guardar en Neon...

  try {
    const body = await req.json();
    const items = Array.isArray(body) ? body : [body];

    const db = prisma as any;
    const operaciones = items.map((pack: any) => {
      return db.insumosAuto.upsert({
        where: { idPack: pack.idPack },
        update: {
          subdireccion: pack.subdireccion,
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
          total: pack.total,
          reservado: pack.reservado || 0,
          consumo: pack.consumo || 0,
          saldo: pack.saldo || 0,
          idArticulo: pack.articulo.idArticulo,
          articuloDescripcion: pack.articulo.descripcion,
          idZgen: pack.articulo.zgen?.idZgen,
          idServicio: pack.servicioOc?.idServicio,
          servicioDescripcion: pack.servicioOc?.descripcion,
        },
        create: {
          idPack: pack.idPack,
          subdireccion: pack.subdireccion,
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
          total: pack.total,
          reservado: pack.reservado || 0,
          consumo: pack.consumo || 0,
          saldo: pack.saldo || 0,
          idArticulo: pack.articulo.idArticulo,
          articuloDescripcion: pack.articulo.descripcion,
          idZgen: pack.articulo.zgen?.idZgen,
          idServicio: pack.servicioOc?.idServicio,
          servicioDescripcion: pack.servicioOc?.descripcion,
        },
      });
    });

    const guardados = await prisma.$transaction(operaciones);

    return NextResponse.json({
      message: `Se guardaron ${guardados.length} packs exitosamente en Neon.`,
      status: 200,
    });
  } catch (error) {
    console.error("Error guardando en Neon:", error);
    return NextResponse.json({ error: "Error interno al guardar en Neon" }, { status: 500 });
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
