# Portal Académico – BTP en Informática

Portal público del Bachillerato Técnico Profesional en Informática del CEMG Álvaro Contreras.

## Ejecutar localmente

Requisitos: Node.js 20 o superior.

```bash
npm install
npm run dev
```

Para generar la versión de producción:

```bash
npm run build
npm run preview
```

## Acceso de edición

La navegación pública no requiere iniciar sesión. El portal cuenta con dos perfiles internos y ambos tienen los mismos permisos de edición:

| Usuario | Contraseña | Perfil |
|---|---|---|
| `admin` | `admin123` | Administrador |
| `editor` | `editor123` | Editor |

**Importante sobre seguridad:** este proyecto es una aplicación frontend estática. Las credenciales están en el código del navegador y no constituyen autenticación segura para información sensible. Antes de usarlo como portal institucional en producción, se debe conectar un backend con autenticación real y autorización del lado del servidor, además de cambiar estas contraseñas.

## Contenido y almacenamiento

- Los docentes, asignaturas, galería y otros datos del portal se guardan en el navegador mediante `localStorage`.
- El respaldo inicial de `public/backups/backup.json` se importa una sola vez en la primera visita de esta versión. Las sesiones no se restauran desde respaldos ni se conservan al cerrar o recargar el sitio.
- Las imágenes agregadas como archivos usan el almacenamiento local del navegador, igual que antes.
- Los videos pueden agregarse mediante enlaces directos MP4/WebM, YouTube o Vimeo, o como archivos. Los archivos de video se guardan en IndexedDB para evitar el límite reducido de `localStorage`.
- Los datos guardados localmente no se sincronizan automáticamente entre navegadores, dispositivos o visitantes. Para que todo el público vea los cambios hechos por el editor, se necesita una API/base de datos y almacenamiento de archivos en un servicio compartido. Los enlaces públicos son la opción recomendada para videos que deban estar disponibles para todos.

## Funciones de edición

- Agregar, editar y eliminar docentes.
- Agregar, editar y eliminar asignaturas.
- Agregar, editar y eliminar elementos de galería (imágenes y videos).
- Exportar e importar respaldos JSON desde el pie de página cuando se inicia sesión.
