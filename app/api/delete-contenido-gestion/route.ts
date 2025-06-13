import { NextResponse } from "next/server";
import cleanVideos from "@/limpiar-videos"; // Ajusta la ruta según tu estructura
import cleanDocumentos from "@/limpiar-documentos";
import cleanProtocolos from "@/limpiar-protocolos";
import cleanManuales from "@/limpiar-manuales";
import cleanLibros from "@/limpiar-libros"; // Asegúrate de que esta función esté definida

export async function POST() {
  await cleanVideos();
  await cleanDocumentos();
  await cleanProtocolos();
  await cleanManuales();
    await cleanLibros();
  return NextResponse.json({ message: "Limpieza completada" });
}