import json
import requests
import os

# CONFIGURACIÓN
# Cambia la URL si tu proyecto está publicado (ej: https://tu-dominio.vercel.app/api/insumos-auto)
URL_API = "http://localhost:3000/api/insumos-auto"

# La misma API Key configurada en tu archivo .env (API_SECRET_KEY)
API_KEY = "miSuperSeguraAPIv0BqjjbKRWMjw2+"

# Nombre del archivo JSON local
NOMBRE_ARCHIVO_JSON = "pruebas.json"

def enviar_datos_json():
    # 1. Verificar si el archivo existe
    if not os.path.exists(NOMBRE_ARCHIVO_JSON):
        print(f"❌ Error: El archivo '{NOMBRE_ARCHIVO_JSON}' no fue encontrado en este directorio.")
        return

    # 2. Leer el archivo JSON
    try:
        with open(NOMBRE_ARCHIVO_JSON, "r", encoding="utf-8") as archivo:
            datos_payload = json.load(archivo)
        print(f"📖 Archivo '{NOMBRE_ARCHIVO_JSON}' cargado exitosamente.")
    except Exception as e:
        print(f"❌ Error al leer el archivo JSON: {e}")
        return

    # 3. Preparar las cabeceras HTTP con la API Key
    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }

    # 4. Enviar la petición POST al servidor Next.js
    print(f"🚀 Enviando datos a {URL_API}...")
    try:
        respuesta = requests.post(URL_API, json=datos_payload, headers=headers)
        
        print(f"STATUS HTTP: {respuesta.status_code}")
        
        if respuesta.status_code == 200:
            print("✅ Exito:", respuesta.json())
        else:
            print("⚠️ Error devuelto por la API:", respuesta.json())

    except Exception as e:
        print(f"❌ Error de conexión al servidor: {e}")

if __name__ == "__main__":
    enviar_datos_json()
