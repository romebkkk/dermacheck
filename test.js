/**
 * DermaCheck v2.0.0 — Test suite unitario clínico
 * Comando: node test.js
 */
'use strict';
var assert = require('assert');
var DermaCheck = require('./dermacheck.js');

var passed = 0;
function test(nombre, fn) {
  try {
    fn();
    passed++;
    console.log('  [OK] ' + nombre);
  } catch (e) {
    console.error('  [FAIL] ' + nombre + '\n         ' + e.message);
    process.exitCode = 1;
  }
}

console.log('=== 1. Calibrador Milimétrico en Pantalla (ISO ID-1) ===');

test('Calibración física con tarjeta de 340 px determina ~3.97 px/mm y ~24 px para 6 mm', function () {
  var r = DermaCheck.calcularPixelesPorMilimetro(340);
  assert.strictEqual(r.pxPorMm, 3.97);
  assert.strictEqual(r.regla6mmPx, 24);
  assert.ok(/6 mm equivalen a 24 px/i.test(r.descripcion));
});

console.log('\n=== 2. Regla ABCDE (Academia Española de Dermatología) ===');

test('Lunar típico simétrico con bordes regulares y color homogéneo da riesgo bajo', function () {
  var r = DermaCheck.evaluarABCDE({
    asimetria: false,
    bordesIrregulares: false,
    colorHeterogeneo: false,
    diametroMayor6mm: false,
    evolucionReciente: false
  });
  assert.strictEqual(r.totalPositivos, 0);
  assert.strictEqual(r.nivelRiesgo, 'Bajo');
});

test('Lesión con Asimetría, Bordes irregulares y Color heterogéneo se clasifica en Alto Riesgo', function () {
  var r = DermaCheck.evaluarABCDE({
    asimetria: true,
    bordesIrregulares: true,
    colorHeterogeneo: true,
    diametroMayor6mm: false,
    evolucionReciente: false
  });
  assert.strictEqual(r.totalPositivos, 3);
  assert.strictEqual(r.nivelRiesgo, 'Alto / Muy sospechoso');
  assert.strictEqual(r.color, '#ef4444');
});

console.log('\n=== 3. Algoritmo de 7 Puntos de Glasgow (NICE Guidelines) ===');

test('Lesión benigna sin cambios ni irregularidades puntúa 0 y no requiere derivación', function () {
  var r = DermaCheck.evaluarGlasgow7Puntos({});
  assert.strictEqual(r.puntosTotales, 0);
  assert.strictEqual(r.derivacionUrgenteRecomendada, false);
});

test('Criterio mayor (Cambio tamaño +2) + Criterio menor (Picor +1) suma 3 y activa Derivación Urgente NICE', function () {
  var r = DermaCheck.evaluarGlasgow7Puntos({
    cambioTamanio: true, // +2
    cambioSensibilidad: true // +1
  });
  assert.strictEqual(r.puntosTotales, 3);
  assert.strictEqual(r.derivacionUrgenteRecomendada, true);
  assert.ok(/Derivación preferente a Dermatología/i.test(r.recomendacion));
});

test('Dos criterios mayores (Forma irregular + Color irregular) suman 4 puntos', function () {
  var r = DermaCheck.evaluarGlasgow7Puntos({
    formaIrregular: true, // +2
    colorIrregular: true // +2
  });
  assert.strictEqual(r.puntosTotales, 4);
  assert.strictEqual(r.derivacionUrgenteRecomendada, true);
});

console.log('\n=== 4. Signo del Patito Feo y Evaluación Combinada ===');

test('Signo del Patito Feo activa alerta de sospecha x6', function () {
  var r = DermaCheck.evaluarPatitoFeo(true, false);
  assert.strictEqual(r.esPatitoFeo, true);
  assert.ok(/multiplica por 6/i.test(r.multiplicadorRiesgo));
});

test('Evaluación combinada con Glasgow ≥ 3 activa urgencia preferente', function () {
  var r = DermaCheck.evaluarLesionCutanea({
    cambioTamanio: true,
    formaIrregular: true,
    asimetria: true,
    esPatitoFeo: true
  });
  assert.strictEqual(r.requiereConsultaMedica, true);
  assert.strictEqual(r.urgencia, 'preferente');
});

console.log('\n' + passed + ' tests de cribado dermatológico superados con éxito.');
