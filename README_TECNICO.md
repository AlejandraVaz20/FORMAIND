# README Técnico - FORMAIND

FORMAIND es una plataforma de gestión industrial diseñada para la digitalización de flujos de trabajo, inspecciones de calidad y trazabilidad.

## Arquitectura General

La aplicación sigue un enfoque de **Single Page Application (SPA)** construida con:

- **Frontend:** React 19 con TypeScript, utilizando Vite como empaquetador.
- **Estilos:** Tailwind CSS para el diseño responsivo y componentes de UI.
- **Persistencia (Offline-first):** IndexedDB para almacenamiento local de inspecciones y borradores mientras se trabaja sin conexión.
- **Sincronización:** Hook `useOfflineSync` que gestiona la conexión a internet y sincroniza registros pendientes automáticamente con el backend al recuperar la conectividad.
- **Integraciones:**
  - `Web Speech API` para dictado de voz industrial.
  - API de Gemini (vía `@google/genai`) para capacidades de IA.

## Configuración y Ejecución

### Requisitos previos

- Node.js v18+
- npm v9+

### Variables de Entorno (`.env`)

Copia `.env.example` a `.env` y configura las siguientes variables:

```bash
GEMINI_API_KEY="tu_api_key_aqui"
APP_URL="la_url_de_tu_aplicacion"
```

### Ejecución en Desarrollo

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Ejecutar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`.

## Scripts disponibles

| Script | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo en el puerto 3000 con soporte de HMR. |
| `npm run build` | Compila la aplicación para producción en la carpeta `dist`. |
| `npm run preview` | Previsualiza la build de producción. |
| `npm run lint` | Ejecuta comprobaciones de tipos de TypeScript sin emitir archivos. |
| `npm run clean` | Limpia los artefactos de compilación (`dist`, `server.js`). |
