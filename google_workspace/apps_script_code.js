// =================================================================
//        CÓDIGO COMPLETO PARA GOOGLE APPS SCRIPT - PROYECTO VIREC
//
// INSTRUCCIONES DE INSTALACIÓN:
// 1. Abre tu Hoja de Cálculo de Google ("Lista de etiquetas").
// 2. Ve al menú "Extensiones" > "Apps Script".
// 3. Borra todo el código que aparezca por defecto en el editor.
// 4. Copia y pega ESTE CÓDIGO COMPLETO en el editor.
// 5. RELLENA TUS IDs de carpeta en la sección de "CONFIGURACIÓN DE USUARIO".
// 6. Haz clic en el ícono de "Guardar proyecto".
// 7. Recarga la pestaña de tu Hoja de Cálculo. Un nuevo menú "🤖 VIREC Tools" aparecerá.
// =================================================================

// =================================================================
//               1. CONFIGURACIÓN DE USUARIO
//         ¡IMPORTANTE! RELLENA ESTAS VARIABLES CON TUS PROPIOS IDs
// =================================================================

// El nombre exacto de la pestaña en tu Hoja de Cálculo donde están las etiquetas.
const NOMBRE_HOJA = "Lista de etiquetas";

// El ID de tu carpeta de Google Drive para las fotos propias.
// (Lo encuentras en la URL de la carpeta. Ej: .../folders/ESTE_ES_EL_ID)
const ID_CARPETA_PROPIAS = "PEGA_AQUÍ_EL_ID_DE_TU_CARPETA_PROPIAS"; 

// El ID de tu carpeta de Google Drive para las fotos externas.
const ID_CARPETA_EXTERNAS = "PEGA_AQUÍ_EL_ID_DE_TU_CARPETA_EXTERNAS";


// =================================================================
//        2. LÓGICA PRINCIPAL
// =================================================================

/**
 * Función principal que orquesta el escaneo y listado para ambas fuentes.
 * Se ejecuta desde el menú "Sincronizar Nuevos Archivos".
 */
function sincronizarAmbasFuentes() {
  var ui = SpreadsheetApp.getUi();
  ui.alert("Iniciando Sincronización (Modo Portero)", "El proceso escaneará las carpetas en busca de nuevos archivos JPG/PNG válidos.", ui.ButtonSet.OK);

  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOMBRE_HOJA);
  
  var carpetaPropias = DriveApp.getFolderById(ID_CARPETA_PROPIAS);
  var resultadoPropias = procesarCarpetaFuente(carpetaPropias, hoja, "propio");
  
  var carpetaExternas = DriveApp.getFolderById(ID_CARPETA_EXTERNAS);
  var resultadoExternas = procesarCarpetaFuente(carpetaExternas, hoja, "externo");

  // --- INFORME FINAL ---
  var archivosAnadidos = resultadoPropias.anadidos + resultadoExternas.anadidos;
  var problemasDetectados = resultadoPropias.problemas + resultadoExternas.problemas;

  var mensajeFinal = "Sincronización completada.\n\n" +
                     "Nuevos archivos válidos añadidos a la hoja: " + archivosAnadidos + "\n\n" +
                     "Archivos problemáticos encontrados: " + problemasDetectados;
  
  if (problemasDetectados > 0) {
    mensajeFinal += "\n\nACCIÓN REQUERIDA:\n" +
                    "Se detectaron archivos HEIC o posibles duplicados. " + 
                    "Por favor, ejecuta el notebook '00_Preparacion_y_Auditoria_Datos.ipynb' en Google Colab para convertirlos y limpiarlos.";
  }
  
  ui.alert(mensajeFinal);
}

/**
 * Procesa una carpeta de origen, llamando a la función de listado.
 */
function procesarCarpetaFuente(carpeta, hoja, fuente) {
  Logger.log("Procesando carpeta: " + carpeta.getName() + " como fuente: '" + fuente + "'");
  var resultadoListado = listarArchivosNuevos(carpeta, hoja, fuente);
  
  return {
    anadidos: resultadoListado.anadidos,
    problemas: resultadoListado.problemas
  };
}

/**
 * Escanea una carpeta, añade archivos válidos y cuenta los problemáticos.
 */
function listarArchivosNuevos(carpeta, hoja, fuente) {
  SpreadsheetApp.flush();
  var valoresActualizados = hoja.getDataRange().getValues();
  var nombresEnHoja = new Set(valoresActualizados.map(function(f) { return f[0]; }));

  var archivos = carpeta.getFiles();
  var nuevasFilas = [];
  var archivosConProblemas = 0;
  
  while (archivos.hasNext()) {
    var archivo = archivos.next();
    var nombreOriginal = archivo.getName();
    
    if (nombresEnHoja.has(nombreOriginal)) {
      continue;
    }
    
    var esHeic = nombreOriginal.toLowerCase().endsWith('.heic');
    var esPosibleDuplicado = /\s\(\d+\)\./.test(nombreOriginal);

    if (esHeic || esPosibleDuplicado) {
      archivosConProblemas++;
      Logger.log("Archivo problemático detectado: " + nombreOriginal);
    } else {
      nuevasFilas.push([nombreOriginal, "", "", new Date(), "", fuente]);
    }
  }

  if (nuevasFilas.length > 0) {
    hoja.getRange(hoja.getLastRow() + 1, 1, nuevasFilas.length, 6).setValues(nuevasFilas);
  }
  
  return { anadidos: nuevasFilas.length, problemas: archivosConProblemas };
}


// =================================================================
//        3. FUNCIONES DE UTILIDAD Y MENÚ 
// =================================================================

/**
 * Crea el menú personalizado al abrir la hoja de cálculo.
 */
function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('🤖 VIREC Tools')
      .addItem('Sincronizar Nuevos Archivos', 'sincronizarAmbasFuentes')
      .addSeparator()
      .addItem('Diagnosticar Carpeta...', 'diagnosticarCarpetaDinamico')
      .addToUi();
}

/**
 * Se ejecuta automáticamente cuando se edita la columna de etiquetas.
 */
function onEdit(e) {
  var hoja = e.range.getSheet();
  // Asegurarse de que las columnas existan antes de intentar acceder a ellas.
  if (e.range.getSheet().getLastColumn() >= 5 && hoja.getName() === NOMBRE_HOJA && e.range.getColumn() === 2 && e.range.getRow() > 1) {
    if (e.value) { hoja.getRange(e.range.getRow(), 5).setValue(new Date()); } 
    else { hoja.getRange(e.range.getRow(), 5).clearContent(); }
  }
}

/**
 * Función de diagnóstico dinámica que pregunta al usuario qué carpeta escanear.
 */
function diagnosticarCarpetaDinamico() {
  var ui = SpreadsheetApp.getUi();
  var respuesta = ui.prompt(
    'Diagnosticar Carpeta',
    'Elige qué carpeta quieres diagnosticar:\n1 - Fotos Propias\n2 - Fotos Externas',
    ui.ButtonSet.OK_CANCEL
  );

  if (respuesta.getSelectedButton() !== ui.Button.OK) return;
  
  var eleccion = respuesta.getResponseText();
  var carpetaId;
  
  if (eleccion === '1') {
    carpetaId = ID_CARPETA_PROPIAS;
  } else if (eleccion === '2') {
    carpetaId = ID_CARPETA_EXTERNAS;
  } else {
    ui.alert("Entrada no válida. Por favor, escribe '1' o '2'.");
    return;
  }
  
  generarInformeDeCarpeta(carpetaId);
}

/**
 * Genera y muestra un informe detallado del contenido de una carpeta.
 */
function generarInformeDeCarpeta(carpetaId) {
  try {
    var carpeta = DriveApp.getFolderById(carpetaId);
    var archivos = carpeta.getFiles();
    var log = "--- INFORME DE DIAGNÓSTICO ---\n\n";
    log += "Carpeta: " + carpeta.getName() + " (ID: " + carpetaId + ")\n\n";
    var listaArchivos = [];
    while (archivos.hasNext()) { listaArchivos.push(archivos.next()); }
    
    listaArchivos.sort(function(a, b) { return a.getName().localeCompare(b.getName()); });
    
    log += "Total de archivos encontrados: " + listaArchivos.length + "\n\n";
    
    listaArchivos.forEach(function(archivo, index) {
      log += "[" + (index + 1).toString().padStart(3, '0') + "] " + archivo.getName() + "\n";
    });
    
    if (listaArchivos.length === 0) { 
      log = "La carpeta '" + carpeta.getName() + "' está vacía."; 
    }
    
    SpreadsheetApp.getUi().showModalDialog(
      HtmlService.createHtmlOutput("<pre>" + log + "</pre>").setWidth(600).setHeight(400),
      'Resultado del Diagnóstico'
    );
  } catch (e) {
    SpreadsheetApp.getUi().alert("Error al diagnosticar: " + e.toString());
  }
}