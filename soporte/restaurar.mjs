// =========================================================
//  RESTAURAR RESPALDO — Tarjeta Willy's (solo soporte ISCR Tech)
//
//  Uso:
//    node restaurar.mjs <respaldo.json> [--modo=faltantes|todo] [--tel=88888888] [--aplicar]
//
//  Por defecto es una SIMULACIÓN: muestra qué haría y no cambia nada.
//  Agregá --aplicar para escribir en Firebase.
//
//  Modos:
//    faltantes (por defecto) → solo crea tarjetas que ya no existen. No toca las actuales.
//    todo                    → sobrescribe las tarjetas con lo que dice el respaldo.
//  --tel=88888888            → restaura una sola tarjeta.
//
//  Requiere la clave de cuenta de servicio de Firebase guardada como
//  clave-servicio.json en esta carpeta (NUNCA subirla a GitHub).
// =========================================================
import { readFileSync, existsSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const args = process.argv.slice(2);
const archivo = args.find(a => !a.startsWith("--"));
const opt = k => (args.find(a => a.startsWith(`--${k}=`)) || "").split("=")[1];
const APLICAR = args.includes("--aplicar");
const MODO = opt("modo") || "faltantes";
const SOLO_TEL = opt("tel");

if (!archivo || !existsSync(archivo)) {
  console.log("Uso: node restaurar.mjs <respaldo.json> [--modo=faltantes|todo] [--tel=88888888] [--aplicar]");
  process.exit(1);
}
if (!["faltantes", "todo"].includes(MODO)) { console.log("Modo inválido. Usá faltantes o todo."); process.exit(1); }

const respaldo = JSON.parse(readFileSync(archivo, "utf8"));
if (!Array.isArray(respaldo.tarjetas)) { console.log("El archivo no parece un respaldo de Willy's."); process.exit(1); }

const CAMPOS_FECHA = ["creada", "actualizada", "aceptoFecha", "fecha"];
const aFirestore = obj => Object.fromEntries(Object.entries(obj)
  .filter(([k]) => k !== "id" && k !== "movimientos")
  .map(([k, v]) => [k, CAMPOS_FECHA.includes(k) && typeof v === "string" ? Timestamp.fromDate(new Date(v)) : v]));

const tarjetas = respaldo.tarjetas.filter(t => !SOLO_TEL || t.id === SOLO_TEL);
console.log(`Respaldo: ${respaldo.negocio} · proyecto ${respaldo.proyecto} · generado ${respaldo.generado} por ${respaldo.generadoPor}`);
console.log(`Tarjetas en el archivo: ${respaldo.tarjetas.length}${SOLO_TEL ? ` · filtrando ${SOLO_TEL}: ${tarjetas.length}` : ""}`);
console.log(`Modo: ${MODO} · ${APLICAR ? "APLICANDO CAMBIOS" : "SIMULACIÓN (no cambia nada)"}\n`);

if (!existsSync("./clave-servicio.json")) {
  console.log("Falta clave-servicio.json en esta carpeta (Firebase → Configuración → Cuentas de servicio → Generar nueva clave privada).");
  process.exit(1);
}
const clave = JSON.parse(readFileSync("./clave-servicio.json", "utf8"));
if (respaldo.proyecto && clave.project_id !== respaldo.proyecto) {
  console.log(`¡Ojo! El respaldo es del proyecto "${respaldo.proyecto}" y la clave es de "${clave.project_id}". Cancelado.`);
  process.exit(1);
}
initializeApp({ credential: cert(clave) });
const db = getFirestore();

let crear = 0, sobrescribir = 0, omitir = 0, movs = 0;
for (const t of tarjetas) {
  const ref = db.collection("tarjetas").doc(t.id);
  const actual = await ref.get();
  if (actual.exists && MODO === "faltantes") {
    omitir++; console.log(`  = ${t.id} ${t.nombre}: ya existe (${actual.data().sellos} sellos), se deja igual`); continue;
  }
  const accion = actual.exists ? "sobrescribir" : "crear";
  accion === "crear" ? crear++ : sobrescribir++;
  console.log(`  ${accion === "crear" ? "+" : "~"} ${t.id} ${t.nombre}: ${accion} con ${t.sellos} sellos, ${t.canjes || 0} canjes, ${t.movimientos.length} movimientos`
    + (actual.exists ? ` (hoy tiene ${actual.data().sellos} sellos)` : ""));
  movs += t.movimientos.length;
  if (!APLICAR) continue;
  const batch = db.batch();
  batch.set(ref, aFirestore(t));
  for (const m of t.movimientos) batch.set(ref.collection("movimientos").doc(m.id), aFirestore(m));
  await batch.commit();
}

console.log(`\nResumen: ${crear} a crear · ${sobrescribir} a sobrescribir · ${omitir} sin cambios · ${movs} movimientos`);
console.log(APLICAR ? "✔ Restauración aplicada." : "Simulación terminada. Si todo se ve bien, repetí el comando con --aplicar.");
process.exit(0);
