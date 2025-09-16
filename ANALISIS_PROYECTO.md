# Análisis del Proyecto VIREC

Este documento resume las inconsistencias y áreas de mejora identificadas en el proyecto VIREC antes de su subida a GitHub.

## 1. Gestión de Dependencias

### Problema
El proyecto no cuenta con un archivo `requirements.txt` centralizado. Las dependencias se instalan manualmente en cada notebook mediante comandos `!pip install`.

### Inconsistencias
- **Dependencias Ocultas:** Librerías como `scikit-learn`, `matplotlib` y `seaborn` se usan en los notebooks pero no se instalan explícitamente en todos ellos, lo que puede causar errores si se ejecutan en un orden diferente.
- **Mantenimiento Difícil:** Para replicar el entorno, un nuevo usuario tendría que revisar cada notebook para encontrar y instalar las dependencias correctas.

### Recomendación
- Crear un único archivo `requirements.txt` en la raíz del proyecto que contenga todas las dependencias necesarias.
- Reemplazar los comandos `!pip install` en los notebooks por un único `!pip install -r requirements.txt`.

## 2. Flujo de Datos Inconsistente

### Problema
Existe una inconsistencia fundamental en cómo los notebooks acceden a los datos de etiquetado y experimentación.

### Inconsistencias
- **Doble Fuente de Datos:** Los notebooks `00` y `01` dependen de un archivo `VIREC - Hoja de Etiquetas del Dataset.csv` que debe ser exportado manualmente desde Google Sheets. En contraste, el notebook `02` se conecta y lee directamente desde la "Hoja de Experimentos" de Google Sheets.
- **Proceso Frágil:** Depender de una exportación manual es propenso a errores. Un usuario puede olvidar exportar el archivo, o exportarlo con un nombre incorrecto.

### Recomendación
- Unificar el método de acceso a los datos. Idealmente, todos los notebooks que necesiten leer datos de Google Sheets deberían hacerlo directamente usando la API (`gspread`), como ya hace el notebook `02`.
- Eliminar la dependencia del archivo `.csv` exportado manualmente.

## 3. Uso Inconsistente de `config.py`

### Problema
El archivo de configuración `config.py` se utiliza de forma inconsistente a lo largo del proyecto.

### Inconsistencias
- **Variables no Utilizadas:** El notebook `01` importa `ID_CARPETA_PROPIAS` y `ID_CARPETA_EXTERNAS` desde `config.py` pero nunca las utiliza.
- **Falta de Centralización:** El notebook `02` no utiliza `config.py` y en su lugar tiene hardcodeado el nombre de la Hoja de Experimentos.
- **Uso Correcto Aislado:** El notebook `03` es el único que parece usar `config.py` de la manera esperada, al importar el `NGROK_AUTH_TOKEN`.

### Recomendación
- Centralizar **toda** la configuración en `config.py`. Esto incluye:
  - Nombres de las Hojas de Google Sheets.
  - Nombres de las carpetas importantes (si no se descubren dinámicamente).
  - Parámetros por defecto (ej. tamaño de imagen, timezone).
- Actualizar el `config.py.template` para que refleje todas las variables necesarias.
- Modificar todos los notebooks para que lean su configuración desde `config.py`.

## 4. Código Hardcodeado

### Problema
Hay varios valores hardcodeados en los notebooks que deberían ser variables de configuración.

### Inconsistencias
- **Nombres de Clases:** El notebook `01` hardcodea las clases `['reciclable', 'no_reciclable']`. Si se añade una nueva clase, el código fallará.
- **Timezone:** El notebook `02` hardcodea la timezone `America/Bogota`.
- **Tamaño de Imagen:** La aplicación de Streamlit, generada por el notebook `03`, hardcodea el tamaño de la imagen a `(224, 224)`. Esto es problemático si se entrenan modelos con diferentes tamaños de imagen.

### Recomendación
- **Clases:** Las clases deberían obtenerse dinámicamente, por ejemplo, de la hoja de etiquetas de Google Sheets.
- **Timezone y Tamaño de Imagen:** Estos valores deberían estar en `config.py` o, en el caso del tamaño de la imagen, guardarse como un artefacto junto con el modelo entrenado.

## 5. Estructura del Proyecto y Despliegue de Streamlit

### Problema
El método para lanzar la aplicación de Streamlit es muy poco convencional y frágil.

### Inconsistencias
- **Directorio `streamlit_app` Ignorado:** El proyecto tiene una carpeta `streamlit_app` que contiene `static/style.css` y `static/logo.png`, pero el notebook `03` la ignora por completo.
- **Código en un String:** El código de la aplicación `app.py` está incrustado como un string multi-línea dentro del notebook `03`. Esto hace que el mantenimiento sea extremadamente difícil.
- **Workaround con `config.txt`:** El notebook crea un archivo `config.txt` para pasar la ruta del proyecto a la aplicación de Streamlit. Esto es una solución temporal que indica problemas subyacentes en la forma en que se lanza la aplicación.

### Recomendación
- **Utilizar el Directorio `streamlit_app`:** El código de la aplicación debe residir en `streamlit_app/app.py`.
- **Modificar el Notebook `03`:** El notebook `03` no debería escribir el código de la aplicación. En su lugar, su única responsabilidad debería ser:
  1. Permitir al usuario seleccionar un modelo.
  2. Pasar la ruta del modelo seleccionado como un argumento al lanzar el proceso de Streamlit.
  3. Lanzar la aplicación `streamlit run streamlit_app/app.py`.
- **Eliminar la necesidad de `config.txt`** y simplificar el proceso de lanzamiento.
