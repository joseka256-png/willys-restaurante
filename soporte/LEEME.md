# Soporte — Restaurar un respaldo de la Tarjeta Willy's

Solo para ISCR Tech. Willy's descarga los respaldos desde el panel; la restauración la hace soporte.

## Una sola vez
1. Instalar Node.js (nodejs.org).
2. En esta carpeta: `npm install`
3. Firebase → ⚙️ Configuración del proyecto → **Cuentas de servicio** → **Generar nueva clave privada**.
   Guardar el archivo aquí como `clave-servicio.json`. **Nunca subirlo a GitHub ni compartirlo** (ya está en .gitignore).

## Restaurar
Siempre primero simular:

    node restaurar.mjs respaldo-willys-2026-11-07.json

Revisar el resumen y luego aplicar:

    node restaurar.mjs respaldo-willys-2026-11-07.json --aplicar

Opciones:
- `--modo=faltantes` (por defecto): solo recrea tarjetas borradas; no toca las que existen.
- `--modo=todo`: deja todas las tarjetas exactamente como en el respaldo (deshace sellos falsos).
- `--tel=88888888`: restaura una sola tarjeta.

El script verifica que el respaldo y la clave sean del mismo proyecto antes de escribir.
