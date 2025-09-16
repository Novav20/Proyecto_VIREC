# VIREC: Visión Inteligente de Reciclaje ♻️

Prototipo de un clasificador de residuos sólidos utilizando visión por computador y aprendizaje por transferencia. Este proyecto fue desarrollado como el proyecto final del bootcamp de IA Nivel Explorador de TalentoTECH.

![Pantallazo de la App de Streamlit](assets/interfaz_streamlit.png)

## 🚀 Stack Tecnológico

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![Streamlit](https://img.shields.io/badge/Streamlit-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)
![Google Colab](https://img.shields.io/badge/Colab-F9AB00?style=for-the-badge&logo=googlecolab&logoColor=white)
![Google Drive](https://img.shields.io/badge/Google_Drive-4285F4?style=for-the-badge&logo=googledrive&logoColor=white)

---

## 📋 Descripción del Proyecto

VIREC es un pipeline de MLOps de extremo a extremo que permite:
- **Gestionar y sanitizar** un dataset de imágenes de forma colaborativa.
- **Entrenar y evaluar** modelos de clasificación de imágenes de forma automatizada.
- **Desplegar** el mejor modelo en una interfaz web interactiva.

## 📂 Estructura del Repositorio

- **/notebooks:** Contiene los Google Colab notebooks para cada etapa del pipeline.
  - `00_Preparacion_y_Auditoria_Datos.ipynb`: Herramientas para limpiar, convertir y auditar los datos crudos.
  - `01_Preprocesamiento_Dataset.ipynb`: Script para organizar y dividir el dataset en conjuntos de entrenamiento, validación y prueba.
  - `02_Entrenamiento_Modelo.ipynb`: Pipeline automatizado para ejecutar experimentos de entrenamiento.
  - `03_Streamlit_App_Launcher.ipynb`: Notebook para lanzar la interfaz web.
- **/streamlit_app:** Contiene el código fuente de la aplicación de Streamlit.
- **/google_workspace:** Incluye el código de Apps Script y las plantillas CSV para configurar las Hojas de Cálculo de Google.
- **/assets:** Imágenes y diagramas utilizados en la documentación.

---

## 🏛️ Arquitectura del Modelo

![Arquitectura del Modelo](assets/model_architecture.svg)

---

## ⚙️ Instalación y Configuración

Sigue estos pasos para poner en marcha el proyecto en tu propio entorno de Google.

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Novav20/Proyecto_VIREC.git
```

### 2. Configurar el Entorno de Google Drive
- Sube la carpeta `Proyecto_VIREC` a tu "Mi unidad" en Google Drive.
- Dentro de `/dataset/`, crea las carpetas `fotos_crudas_propias` y `fotos_crudas_externas` y sube tus imágenes allí.

### 3. Configurar Google Sheets y Apps Script
- Crea una nueva Hoja de Cálculo en Google Sheets llamada **"VIREC - Hoja de Etiquetas del Dataset"** en la raíz de tu proyecto. Asegúrate de que la primera pestaña se llame **"Lista de etiquetas"**.
- Abre el archivo `google_workspace/hoja_etiquetas_template.csv` y copia los encabezados en la primera fila de tu nueva hoja.
- Abre `Extensiones > Apps Script`, borra el código por defecto y pega el contenido completo de `google_workspace/apps_script_code.js`. Guarda el proyecto.
- Crea una segunda Hoja de Cálculo llamada **"VIREC - Hoja de Experimentos"**. Asegúrate de que la primera pestaña se llame **"Experimentos"**.
- Abre `google_workspace/hoja_experimentos_template.csv` y copia sus encabezados en la primera fila.

### 4. Crear tu Archivo de Configuración Local
- En la raíz de tu proyecto, haz una copia del archivo `config.py.template` y renómbralo a `config.py`.
- Abre `config.py` y rellena los valores con tus propios IDs de carpeta de Google Drive y tu token de Ngrok. **Este archivo no se subirá a GitHub.**

---

## 🏃‍♂️ Cómo Ejecutar el Pipeline
1.  **Abre `00_Preparacion_y_Auditoria_Datos.ipynb` en Google Colab.** Ejecuta las celdas para sanitizar tus datos crudos.
2.  **Usa la herramienta en Google Sheets** para sincronizar y listar los nuevos archivos limpios.
3.  **Etiqueta tus datos** en la hoja de cálculo.
4.  **Abre `01_Preprocesamiento_Dataset.ipynb`** y ejecútalo para organizar tu dataset.
5.  **Define tus experimentos** en la "Hoja de Experimentos".
6.  **Abre `02_Entrenamiento_Modelo.ipynb`** y ejecútalo para entrenar tus modelos.
7.  **Abre `03_Streamlit_App_Launcher.ipynb`**, selecciona el modelo que quieres probar y lánzalo.
