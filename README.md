# Ruta del Sabor 🌮

Tu bitácora gastronómica en Toluca - Una PWA Neo-Retro con estética Pixel Art.

## 🚀 Quick Start

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.local.example .env.local

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🔧 Configuración

### 1. Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea un nuevo proyecto o usa uno existente
3. Agrega una Web App
4. Copia las credenciales a `.env.local`
5. Habilita Firestore Database

### 2. Google Maps API

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto o usa uno existente
3. Habilita las APIs:
   - Maps JavaScript API
   - Places API
4. Crea una API Key en Credentials
5. Restringe la key a tus dominios
6. Copia la key a `.env.local`

## 📁 Estructura

```
ruta-del-sabor/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── ui/             # UI components (PlaceCard, StarRating, etc.)
│   ├── layout/         # Layout components (Header)
│   ├── avatar/         # Avatar Builder components
│   └── map/            # Google Maps components
├── hooks/              # React hooks
├── lib/                # Utilities (Firebase, Firestore, Google Maps)
└── public/pixels/      # Pixel art assets
```

## 🎨 Design System

- **Fonts**: Space Grotesk (headings), Inter (body)
- **Colors**: Off-white base, pixel accents (gold, salmon, sage)
- **Style**: Neo-Retro with 16-bit pixel art icons

## 📱 Features

- [x] Onboarding con selección de usuario
- [x] Dashboard con próxima parada y bitácora
- [x] Agregar planes (búsqueda + fecha)
- [x] Calificar visitas con estrellas
- [x] Confeti pixelado 🎉
- [ ] Integración Google Maps
- [ ] Avatar Builder completo
- [ ] Push Notifications

## 🚀 Deploy

```bash
npm run build
```

Deploy en Netlify conectando tu repositorio.

---

Hecho con ❤️ para Ara y Jeremy
