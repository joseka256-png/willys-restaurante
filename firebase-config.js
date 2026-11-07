// =========================================================
//  CONFIGURACIÓN DE FIREBASE — Willy's
//  Pegar aquí el bloque firebaseConfig de la consola de Firebase
//  (Configuración del proyecto → Tus apps → App web).
//  Estos datos NO son secretos: la seguridad la dan las reglas
//  de Firestore (archivo firestore.rules).
// =========================================================
export const firebaseConfig = {
  apiKey: "PEGAR_API_KEY",
  authDomain: "PEGAR.firebaseapp.com",
  projectId: "PEGAR_PROJECT_ID",
  storageBucket: "PEGAR.appspot.com",
  messagingSenderId: "PEGAR",
  appId: "PEGAR"
};

// =========================================================
//  REGLAS DEL PROGRAMA DE LEALTAD
//  Si se cambian meta o montoMinimo, cambiarlos también en
//  firestore.rules (las reglas son las que mandan).
// =========================================================
export const LEALTAD = {
  meta: 10,                       // sellos para ganar el premio
  montoMinimo: 5000,              // compra mínima (₡) para sumar sello
  modo: "porCompra",              // "porCompra": 1 sello por compra ≥ mínimo
                                  // "porCada": 1 sello por cada ₡montoMinimo (₡10.000 = 2 sellos)
  premio: "Plato del día gratis"
};
