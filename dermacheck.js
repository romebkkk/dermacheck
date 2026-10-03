/*!
 * DermaCheck v2.0.0 — Cribado Precoz de Melanoma y Lesiones Cutáneas Sospechosas
 * Regla ABCDE (AAD/AEDV), Algoritmo de 7 Puntos de Glasgow (NICE) y Signo del Patito Feo
 *
 * Copyright (c) 2026 DataFlow Elegance — Ismael Ben Kazem
 * Licencia MIT · 100% en el navegador · Privacidad médica radical
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DermaCheck = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var VERSION = '2.0.0';

  // Ancho oficial estándar de tarjeta ID-1 (DNI español, permiso conducir o tarjeta de crédito) en mm
  var ANCHO_TARJETA_ESTANDAR_MM = 85.60;

  /**
   * 1. Calibrador de Pantalla Físico (ISO/IEC 7810 ID-1)
   * Devuelve los píxeles por milímetro de la pantalla actual.
   */
  function calcularPixelesPorMilimetro(anchoTarjetaPx) {
    var px = parseFloat(anchoTarjetaPx);
    if (!px || px <= 0 || isNaN(px)) {
      return { error: 'Introduce un ancho en píxeles válido.' };
    }
    var pxPorMm = px / ANCHO_TARJETA_ESTANDAR_MM;
    var regla6mmPx = Math.round(pxPorMm * 6.0);

    return {
      pxPorMm: Math.round(pxPorMm * 100) / 100,
      regla6mmPx: regla6mmPx,
      descripcion: 'Calibración física exacta: 6 mm equivalen a ' + regla6mmPx + ' px en esta pantalla.'
    };
  }

  /**
   * 2. Regla ABCDE (Academia Española de Dermatología AEDV / AAD)
   * A: Asimetría (las dos mitades no coinciden)
   * B: Bordes irregulares o festoneados
   * C: Color no homogéneo (marrón claro, oscuro, negro, rojizo, azulado)
   * D: Diámetro mayor a 6 mm
   * E: Evolución (ha crecido, picado, sangrado o cambiado en los últimos meses)
   */
  function evaluarABCDE(params) {
    params = params || {};
    var criteriosPositivos = [];
    var totalPositivos = 0;

    if (params.asimetria) {
      totalPositivos++;
      criteriosPositivos.push('A: Asimetría evidente (una mitad no es simétrica a la otra).');
    }
    if (params.bordesIrregulares) {
      totalPositivos++;
      criteriosPositivos.push('B: Bordes irregulares, festoneados o borrosos.');
    }
    if (params.colorHeterogeneo) {
      totalPositivos++;
      criteriosPositivos.push('C: Color no homogéneo (2 o más tonalidades distintas).');
    }
    if (params.diametroMayor6mm) {
      totalPositivos++;
      criteriosPositivos.push('D: Diámetro mayor a 6 mm (superior a la goma de un lápiz).');
    }
    if (params.evolucionReciente) {
      totalPositivos++;
      criteriosPositivos.push('E: Evolución o cambio activo en tamaño, forma, color o grosor.');
    }

    var nivelRiesgo = 'Bajo';
    var color = '#10b981'; // Verde
    var accion = 'Lunar con apariencia benigna típica. Realiza autoexploración periódica cada 3 meses.';

    if (totalPositivos === 1 || totalPositivos === 2) {
      nivelRiesgo = 'Moderado';
      color = '#f59e0b'; // Amarillo
      accion = 'Presenta signos que requieren valoración por tu médico de cabecera o dermatólogo para dermatoscopia reglada.';
    } else if (totalPositivos >= 3) {
      nivelRiesgo = 'Alto / Muy sospechoso';
      color = '#ef4444'; // Rojo
      accion = 'Cumple múltiples criterios ABCDE de sospecha de melanoma. Solicita cita preferente con Dermatología.';
    }

    return {
      criterio: 'Regla ABCDE (AEDV / AAD)',
      totalPositivos: totalPositivos,
      criteriosPositivos: criteriosPositivos,
      nivelRiesgo: nivelRiesgo,
      color: color,
      accion: accion
    };
  }

  /**
   * 3. Algoritmo de 7 Puntos de Glasgow (NICE Guidelines UK)
   * Criterios Mayores (2 puntos c/u):
   *  - cambioTamanio (cambio en tamaño o nueva lesión en adulto)
   *  - formaIrregular (forma geométrica irregular)
   *  - colorIrregular (múltiples tonos de pigmento)
   * Criterios Menores (1 punto c/u):
   *  - diametroMayor7mm (diámetro ≥ 7 mm)
   *  - inflamacion (halo eritematoso o enrojecimiento perilesional)
   *  - costraSangrado (sangrado espontáneo o formación de costra)
   *  - cambioSensibilidad (picor, prurito, dolor o escozor)
   * Criterio NICE: ≥ 3 puntos -> Derivación urgente a dermatología.
   */
  function evaluarGlasgow7Puntos(params) {
    params = params || {};
    var puntos = 0;
    var hallazgos = [];

    // Criterios Mayores (2 puntos)
    if (params.cambioTamanio) {
      puntos += 2;
      hallazgos.push('Mayor: Cambio reciente de tamaño o lesión de nueva aparición (+2 pts)');
    }
    if (params.formaIrregular) {
      puntos += 2;
      hallazgos.push('Mayor: Forma o contorno irregular (+2 pts)');
    }
    if (params.colorIrregular) {
      puntos += 2;
      hallazgos.push('Mayor: Variación o heterogeneidad de color (+2 pts)');
    }

    // Criterios Menores (1 punto)
    if (params.diametroMayor7mm) {
      puntos += 1;
      hallazgos.push('Menor: Diámetro ≥ 7 mm (+1 pt)');
    }
    if (params.inflamacion) {
      puntos += 1;
      hallazgos.push('Menor: Inflamación o eritema perilesional (+1 pt)');
    }
    if (params.costraSangrado) {
      puntos += 1;
      hallazgos.push('Menor: Sangrado o costra espontánea (+1 pt)');
    }
    if (params.cambioSensibilidad) {
      puntos += 1;
      hallazgos.push('Menor: Picor, escozor o cambio de sensibilidad (+1 pt)');
    }

    var derivacionUrgente = puntos >= 3;

    return {
      protocolo: 'Glasgow 7-Point Checklist (NICE Guidelines)',
      puntosTotales: puntos,
      hallazgos: hallazgos,
      derivacionUrgenteRecomendada: derivacionUrgente,
      recomendacion: derivacionUrgente
        ? '🚨 Puntuación ≥ 3 puntos en Glasgow: Cumple criterios formales para derivación preferente a Dermatología para descartar melanoma maligno.'
        : 'Puntuación < 3 puntos: Bajo índice de sospecha inmediata. Mantener vigilancia de cambios.'
    };
  }

  /**
   * 4. Signo del "Patito Feo" (Ugly Duckling Sign)
   * Evalúa si una lesión es completamente diferente al resto del patrón de lunares del individuo.
   */
  function evaluarPatitoFeo(esCompletamenteDiferente, antecedenteMelanoma) {
    var esDiferente = !!esCompletamenteDiferente;
    var tieneAntecedentes = !!antecedenteMelanoma;

    var riesgoElevado = esDiferente || tieneAntecedentes;

    return {
      esPatitoFeo: esDiferente,
      multiplicadorRiesgo: esDiferente ? 'El signo del patito feo multiplica por 6 la probabilidad de melanoma frente a un nevo típico.' : 'Patrón similar al resto de nevus.',
      consejo: riesgoElevado
        ? '⚠️ Cuando un lunar es visiblemente más oscuro, más grande o completamente distinto al resto, o hay antecedentes familiares de melanoma, debe ser revisado con dermatoscopio.'
        : 'Sigue la regla de vigilar cualquier lesión que empiece a desmarcarse de tus lunares habituales.'
    };
  }

  /**
   * 5. Evaluación Combinada Global
   */
  function evaluarLesionCutanea(datos) {
    datos = datos || {};
    var rABCDE = evaluarABCDE(datos);
    var rGlasgow = evaluarGlasgow7Puntos(datos);
    var rPatito = evaluarPatitoFeo(datos.esPatitoFeo, datos.antecedenteMelanoma);

    var requiereConsulta = rABCDE.totalPositivos >= 2 || rGlasgow.derivacionUrgenteRecomendada || rPatito.esPatitoFeo;

    return {
      version: VERSION,
      requiereConsultaMedica: requiereConsulta,
      urgencia: rGlasgow.derivacionUrgenteRecomendada ? 'preferente' : (requiereConsulta ? 'ordinaria' : 'rutinaria'),
      abcde: rABCDE,
      glasgow: rGlasgow,
      patitoFeo: rPatito
    };
  }

  return {
    VERSION: VERSION,
    ANCHO_TARJETA_ESTANDAR_MM: ANCHO_TARJETA_ESTANDAR_MM,
    calcularPixelesPorMilimetro: calcularPixelesPorMilimetro,
    evaluarABCDE: evaluarABCDE,
    evaluarGlasgow7Puntos: evaluarGlasgow7Puntos,
    evaluarPatitoFeo: evaluarPatitoFeo,
    evaluarLesionCutanea: evaluarLesionCutanea
  };
});
