import psycopg2

# REEMPLAZA ESTO CON LA URL DE CONEXIÓN DE TU .env (DATABASE_URL)
DB_URL = "AQUI_TU_CONNECTION_STRING_DE_NEON"

def limpiar_tablas():
    print("Conectando a la base de datos...")
    try:
        conn = psycopg2.connect(DB_URL)
        cursor = conn.cursor()
        
        print("⚠️ ATENCIÓN: Se van a eliminar TODOS los registros de Movimientos y MovimientosMes.")
        confirm = input("¿Estás 100% seguro de vaciar el historial de stock? (Escribe 'SI' para confirmar): ")
        
        if confirm == 'SI':
            # Eliminamos en orden para respetar las llaves foráneas (si las hubiera)
            cursor.execute('DELETE FROM "Movimiento";')
            cursor.execute('DELETE FROM "MovimientosMes";')
            
            conn.commit()
            print("✅ Tablas limpiadas con éxito. El stock de los insumos ha vuelto a su estado original.")
        else:
            print("Operación cancelada.")
            
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error crítico: {e}")

if __name__ == "__main__":
    limpiar_tablas()
