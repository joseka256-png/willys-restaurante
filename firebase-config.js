// =========================================================
//  CONFIGURACIÓN DE FIREBASE — Willy's
//  Pegar aquí el bloque firebaseConfig de la consola de Firebase
//  (Configuración del proyecto → Tus apps → App web).
//  Estos datos NO son secretos: la seguridad la dan las reglas
//  de Firestore (archivo firestore.rules).
// =========================================================
export const firebaseConfig = {
  apiKey: "AIzaSyCyqF4Qj73REw3ifx14a2HHI0J5ne4cjEQ",
  authDomain: "willys-tarjeta.firebaseapp.com",
  projectId: "willys-tarjeta",
  storageBucket: "willys-tarjeta.firebasestorage.app",
  messagingSenderId: "313188379080",
  appId: "1:313188379080:web:ace4037a6770efd188f8fd"
};

// =========================================================
//  REGLAS DEL PROGRAMA DE LEALTAD
//  Si se cambian meta o montoMinimo, cambiarlos también en
//  firestore.rules (las reglas son las que mandan).
// =========================================================
// Clave PÚBLICA de reCAPTCHA (Fraud Defense) para App Check contra bots.
export const APP_CHECK_SITE_KEY = "6Lf2OBQuAAAAACO162Y4bsvy5kZTfjPBkLYRK-rs";

export const LEALTAD = {
  meta: 10,                       // sellos para ganar el premio
  montoMinimo: 5000,              // compra mínima (₡) para sumar sello
  modo: "porCompra",              // "porCompra": 1 sello por compra ≥ mínimo
                                  // "porCada": 1 sello por cada ₡montoMinimo (₡10.000 = 2 sellos)
  premio: "Plato del día gratis"
};
