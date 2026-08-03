import os
import sys
import json
import requests
import webbrowser

# La funcion carga el archivo de configuracion json local o genera una plantilla por defecto si no existe
def cargar_configuracion():
    archivo_config = "config.json"
    
    # El sistema comprueba si el archivo de configuracion existe en el disco
    if not os.path.exists(archivo_config):
        # El programa define la estructura base con las credenciales y URLs de conexion
        plantilla = {
            "url_login": "http://10.7.71.32:8888/abastecimiento/api/auth/authenticate",
            "url_datos": "http://10.7.71.32:8888/abastecimiento/api/pack/packSearchTipo",
            "metodo_busqueda": "POST",
            "usuario": "11636793-9",
            "password": "hec.2026",
            "parametros_busqueda": {
                "vigencia": 4, 
                "codigo": None, 
                "descripcion": None, 
                "solicitante": 180, 
                "tipoArticulo": 2, 
                "estadoPack": 1
            },
            "api_destino_url": "http://www.neohec.top/api/insumos-auto",
            "api_key": "miSuperSeguraAPIv0BqjjbKRWMjw2+"
        }
        # El script escribe la plantilla en el archivo config.json
        with open(archivo_config, "w", encoding="utf-8") as f:
            json.dump(plantilla, f, indent=4, ensure_ascii=False)
        print(f"[Configuracion] Se ha creado el archivo '{archivo_config}'.")
        print("Por favor, abre el archivo, coloca tus credenciales reales y vuelve a ejecutar el programa.")
        finalizar_programa(pausar=True)
        
    # El script lee y retorna los datos del archivo de configuracion
    with open(archivo_config, "r", encoding="utf-8") as f:
        return json.load(f)

# La funcion realiza la autenticacion contra el ERP y recupera el token de acceso JWT
def obtener_token_automatico(url, usuario, password):
    print("[1/3] Conectando al servicio de login del ERP...")
    cuerpo_login = {"username": usuario, "password": password}
    
    try:
        # El sistema envia una peticion POST con las credenciales al servicio de login del ERP
        respuesta = requests.post(url, json=cuerpo_login, timeout=10)
        if respuesta.status_code == 200:
            datos_login = respuesta.json()
            # El script extrae el token JWT de la respuesta del servidor
            token_jwt = datos_login.get("jwt") or datos_login.get("token")
            if token_jwt:
                return token_jwt
        print(f"[Error] Fallo el login en ERP. Codigo: {respuesta.status_code}")
        return None
    except requests.exceptions.ConnectionError:
        print("[Error de red] No se pudo conectar con el ERP local.")
        return None

# La funcion envia el arreglo de datos procesados hacia la API web y base de datos Neon
def enviar_datos_a_la_nube(datos_payload, url_api, api_key):
    print(f"[3/3] Enviando datos a la nube ({url_api})...")
    # El sistema configura las cabeceras HTTP incluyendo la API Key de seguridad
    cabeceras_api = {
        "Content-Type": "application/json",
        "x-api-key": api_key
    }
    try:
        # El script ejecuta la peticion POST hacia el servidor web
        respuesta = requests.post(url_api, json=datos_payload, headers=cabeceras_api, timeout=15)
        if respuesta.status_code == 200:
            print("✅ ¡Exito! Datos actualizados en la base de datos.")
            return True
        else:
            print(f"⚠️ Error devuelto por la API: {respuesta.status_code} - {respuesta.text}")
            return False
    except Exception as e:
        print(f"❌ Error de conexion al servidor web: {e}")
        return False

# La funcion orquesta todo el flujo principal de sincronizacion
def ejecutar_sincronizacion():
    print("========================================")
    print("   SINCRONIZADOR DE INSUMOS - NEOHEC")
    print("========================================")
    
    # El script carga la configuracion inicial
    config = cargar_configuracion()
    
    # 1. El sistema solicita el token de autenticacion al ERP
    token = obtener_token_automatico(config["url_login"], config["usuario"], config["password"])
    if not token:
        finalizar_programa(pausar=True)
        
    # 2. El script consulta y descarga la lista de insumos desde el ERP
    print("[2/3] Descargando datos de insumos...")
    cabeceras_erp = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }
    
    try:
        # El sistema realiza la busqueda de datos mediante una peticion POST al ERP
        respuesta_datos = requests.post(config["url_datos"], headers=cabeceras_erp, json=config.get("parametros_busqueda", {}), timeout=15)
        
        if respuesta_datos.status_code == 200:
            datos_json = respuesta_datos.json()
            print(f"      -> Se descargaron {len(datos_json)} registros.")
            
            # El programa guarda un respaldo local en formato JSON
            with open("respaldo_datos.json", "w", encoding="utf-8") as f:
                json.dump(datos_json, f, indent=4, ensure_ascii=False)
                
            # 3. El script envia la informacion hacia la plataforma web
            exito = enviar_datos_a_la_nube(datos_json, config["api_destino_url"], config["api_key"])
            
            if exito:
                print("\nAbriendo el navegador de Neonatologia...")
                # El sistema abre el navegador web apuntando a la seccion de insumos del dashboard
                webbrowser.open("http://www.neohec.top")
                finalizar_programa(pausar=False) # El programa finaliza sin pausar al tener exito
            else:
                finalizar_programa(pausar=True)
                
        else:
            print(f"\n[Error] No se pudieron extraer los datos. Codigo: {respuesta_datos.status_code}")
            finalizar_programa(pausar=True)
            
    except Exception as e:
        print(f"\n[Error inesperado] {e}")
        finalizar_programa(pausar=True)

# La funcion detiene o cierra la ejecucion de la consola del sistema
def finalizar_programa(pausar=True):
    if pausar:
        print("\n========================================")
        input("Presiona Enter para cerrar esta ventana...")
    sys.exit()

if __name__ == "__main__":
    # El script inicia el proceso de sincronizacion al ejecutarse directamente
    ejecutar_sincronizacion()