# Willy's — sitio web y Tarjeta Cliente Frecuente

Sitio: https://joseka256-png.github.io/willys-restaurante/
Panel del personal: https://joseka256-png.github.io/willys-restaurante/personal.html

## Archivos

| Archivo | Qué es |
| --- | --- |
| `index.html` | Sitio público: menú, pedidos por WhatsApp, tarjeta del cliente |
| `tarjeta.js` | Tarjeta del cliente conectada a Firestore (se actualiza en vivo) |
| `personal.html` | Panel del personal: buscar cliente, sumar sellos, canjear premio, reporte y CSV |
| `firebase-config.js` | Configuración de Firebase y reglas del programa (meta, monto mínimo, modo) |
| `firestore.rules` | Reglas de seguridad de Firestore (copiar en la consola) |

## Cómo funciona la tarjeta

- El cliente se registra con su teléfono (8 dígitos) y nombre. La tarjeta se guarda en `tarjetas/{telefono}`.
- Al pagar, el cliente dice su teléfono. El personal lo busca en `personal.html`, escribe el monto y toca **Registrar compra**.
- Compra ≥ ₡5.000 → 1 sello (`modo: "porCompra"`). Con `modo: "porCada"` se da 1 sello por cada ₡5.000.
- Con 10 sellos aparece **Canjear premio**; al confirmar, la tarjeta vuelve a 0 y suma 1 a `canjes`.
- Cada movimiento queda en `tarjetas/{telefono}/movimientos` con monto, fecha y quién lo registró.

## Seguridad

- Cualquiera puede crear su tarjeta (siempre en 0) y consultar una tarjeta sabiendo el teléfono exacto.
- Solo usuarios con documento en `staff/{uid}` pueden sumar sellos, canjear, ver historial y listar clientes.
- El historial no se puede editar ni borrar.

## Configurar Firebase (una sola vez)

1. Crear proyecto en Firebase; activar **Firestore** (modo producción) y **Authentication → Correo/contraseña**.
2. Authentication → Configuración → Dominios autorizados → agregar `joseka256-png.github.io`.
3. Pegar el `firebaseConfig` de la app web en `firebase-config.js`.
4. Firestore → Reglas → pegar `firestore.rules` → **Publicar**.
5. Crear el usuario del personal en Authentication y copiar su **UID**.
6. Firestore → Datos → Iniciar colección `staff` → ID del documento = **UID** → campo `nombre` (string), por ejemplo `Caja Willy's`.

Para agregar otro empleado: crear el usuario en Authentication y su documento en `staff` con su UID.
Para quitarle el acceso: borrar su documento en `staff`.

## Cambiar las reglas del programa

Editar `LEALTAD` en `firebase-config.js`. Si se cambia la meta de sellos, cambiar también `META()` en `firestore.rules` y volver a publicarlas.
