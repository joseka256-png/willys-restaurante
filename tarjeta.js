// =========================================================
//  Tarjeta Willy's — vista del cliente (Firebase Firestore)
//  El cliente se registra o consulta con su teléfono.
//  Los sellos SOLO los agrega el personal desde personal.html.
// =========================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, LEALTAD } from "./firebase-config.js";

const $ = id => document.getElementById(id);
const KEY = "willys_tel";
const fmt = n => "₡" + Number(n).toLocaleString("es-CR");
const soloDigitos = t => (t || "").replace(/\D/g, "").slice(-8);
const telBonito = t => t.slice(0, 4) + "-" + t.slice(4);
const leerTel = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
const guardarTel = t => { try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch (e) {} };

function toast(m) {
  const t = $("toast"); if (!t) return;
  t.textContent = m; t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}
function msg(el, texto, tipo = "err") { el.className = "msg " + tipo; el.textContent = texto; }

// ---------- texto de reglas en la sección ----------
$("reglaMonto").textContent = fmt(LEALTAD.montoMinimo);
$("reglaMeta").textContent = LEALTAD.meta;
$("reglaPremio").textContent = LEALTAD.premio.toLowerCase();

let db = null;
try {
  if (firebaseConfig.apiKey.startsWith("PEGAR")) throw new Error("sin-config");
  db = getFirestore(initializeApp(firebaseConfig));
} catch (e) {
  msg($("cMsg"), "La tarjeta se está configurando. Pronto vas a poder registrarte.", "err");
  $("btnConsultar").disabled = true;
}

// ---------- pintar tarjeta ----------
function pintar(t) {
  const sellos = t ? t.sellos : 0;
  $("cNombre").textContent = t ? t.nombre.split(" ")[0] : "Tu nombre aquí";
  $("cCodigo").textContent = t ? telBonito(t.telefono) : "0000-0000";
  $("cProg").textContent = `${sellos} / ${LEALTAD.meta} sellos`;
  $("sellos").innerHTML = Array.from({ length: LEALTAD.meta }, (_, i) => {
    const ultimo = i === LEALTAD.meta - 1;
    return `<div class="sello ${i < sellos ? "on" : ""} ${ultimo ? "premio" : ""}">${i < sellos ? "✓" : (ultimo ? "★" : i + 1)}</div>`;
  }).join("");
  $("premio").classList.toggle("show", sellos >= LEALTAD.meta);
  $("canjes").textContent = t && t.canjes ? `Premios canjeados: ${t.canjes}` : "";
  $("pasoConsulta").style.display = t ? "none" : "block";
  $("acciones").style.display = t ? "flex" : "none";
}

// ---------- escuchar la tarjeta en vivo ----------
let dejarDeEscuchar = null;
let sellosPrevios = null;
function escuchar(tel) {
  if (dejarDeEscuchar) dejarDeEscuchar();
  sellosPrevios = null;
  dejarDeEscuchar = onSnapshot(doc(db, "tarjetas", tel), snap => {
    if (!snap.exists()) { guardarTel(null); pintar(null); return; }
    const t = snap.data();
    if (sellosPrevios !== null && t.sellos > sellosPrevios) toast(`✓ ¡Sello agregado! Llevás ${t.sellos} de ${LEALTAD.meta}`);
    if (sellosPrevios !== null && t.sellos === 0 && sellosPrevios === LEALTAD.meta) toast("Premio canjeado. ¡Buen provecho!");
    sellosPrevios = t.sellos;
    pintar(t);
  }, () => msg($("cMsg"), "No se pudo cargar la tarjeta. Revisá tu conexión."));
}

// ---------- consultar / registrar ----------
let telPendiente = null;
$("btnConsultar").onclick = async () => {
  const tel = soloDigitos($("cTel").value);
  if (tel.length !== 8) return msg($("cMsg"), "Escribí tu teléfono de 8 dígitos.");
  $("btnConsultar").disabled = true; msg($("cMsg"), "Buscando…", "ok");
  try {
    const snap = await getDoc(doc(db, "tarjetas", tel));
    if (snap.exists()) {
      msg($("cMsg"), "", "ok"); guardarTel(tel); escuchar(tel);
    } else {
      telPendiente = tel;
      msg($("cMsg"), "Todavía no tenés tarjeta con ese número. Escribí tu nombre para crearla.", "ok");
      $("pasoNombre").style.display = "block"; $("cNombreInput").focus();
    }
  } catch (e) { msg($("cMsg"), "No se pudo conectar. Intentá de nuevo."); }
  $("btnConsultar").disabled = false;
};

$("btnCrear").onclick = async () => {
  const nombre = $("cNombreInput").value.trim().replace(/\s+/g, " ");
  if (nombre.length < 3) return msg($("cMsg"), "Escribí tu nombre completo.");
  if (!telPendiente) return;
  $("btnCrear").disabled = true;
  try {
    await setDoc(doc(db, "tarjetas", telPendiente), {
      nombre: nombre.slice(0, 60), telefono: telPendiente, sellos: 0, canjes: 0,
      creada: serverTimestamp(), actualizada: serverTimestamp()
    });
    guardarTel(telPendiente); escuchar(telPendiente);
    $("pasoNombre").style.display = "none"; msg($("cMsg"), "", "ok");
    toast("¡Tarjeta creada! Dale tu número en la caja en cada compra.");
  } catch (e) {
    msg($("cMsg"), "No se pudo crear. Puede que ese número ya tenga tarjeta: consultalo de nuevo.");
  }
  $("btnCrear").disabled = false;
};

$("btnSalir").onclick = () => {
  if (dejarDeEscuchar) dejarDeEscuchar();
  guardarTel(null); $("cTel").value = ""; $("cNombreInput").value = "";
  $("pasoNombre").style.display = "none"; pintar(null);
};

// ---------- inicio ----------
pintar(null);
const guardado = leerTel();
if (db && guardado) escuchar(guardado);
