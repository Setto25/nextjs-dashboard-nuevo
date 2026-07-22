export interface PackInput {
  idPack: number;
  total: number;
  consumo: number;
  enero?: number;
  febrero?: number;
  marzo?: number;
  abril?: number;
  mayo?: number;
  junio?: number;
  julio?: number;
  agosto?: number;
  septiembre?: number;
  octubre?: number;
  noviembre?: number;
  diciembre?: number;
  articulo: {
    idArticulo: number;
    descripcion: string;
  };
  servicioOc?: {
    idServicio: number;
    descripcion: string;
  };
}

export interface DesgloseMes {
  mesNombre: string;
  numMes: number;
  cuotaMensual: number;
  consumoMes: number;
  restanteMes: number;
}

export function calcularDistribucionMensual(
  pack: PackInput,
  mesActualNum: number = new Date().getMonth() + 1
) {
  const nombresMeses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  const total = pack.total || 0;
  const cuotaBaseDefault = Math.floor(total / 12);
  let consumoPendiente = pack.consumo || 0;

  const desgloses: DesgloseMes[] = nombresMeses.map((nombre, index) => {
    const numMes = index + 1;

    // Si el pack trae la cuota específica del mes (ej: pack.enero = 200), la usamos.
    // De lo contrario, usamos la cuota base total / 12.
    const cuotaConfigurada = (pack as any)[nombre];
    const cuotaMensual = (typeof cuotaConfigurada === "number" && cuotaConfigurada > 0)
      ? cuotaConfigurada
      : (numMes === 12 ? total - (cuotaBaseDefault * 11) : cuotaBaseDefault);

    // Se carga el consumo secuencialmente mes por mes
    let consumoMes = 0;
    if (consumoPendiente > 0) {
      consumoMes = Math.min(cuotaMensual, consumoPendiente);
      consumoPendiente -= consumoMes;
    }

    const restanteMes = Math.max(0, cuotaMensual - consumoMes);

    return {
      mesNombre: nombre,
      numMes,
      cuotaMensual,
      consumoMes,
      restanteMes,
    };
  });

  return {
    ...pack,
    cuotaBaseDefault,
    mesActualNum,
    desgloses,
  };
}
