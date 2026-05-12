import csv
import psycopg2
import psycopg2.extras
import uuid
import datetime

# ==============================================================================
# SCRIPT DE MIGRACIÓN HISTÓRICA DE INSUMOS (VERSIÓN AUTÓNOMA)
# ==============================================================================
# Este script se conecta directamente a la base de datos PostgreSQL (Neon) 
# saltándose la aplicación web Next.js. Esto permite procesar miles de datos 
# en milisegundos y aplicar lógicas complejas de distribución de stock de 
# forma segura (usando Transacciones SQL).
# ==============================================================================

# --- CONFIGURACIÓN DE BASE DE DATOS ---
# Debes pegar aquí la URL de conexión que sacas de tu archivo .env
DB_URL = "AQUI_TU_CONNECTION_STRING_DE_NEON"

# Archivo de Excel convertido a CSV (Valores separados por comas o saltos de línea)
ARCHIVO_CSV = "importacion.csv"
ANIO_ACTUAL = datetime.datetime.now().year

def conectar_db():
    """Establece la conexión directa con PostgreSQL."""
    print("Conectando a la base de datos...")
    try:
        conn = psycopg2.connect(DB_URL)
        return conn
    except Exception as e:
        print(f"Error crítico de conexión: {e}")
        exit(1)

def leer_csv():
    """
    Lee el archivo CSV con la lista de retiros.
    Cuenta con un 'limpiador universal' que extrae los números sin importar 
    si el archivo viene separado por comas, puntos y comas, o saltos de línea raros.
    Devuelve una lista plana de números enteros: [10, 50, 0, 120, ...]
    """
    retiros = []
    print(f"Leyendo {ARCHIVO_CSV}...")
    try:
        with open(ARCHIVO_CSV, mode='r', encoding='utf-8-sig') as f:
            content = f.read()
            # Convertimos cualquier separador extraño (comas, punto y coma) en espacios blancos
            content = content.replace(';', ' ').replace(',', ' ').replace('\n', ' ')
            
            # .split() divide automáticamente por los espacios en blanco
            for item in content.split():
                val_str = item.strip()
                if val_str.isdigit():
                    retiros.append(int(val_str))
                else:
                    # Si pegaron números con decimales por accidente (ej: "10.0") lo reparamos a 10
                    try:
                        retiros.append(int(float(val_str)))
                    except ValueError:
                        pass
    except FileNotFoundError:
        print(f"No se encontró el archivo {ARCHIVO_CSV}.")
        exit(1)
    return retiros

def procesar_e_importar(conn, retiros_csv):
    """
    Lógica central. Toma los retiros leídos del CSV y los cruza con los 
    insumos de la base de datos para inyectarlos retroactivamente.
    """
    try:
        # Usamos DictCursor para poder leer las columnas por nombre (ej: insumo['codigo'])
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        # 1. Obtenemos TODOS los insumos ordenados alfabéticamente (A-Z)
        # Esto es vital para que la Línea 1 del CSV coincida con el Insumo 1 de la DB
        cursor.execute('SELECT id, codigo, "stockOriginal" FROM "Insumo" ORDER BY codigo ASC')
        insumos = cursor.fetchall()
        
        if not insumos:
            print("No se encontraron insumos en la base de datos.")
            return

        print(f"Procesando {len(retiros_csv)} líneas contra {len(insumos)} insumos...")

        # 2. Recorremos los insumos uno por uno
        for idx, insumo in enumerate(insumos):
            # Si el CSV se acabó, paramos el proceso
            if idx >= len(retiros_csv):
                break
                
            # Extraemos el número correspondiente del Excel
            retiro_total = retiros_csv[idx]
            
            # Si en este insumo no retiraron nada, lo saltamos y vamos al siguiente
            if retiro_total <= 0:
                continue
                
            # Extraemos los datos del insumo actual de la base de datos
            insumo_id = insumo['id']
            codigo = insumo['codigo']
            stock_original = insumo['stockOriginal']
            
            # Calculamos la cuota base del mes (Lo mismo que hace la plataforma web)
            limite_mensual = stock_original // 12 if stock_original else 0
            
            # Caso de Borde: Si el insumo no tenía stock original, su límite es 0. 
            # Como no podemos dividir en cero, le inyectamos toda la deuda directo al mes 1 (Enero).
            if limite_mensual == 0:
                _insertar_movimiento_directo(cursor, insumo_id, 1, -retiro_total)
                continue

            retiro_restante = retiro_total
            mes_iterador = 1 # Empezamos simulando que estamos en Enero
            
            print(f"[{codigo}] Insertando retroactivamente: {retiro_total} (Cuota base: {limite_mensual})")
            
            mes_actual = datetime.datetime.now().month
            
            # 3. EL BUCLE DE DISTRIBUCIÓN (SPILL-OVER HACIA EL PASADO)
            # Mientras queden retiros por justificar, seguimos iterando por los meses
            while retiro_restante > 0:
                
                if mes_iterador < mes_actual:
                    # Si estamos en meses pasados (Enero a Abril), descontamos solo el "Límite" (ej: 200)
                    a_descontar = min(limite_mensual, retiro_restante)
                else:
                    # Si llegamos al mes actual (Mayo), se nos acabó el viaje en el tiempo.
                    # Volcamos todo el remanente gigante de golpe en el mes actual. (Opción A)
                    # Esto causará que el mes actual quede en números negativos (Sobregiro).
                    a_descontar = retiro_restante
                
                # Función auxiliar para inyectar este descuento a la Base de Datos
                _insertar_movimiento_directo(cursor, insumo_id, mes_iterador, -a_descontar)
                
                # Restamos lo que ya justificamos y avanzamos al siguiente mes
                retiro_restante -= a_descontar
                mes_iterador += 1
                
                # Regla de seguridad extrema: Si la matemática se vuelve loca y superamos Diciembre,
                # volcamos todo el sobrante forzosamente en Diciembre para no romper el ciclo anual.
                if mes_iterador > 12 and retiro_restante > 0:
                    _insertar_movimiento_directo(cursor, insumo_id, 12, -retiro_restante)
                    retiro_restante = 0

        # 4. GUARDADO PERMANENTE (COMMIT)
        # Si todo el proceso anterior funcionó sin tirar errores, ordenamos a Postgres
        # que guarde los datos definitivamente. 
        print("Guardando todos los cambios de forma permanente...")
        conn.commit()
        print("✅ ¡Importación masiva completada con éxito!")

    except Exception as e:
        # SEGURIDAD TRANSACCIONAL (ROLLBACK)
        # Si el código se rompe (ej. se cortó el internet o hubo un error de sintaxis SQL),
        # Postgres cancela TODO el proceso instantáneamente. Así no quedan "datos a medias".
        print(f"❌ Error durante el procesamiento. Cancelando cambios (Rollback). Error: {e}")
        conn.rollback()
    finally:
        # Siempre cerramos el cursor para liberar memoria RAM
        cursor.close()

def _insertar_movimiento_directo(cursor, insumo_id, mes, balance):
    """
    Función de apoyo que interactúa con las tablas SQL.
    Replica lo que hace Prisma por debajo cuando creas un movimiento.
    """
    
    # Generamos un ID único (UUID) para el movimiento
    mov_id = str(uuid.uuid4())
    
    # Asignamos la fecha. Para que quede limpio, lo ponemos a mediados del mes (día 15)
    # Por ejemplo, si mes es 3, quedará "2026-03-15 12:00:00"
    fecha_iso = f"{ANIO_ACTUAL}-{str(mes).zfill(2)}-15 12:00:00"
    
    # PASO 1: Inyectar el registro individual en la tabla "Movimiento" (El Historial)
    cursor.execute('''
        INSERT INTO "Movimiento" (id, fecha, "balanceRetiros", "idInsumo")
        VALUES (%s, %s, %s, %s)
    ''', (mov_id, fecha_iso, balance, insumo_id))
    
    # PASO 2: Buscar si ya existe la tabla resumen de ese mes ("MovimientosMes")
    cursor.execute('''
        SELECT id FROM "MovimientosMes" 
        WHERE "idInsumo" = %s AND mes = %s AND anio = %s
    ''', (insumo_id, mes, ANIO_ACTUAL))
    
    mov_mes = cursor.fetchone()
    
    if mov_mes:
        # Si el mes ya existía, simplemente le sumamos (restamos) el nuevo balance
        cursor.execute('''
            UPDATE "MovimientosMes" 
            SET "stockModificable" = "stockModificable" + %s 
            WHERE id = %s
        ''', (balance, mov_mes['id']))
    else:
        # Si el mes no existía (ej: Enero), lo creamos desde cero.
        # Primero buscamos el stock original para calcular la base del mes.
        cursor.execute('''SELECT "stockOriginal" FROM "Insumo" WHERE id = %s''', (insumo_id,))
        stock_orig = cursor.fetchone()['stockOriginal'] or 0
        stock_base = stock_orig // 12
        
        nuevo_mes_id = str(uuid.uuid4())
        
        # Insertamos el registro maestro del mes.
        cursor.execute('''
            INSERT INTO "MovimientosMes" (id, mes, anio, "stockAjustado", "stockModificable", "idInsumo")
            VALUES (%s, %s, %s, %s, %s, %s)
        ''', (nuevo_mes_id, mes, ANIO_ACTUAL, stock_base, stock_base + balance, insumo_id))

if __name__ == "__main__":
    # PUNTO DE ENTRADA DEL PROGRAMA
    print("=== SCRIPT EXTERNO DE MIGRACIÓN (SQL DIRECTO) ===")
    conn = conectar_db()
    
    # 1. Leer Excel
    retiros = leer_csv()
    
    # 2. Pedir confirmación humana
    confirm = input(f"Se procesarán {len(retiros)} registros leídos del CSV. ¿Proceder? (S/N): ")
    if confirm.strip().upper() == 'S':
        # 3. Lanzar la lógica masiva
        procesar_e_importar(conn, retiros)
    else:
        print("Operación cancelada.")
    
    # 4. Cerrar la conexión limpia
    conn.close()
