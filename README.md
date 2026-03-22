# ⚔️ iDev.BDO-GEAR

Web app para tracking de gear, crates y profit en Black Desert Online.

> Inspirado en [Garmoth.com](https://garmoth.com). Diseñado para uso local o self-host.

## 🔗 Demo

**URL:** http://192.168.200.99:3005/

---

## ✨ Features

- **CRUD completo** — Crear, leer, actualizar y eliminar items de gear
- **Búsqueda on-demand** — Busca items en el market de BDO directamente desde el formulario
- **Importación desde Google Sheets** — Importa tu inventario desde una hoja de cálculo
- **Dark theme** — UI oscura con acentos dorados/púrpura al estilo de Black Desert Online
- **Sistema de enhancement** — De PEN a Base, con badges visuales por tier
- **Estadísticas** — AP, DP, Accuracy, Evasion, Crit Rate y valor estimado del inventario

---

## 🛠️ Stack Técnico

| Capa       | Tecnología                        |
|------------|-----------------------------------|
| Frontend   | Next.js 15 (App Router, React 19) |
| Estilos    | Tailwind CSS                      |
| DB         | Prisma ORM + SQLite               |
| Contenedor | Docker + Docker Compose           |
| Registry   | GHCR (ghcr.io/omar60/idev-bdo-gear) |

---

## 🚀 Quick Start (Desarrollo Local)

```bash
# 1. Clonar
git clone https://github.com/Omar60/iDev-BDO.git
cd iDev-BDO

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu GOOGLE_SHEETS_CSV_URL (opcional)

# 4. Inicializar base de datos
npx prisma db push

# 5. Ejecutar
npm run dev
```

Abre [http://localhost:3005](http://localhost:3005)

---

## 🐳 Docker

### Construir imagen localmente

```bash
docker-compose up -d --build
```

### Pull desde GHCR (producción)

```bash
docker pull ghcr.io/omar60/idev-bdo-gear:latest
```

### Ejecutar con Docker

```bash
docker run -d \
  --name bdo-gear \
  -p 3005:3000 \
  --restart unless-stopped \
  -e DATABASE_URL="file:/app/.data/gear.db" \
  -e GOOGLE_SHEETS_CSV_URL="TU_URL_AQUI" \
  ghcr.io/omar60/idev-bdo-gear:latest
```

### Docker Compose (desde GHCR)

Crea un `docker-compose.prod.yml`:

```yaml
services:
  app:
    image: ghcr.io/omar60/idev-bdo-gear:latest
    container_name: idev-bdo-gear
    restart: unless-stopped
    ports:
      - "3005:3000"
    environment:
      - DATABASE_URL=file:/app/.data/gear.db
      - GOOGLE_SHEETS_CSV_URL=TU_URL_AQUI
    volumes:
      - bdo-data:/app/.data

volumes:
  bdo-data:
```

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📦 Deploy con Portainer

### Opción A — Usar Stack (docker-compose)

1. En Portainer, ve a **Stacks** → **Add stack**
2. Selecciona **Web editor**
3. Pega el contenido del `docker-compose.prod.yml` de arriba
4. Ajusta las variables de entorno si es necesario:
   - `GOOGLE_SHEETS_CSV_URL` — URL del CSV exportado de tu hoja de Google Sheets
5. Click **Deploy the stack**

### Opción B — Contenedor directo

1. **Registrar GHCR en Portainer:**
   - Ve a **Registries** → **Add registry**
   - Selecciona **GitHub Container Registry**
   - Inicia sesión con tu cuenta de GitHub (OAuth)
   - Registry URL: `ghcr.io`

2. **Crear el contenedor:**
   - Ve a **Containers** → **Add container**
   - Nombre: `idev-bdo-gear`
   - Image: `ghcr.io/omar60/idev-bdo-gear:latest`
   - Puerto: `3005:3000`
   - Variables de entorno:
     - `DATABASE_URL=file:/app/.data/gear.db`
     - `GOOGLE_SHEETS_CSV_URL=TU_URL_AQUI`
   - Restart policy: `Unless stopped`
   - **Mapping de volumen:** `/app/.data` → volumen local `bdo-data`
   - Click **Deploy the container**

---

## 🎨 Diseño

### Paleta de colores
- **Fondo principal:** `#0f0f14`
- **Fondo cards/paneles:** `#1a1a24`
- **Acento dorado:** `#fbbf24` (AP, valores destacados)
- **Acento púrpura:** `#c084fc` (DP, valores de defensa)
- **Acento verde:** `#4ade80` (PEN items)
- **Texto principal:** `#f0f0f0`
- **Texto secundario:** `#9ca3af`

### Sistema de tiers
| Tier   | Color          |
|--------|----------------|
| **PEN** | Dorado/verde   |
| **TRI** | Azul claro     |
| **DUO** | Azul medio     |
| **PRI** | Gris azulado   |
| **Base** | Gris          |

---

## 📂 Arquitectura

```
app/
├── actions/         # Server Actions (CRUD, sheets)
├── components/      # Componentes React
│   ├── GearFormModal.tsx   # Modal crear/editar + search on-demand
│   ├── GearTable.tsx       # Tabla de items
│   └── EasterEggLogo.tsx
├── globals.css      # Estilos + variables CSS
├── layout.tsx       # Root layout
└── page.tsx         # Página principal
prisma/
└── schema.prisma    # Modelo Gear
lib/
└── sheets.ts        # Connector de Google Sheets
```

### Modelo de datos (Prisma)

```prisma
model Gear {
  id          String   @id @default(cuid())
  name        String
  category    String   // "Weapon" | "Armor" | "Accessory"
  subcategory String?
  tier        String   // "PEN" | "TRI" | "DUO" | "PRI" | "base"
  enhance     Int      @default(0)   // +0 a +25
  ap          Int      @default(0)
  dp          Int      @default(0)
  accuracy    Int      @default(0)
  evasion     Int      @default(0)
  critRate    Int      @default(0)
  priceG      BigInt?  // Precio en silver
  lastUpdated DateTime @default(now())
  source      String?  // "manual" | "sheets"
}
```
