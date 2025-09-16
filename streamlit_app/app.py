# streamlit_app/app.py

import streamlit as st
import tensorflow as tf
from PIL import Image
import numpy as np
import os
import base64
import sys

# --- FUNCIONES DE UTILIDAD ---
def load_local_asset(file_path):
    """Carga de forma segura un archivo de texto como CSS."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        print(f"Advertencia: No se encontró el archivo de activo en {file_path}")
        return ""

def get_image_as_base64(file_path):
    """Carga de forma segura una imagen y la convierte a Base64."""
    try:
        with open(file_path, "rb") as f:
            data = f.read()
        return base64.b64encode(data).decode()
    except IOError:
        print(f"Advertencia: No se pudo cargar la imagen del logo en {file_path}")
        return None

# ====================================================================================
#               CARGA DEL MODELO (RECIBE LA RUTA COMO PARÁMETRO)
# ====================================================================================
@st.cache_resource
def cargar_modelo(ruta_modelo_completa):
    if not os.path.exists(ruta_modelo_completa):
        st.error("Error: No se pudo encontrar el archivo del modelo.")
        st.code(f"Buscando en: {ruta_modelo_completa}")
        return None
    try:
        st.info(f"Cargando modelo: {os.path.basename(ruta_modelo_completa)}")
        modelo = tf.keras.models.load_model(ruta_modelo_completa)
    except Exception as e:
        st.error(f"Error al cargar el modelo: {e}")
        modelo = None
    return modelo

# ====================================================================================
#                             LÓGICA DE PREDICCIÓN
# ====================================================================================
def predecir(modelo, imagen_pil, img_size):
    if modelo is None:
        st.warning("Usando modo de demostración. El resultado es aleatorio.")
        prob = np.random.rand()
        return ("Reciclable" if prob > 0.5 else "No Reciclable"), prob

    img = imagen_pil.resize((img_size, img_size))
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)

    prediccion = modelo.predict(img_array)
    probabilidad = prediccion[0][0]

    clase = "Reciclable" if probabilidad > 0.5 else "No Reciclable"
    confianza = probabilidad if probabilidad > 0.5 else 1 - probabilidad
    return clase, confianza

# ====================================================================================
#                           INTERFAZ PRINCIPAL DE LA APP
# ====================================================================================
def main(ruta_modelo, img_size):
    st.set_page_config(page_title="VIREC", page_icon="♻️", layout="centered")

    # Cargar activos locales de forma segura
    css_content = load_local_asset("static/style.css")
    if css_content:
        # CORRECCIÓN: Usar llaves simples {} en la f-string
        st.markdown(f"<style>{css_content}</style>", unsafe_allow_html=True)
    
    logo_base64 = get_image_as_base64("static/logo.png")

    # Cargar el modelo
    modelo_cargado = cargar_modelo(ruta_modelo)

    # --- Sidebar ---
    with st.sidebar:
        if logo_base64:
            # CORRECCIÓN: Usar llaves simples {} en la f-string
            st.markdown(f'<div style="text-align: center;"><img src="data:image/png;base64,{logo_base64}" width="100"></div>', unsafe_allow_html=True)
        st.title("Acerca de VIREC")
        st.info(
            "**VIREC (Visión Inteligente de Reciclaje)** es un prototipo que utiliza "
            "IA para clasificar residuos. Este proyecto fue desarrollado como parte "
            "del bootcamp de IA Nivel exploratorio de TalentoTECH."
        )

    # --- Contenido Principal ---
    st.title("♻️ Clasificador Inteligente de Residuos")
    st.header("Sube una imagen y descubre si es reciclable")

    fuente_imagen = st.radio("Elige una fuente:", ["Subir Archivo", "Usar Cámara"], horizontal=True)
    imagen_subida = st.file_uploader("Arrastra o selecciona una imagen", type=["jpg", "jpeg", "png"]) if fuente_imagen == "Subir Archivo" else st.camera_input("Toma una foto de un residuo")

    if imagen_subida:
        imagen = Image.open(imagen_subida)

        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            st.image(imagen, caption="Imagen cargada", use_container_width=True)

        with st.spinner('Analizando...'):
            clase, confianza = predecir(modelo_cargado, imagen, img_size)

        clase_css = "reciclable" if clase == "Reciclable" else "no-reciclable"
        texto_clase_css = "reciclable-text" if clase == "Reciclable" else "no-reciclable-text"

        # CORRECCIÓN: Usar llaves simples {} en la f-string
        st.markdown(f'''
        <div class="result-card {clase_css}">
            <p class="result-text {texto_clase_css}">{clase}</p>
            <p class="confidence-text">Confianza: {confianza:.2%}</p>
        </div>
        ''', unsafe_allow_html=True)


if __name__ == "__main__":
    # --- MANEJO DE ARGUMENTOS DE LÍNEA DE COMANDOS ---
    try:
        if len(sys.argv) > 2:
            ruta_modelo_arg = sys.argv[1]
            img_size_arg = int(sys.argv[2])
            main(ruta_modelo_arg, img_size_arg)
        else:
            st.error("Error de lanzamiento: Faltan argumentos del modelo.")
            st.code("Este script debe ser lanzado desde el notebook '03_Streamlit_App_Launcher.ipynb'.")
    except (ValueError, IndexError):
        st.error("Error de lanzamiento: Argumentos inválidos.")
        st.code("Uso esperado: streamlit run app.py -- <ruta_al_modelo> <tamaño_imagen>")