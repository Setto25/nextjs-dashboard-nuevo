import csv
import json
import urllib.request
import urllib.error
import datetime

# --- CONFIGURACIÓN ---
API_BASE_URL = "http://localhost:3000/api"
ARCHIVO_CSV = "importacion.csv"
ANIO_ACTUAL = datetime.datetime.now().year
MES_ACTUAL = datetime.datetime.now().month

def obtener_insumos():
    print("Obteniendo insumos del servidor...")
    try:
        req = urllib.request.Request(f"{API_BASE_URL}/insumos")
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            # Ya vienen ordenados por código desde la API
            return data
    except Exception as e:
        print(f"Error al conectar con la API: {e}")
        print("Asegúrate de que 'npm run dev' esté corriendo en http://localhost:3000")
        exit(1)

def procesar_csv():
    retiros = []
    print(f"Leyendo archivo {ARCHIVO_CSV}...")
    try:
        with open(ARCHIVO_CSV, mode='r', encoding='utf-8-sig') as f:
            reader = csv.reader(f)
            for row in reader:
                if not row: continue
                # Limpiar la celda de espacios o comillas
                val_str = row[0].strip()
                if val_str.isdigit():
                    retiros.append(int(val_str))
                else:
                    # Si hay encabezados o texto, asumimos 0 o lo ignoramos
                    print(f"Ignorando línea no numérica: {val_str}")
    except FileNotFoundError:
        print(f"No se encontró el archivo {ARCHIVO_CSV}. Por favor créalo en esta carpeta.")
        exit(1)
    return retiros

def generar_movimientos(insumos, retiros_csv):
    movimientos_a_enviar = []
    
    # Recorremos emparejando el insumo (de la base de datos) con el número de la línea del CSV
    for idx, insumo in enumerate(insumos):
        if idx >= len(retiros_csv):
            print(f"Advertencia: El CSV tiene menos líneas que los insumos en la base de datos. Se detuvo en {insumo['codigo']}.")
            break
            
        retiro_total = retiros_csv[idx]
        if retiro_total <= 0:
            continue
            
        id_insumo = insumo['id']
        codigo = insumo['codigo']
        stock_original = insumo['stockOriginal']
        
        # Calcular cuota mensual (Límite base)
        limite_mensual = stock_original // 12 if stock_original else 0
        
        # Si el límite es 0 (no tiene stock original), no hay mucho que distribuir, se lanza todo a Enero
        if limite_mensual == 0:
            fecha_iso = f"{ANIO_ACTUAL}-01-15T12:00:00.000Z"
            movimientos_a_enviar.append({
                "idInsumo": id_insumo,
                "balanceRetiros": -retiro_total,
                "fecha": fecha_iso
            })
            continue

        retiro_restante = retiro_total
        mes_iterador = 1 # Empezamos en enero
        
        print(f"[{codigo}] A distribuir: {retiro_total} (Cuota: {limite_mensual}/mes)")
        
        # Bucle de Spill-over (Distribución en el tiempo)
        while retiro_restante > 0:
            # Cuánto voy a descontar en este mes (el límite o lo que sobra)
            a_descontar_este_mes = min(limite_mensual, retiro_restante)
            
            # Formatear la fecha para simular que ocurrió a mediados de ese mes
            mes_str = str(mes_iterador).zfill(2)
            fecha_iso = f"{ANIO_ACTUAL}-{mes_str}-15T12:00:00.000Z"
            
            movimientos_a_enviar.append({
                "idInsumo": id_insumo,
                "balanceRetiros": -a_descontar_este_mes,
                "fecha": fecha_iso
            })
            
            retiro_restante -= a_descontar_este_mes
            mes_iterador += 1
            
            # Si superamos diciembre, se tira todo el remanente en diciembre para no romper años
            if mes_iterador > 12:
                if retiro_restante > 0:
                    fecha_iso_dic = f"{ANIO_ACTUAL}-12-20T12:00:00.000Z"
                    movimientos_a_enviar.append({
                        "idInsumo": id_insumo,
                        "balanceRetiros": -retiro_restante,
                        "fecha": fecha_iso_dic
                    })
                    retiro_restante = 0

    return movimientos_a_enviar

def enviar_al_servidor(movimientos):
    if not movimientos:
        print("No hay movimientos válidos para enviar.")
        return
        
    print(f"Enviando lote de {len(movimientos)} registros al servidor...")
    
    payload = json.dumps({"movimientos": movimientos}).encode('utf-8')
    req = urllib.request.Request(f"{API_BASE_URL}/movimientos/batch", data=payload, method="POST")
    req.add_header("Content-Type", "application/json")
    
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 201:
                print("✅ ¡Importación masiva completada con éxito!")
            else:
                print(f"Respuesta inesperada: {response.status}")
    except urllib.error.HTTPError as e:
        error_info = e.read().decode()
        print(f"❌ Error del Servidor ({e.code}): {error_info}")
    except Exception as e:
        print(f"❌ Error de red: {e}")

if __name__ == "__main__":
    print("=== INICIANDO IMPORTADOR DE STOCK ===")
    lista_insumos = obtener_insumos()
    print(f"Se encontraron {len(lista_insumos)} insumos en el sistema.")
    
    retiros = procesar_csv()
    print(f"Se leyeron {len(retiros)} líneas del CSV.")
    
    movimientos = generar_movimientos(lista_insumos, retiros)
    
    if input(f"\nSe generarán {len(movimientos)} transacciones fraccionadas por mes. ¿Deseas continuar? (S/N): ").strip().upper() == 'S':
        enviar_al_servidor(movimientos)
    else:
        print("Operación cancelada por el usuario.")
