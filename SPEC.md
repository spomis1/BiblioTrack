# SPEC — BiblioTrack

> Biblioteca digital de descubrimiento y organización de ebooks. El Goodreads moderno, hecho bien.

---

## 1. Objetivo

**Producto:** Plataforma web donde cualquier persona puede descubrir libros, organizar su biblioteca personal, puntuar títulos, explorar autores y recibir recomendaciones personalizadas.

**Usuario objetivo:** Lectores casuales y habituales, perfil similar al usuario de Kindle o Goodreads. Multiidioma (español e inglés en v1). No descarga de ebooks — foco en descubrimiento, organización y comunidad.

**Propuesta de valor única:**
- Interfaz moderna y rápida (Goodreads está desactualizado y es lento)
- Datos enriquecidos desde múltiples APIs gratuitas
- Recomendaciones inteligentes desde el día 1
- Mobile-first y SEO-optimizado para tráfico orgánico

**GitHub:** https://github.com/spomis1 | Repo público: `bibliotrack`

---

## 2. Stack Tecnológico

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| Frontend + Backend | **Next.js 14** (App Router) | Full-stack en un repo, SEO nativo con SSR/SSG, deploy en Vercel gratis |
| Estilos | **Tailwind CSS + shadcn/ui** | Rápido, moderno, componentes accesibles pre-hechos |
| Base de datos | **PostgreSQL via Supabase** | Gratis, managed, incluye Auth y Storage |
| ORM | **Prisma** | Type-safe, migraciones automáticas, DX excelente |
| Autenticación | **Supabase Auth** | OAuth con Google/GitHub, gratis, sin fricción |
| Hosting | **Vercel** | Deploy automático desde GitHub, tier gratis generoso |
| Lenguaje | **TypeScript** | Evita bugs, mejor DX, estándar de la industria |

**Costo total en v1: $0/mes** (todos los servicios en tier gratuito)

---

## 3. APIs y Fuentes de Datos

### Tier 1 — Núcleo (gratuitas, sin límite o límite muy alto)

| API | Datos que provee | Límite | Notas |
|-----|-----------------|--------|-------|
| **[Open Library](https://openlibrary.org/developers/api)** | +20M libros, metadatos completos, portadas, autores, ediciones | 3 req/s (con User-Agent) | La más completa y confiable. Cubiertas por ISBN gratis. |
| **[Google Books API](https://developers.google.com/books)** | Descripciones ricas, previews, ratings de Google, ISBN lookup | 1.000 req/día gratis | Mejor para descripciones en español |
| **[Gutendex / Project Gutenberg](https://github.com/garethbjohnson/gutendex)** | +70.000 libros dominio público, descargables | Sin límite | Clásicos de literatura gratis y legales |
| **[Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/)** | Biografías de autores, resúmenes, fotos | Sin límite | Ideal para perfiles de autores |
| **[Wikidata SPARQL API](https://query.wikidata.org/)** | Datos estructurados: fechas, nacionalidad, premios, relaciones entre autores | Sin límite | Muy potente para enriquecer perfiles de autores |

### Tier 2 — Enriquecimiento (gratuitas con registro)

| API | Datos que provee | Límite | Notas |
|-----|-----------------|--------|-------|
| **[NYT Books API](https://developer.nytimes.com/docs/books-product/1/overview)** | Listas de bestsellers desde 2008, reseñas del NYT | 4.000 req/día | Requiere API key gratuita. Excelente para sección "Tendencias" |
| **[Hardcover GraphQL API](https://hardcover.app/account/api)** | Ratings de usuarios, listas, datos de libros propios | Gratis (límites no publicados) | Alternativa abierta a Goodreads. GraphQL. |
| **[BookBrainz API](https://bookbrainz-dev-docs.readthedocs.io/)** | Relaciones entre autores, series, editoriales, identificadores cruzados | Sin límite | Proyecto de MetaBrainz (mismos creadores que MusicBrainz) |
| **[Internet Archive API](https://archive.org/developers)** | Libros escaneados, portadas de ediciones antiguas, previews | Sin límite | Para ediciones históricas y libros raros |

### Tier 3 — Futuro (si escala y hay presupuesto)

| API | Datos que provee | Costo | Cuándo considerar |
|-----|-----------------|-------|-------------------|
| **[ISBNDB](https://isbndb.com/)** | 111M+ títulos, precios de múltiples tiendas, datos de editorial | $14.99/mes+ | Cuando tengamos monetización funcionando |
| **[Librario](https://github.com/pagina394/librario)** | Agregador de Google Books + ISBNDB + Hardcover | Pre-alpha, gratis por ahora | Monitorear — podría simplificar mucho la integración |

### Estrategia de datos — cómo se integra todo

```
Búsqueda del usuario
        ↓
1. Buscar en nuestra DB (cache local en Supabase)
        ↓ (si no existe)
2. Consultar Open Library → Google Books → Hardcover en paralelo
        ↓
3. Mergear y enriquecer datos (mejor descripción, mejor portada)
        ↓
4. Guardar en Supabase para futuros accesos (cache permanente)
        ↓
5. Enriquecer autor con Wikipedia + Wikidata (async, en background)
```

**Regla de oro:** Los datos de terceros se cachean. Los ratings, listas y reseñas son 100% propios de BiblioTrack.

### Fuentes para secciones especiales

| Sección | Fuente |
|---------|--------|
| "Bestsellers de la semana" | NYT Books API |
| "Clásicos gratis" | Gutendex (Project Gutenberg) |
| "Trending" | Calculado con datos propios (más agregados esta semana) |
| "Recomendados para vos" | Algoritmo propio basado en ratings del usuario |
| Bio del autor | Wikipedia API + Wikidata |
| Premios del autor | Wikidata SPARQL |
| Portadas | Open Library Covers API (por ISBN/OLID) |

---

## 4. Features — V1 (MVP)

### Catálogo y Descubrimiento
- [ ] Búsqueda de libros por título, autor, ISBN
- [ ] Filtros: género, idioma, año, rating mínimo
- [ ] Página de libro con: portada, descripción, autor, géneros, rating promedio, ISBN
- [ ] Página de autor con: bio, foto, bibliografía completa, libros más valorados
- [ ] Exploración por géneros (Fiction, Sci-Fi, Romance, Mystery, Non-Fiction, etc.)
- [ ] Sección "Trending" — libros más agregados esta semana
- [ ] Sección "Mejor valorados" por género

### Sistema de Usuarios
- [ ] Registro/Login con email o Google OAuth
- [ ] Perfil público con avatar, bio corta, ciudad (opcional)
- [ ] Estadísticas del perfil: libros leídos, géneros favoritos, rating promedio dado

### Biblioteca Personal
- [ ] Listas predefinidas: **Quiero leer / Leyendo / Leído**
- [ ] Listas personalizadas (nombre libre, ej: "Para el verano")
- [ ] Agregar/quitar libro de cualquier lista con 1 clic
- [ ] Vista de biblioteca personal con filtros y ordenamiento

### Ratings
- [ ] Puntuar libro de 1 a 5 estrellas (media estrella incluida)
- [ ] Ver distribución de ratings (cuántos dieron 5, 4, 3...)
- [ ] Rating promedio visible en portada del libro y en listings

### Recomendaciones
- [ ] "Libros similares" en cada página de libro (por género + tags)
- [ ] "Porque te gustó X" — basado en libros con 4+ estrellas del usuario
- [ ] "Populares en tu género favorito" en el home del usuario logueado

---

## 5. Features — V2 (post-MVP, 3-6 meses)

- [ ] **Reading Challenges** — meta anual de libros (ej: "Quiero leer 24 libros en 2026")
- [ ] **Modo Descubrir** — cards tipo swipe para descubrir libros nuevos
- [ ] **Importar desde Goodreads** — CSV import de biblioteca existente
- [ ] **Seguir autores** — notificación cuando publican algo nuevo
- [ ] **Colecciones curadas** — listas editoriales ("Los 100 mejores de Sci-Fi")
- [ ] **Reseñas en texto** — además del rating, escribir una reseña
- [ ] **Clubes de lectura** — grupos donde leer el mismo libro
- [ ] **Dark mode**
- [ ] **App móvil** (React Native o PWA)

---

## 6. Modelo de Negocio

### Fase 1 — Tracción (meses 1-12, $0 ingresos)
- Foco en **SEO**: cada libro y autor tiene su propia página indexable
- Generar contenido que rankee en Google ("mejores libros de ciencia ficción", etc.)
- Construir base de usuarios activos

### Fase 2 — Monetización inicial (mes 6+)
- **Afiliados Amazon Associates** — botón "Comprar en Amazon" en cada libro con link de afiliado. Comisión del 4-8% por cada venta.
- **Google AdSense** — anuncios no intrusivos para usuarios no registrados
- Objetivo: cubrir costos de infraestructura cuando el tráfico escale

### Fase 3 — Premium (mes 12+, si hay tracción)
- **Plan BiblioTrack Plus** (~$4.99/mes o $39/año):
  - Sin anuncios
  - Listas ilimitadas y colecciones privadas
  - Estadísticas avanzadas de lectura
  - Recomendaciones de IA mejoradas
  - Acceso anticipado a nuevas features
- **Freemium:** la experiencia base siempre gratis

### Fase 4 — Escala (con inversión)
- Acuerdos con editoriales para previews exclusivos
- API propia para terceros (librerías, apps educativas)
- Modelo B2B: white-label para editoriales/librerías independientes
- Expansión a mercado LATAM (hispanohablante desatendido por Goodreads)

### Por qué puede ser un gran negocio
- Goodreads tiene +150M usuarios y fue comprado por Amazon en $150M en 2013. Sigue siendo lento y sin updates reales.
- El mercado de ebooks creció 18% en 2023 y sigue en alza
- El segmento hispanohablante está totalmente desatendido
- Modelo de afiliados + SaaS es probadamente escalable con bajo COGS

---

## 7. Estructura del Proyecto

```
bibliotrack/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── books/
│   │   ├── page.tsx              # Catálogo / búsqueda
│   │   └── [id]/page.tsx         # Detalle de libro
│   ├── authors/
│   │   └── [id]/page.tsx         # Perfil de autor
│   ├── genres/
│   │   └── [slug]/page.tsx       # Explorar por género
│   ├── profile/
│   │   └── [username]/page.tsx   # Perfil público
│   ├── dashboard/
│   │   └── page.tsx              # Home del usuario logueado
│   ├── api/
│   │   ├── books/route.ts
│   │   ├── ratings/route.ts
│   │   └── lists/route.ts
│   ├── layout.tsx
│   └── page.tsx                  # Landing / home público
├── components/
│   ├── ui/                       # shadcn components
│   ├── books/
│   │   ├── BookCard.tsx
│   │   ├── BookGrid.tsx
│   │   └── StarRating.tsx
│   ├── authors/
│   │   └── AuthorCard.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── Footer.tsx
├── lib/
│   ├── db.ts                     # Prisma client
│   ├── supabase.ts               # Supabase client
│   ├── apis/
│   │   ├── openLibrary.ts        # Open Library API client
│   │   └── googleBooks.ts        # Google Books API client
│   └── utils.ts
├── prisma/
│   └── schema.prisma             # DB schema
├── public/
│   └── og-image.png              # Para SEO/redes sociales
├── .env.example                  # Variables de entorno (sin valores reales)
├── .gitignore                    # Ignorar .env, node_modules, etc.
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── README.md
```

---

## 8. Esquema de Base de Datos (Prisma)

```prisma
model Book {
  id            String   @id @default(cuid())
  openLibraryId String?  @unique
  googleBooksId String?  @unique
  title         String
  description   String?
  coverUrl      String?
  publishedYear Int?
  language      String   @default("en")
  pageCount     Int?
  isbn          String?  @unique
  avgRating     Float    @default(0)
  ratingsCount  Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  authors       BookAuthor[]
  genres        BookGenre[]
  ratings       Rating[]
  listItems     ListItem[]
}

model Author {
  id            String   @id @default(cuid())
  openLibraryId String?  @unique
  name          String
  bio           String?
  photoUrl      String?
  birthYear     Int?
  deathYear     Int?
  nationality   String?
  website       String?

  books         BookAuthor[]
}

model BookAuthor {
  bookId    String
  authorId  String
  book      Book   @relation(fields: [bookId], references: [id])
  author    Author @relation(fields: [authorId], references: [id])

  @@id([bookId, authorId])
}

model Genre {
  id    String @id @default(cuid())
  name  String @unique
  slug  String @unique
  emoji String?

  books BookGenre[]
}

model BookGenre {
  bookId  String
  genreId String
  book    Book   @relation(fields: [bookId], references: [id])
  genre   Genre  @relation(fields: [genreId], references: [id])

  @@id([bookId, genreId])
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  name      String?
  avatarUrl String?
  bio       String?
  city      String?
  createdAt DateTime @default(now())

  ratings   Rating[]
  lists     ReadingList[]
}

model Rating {
  id        String   @id @default(cuid())
  userId    String
  bookId    String
  score     Float    // 0.5 a 5.0, con medias estrellas
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User @relation(fields: [userId], references: [id])
  book      Book @relation(fields: [bookId], references: [id])

  @@unique([userId, bookId])
}

model ReadingList {
  id        String     @id @default(cuid())
  userId    String
  name      String     // "Quiero leer", "Leyendo", "Leído", o custom
  type      ListType   @default(CUSTOM)
  isPublic  Boolean    @default(true)
  createdAt DateTime   @default(now())

  user      User       @relation(fields: [userId], references: [id])
  items     ListItem[]
}

model ListItem {
  id        String      @id @default(cuid())
  listId    String
  bookId    String
  addedAt   DateTime    @default(now())

  list      ReadingList @relation(fields: [listId], references: [id])
  book      Book        @relation(fields: [bookId], references: [id])

  @@unique([listId, bookId])
}

enum ListType {
  WANT_TO_READ
  READING
  READ
  CUSTOM
}
```

---

## 9. Code Style

- **TypeScript strict mode** habilitado
- Componentes funcionales con arrow functions
- `async/await` en lugar de `.then()`
- Nombres en inglés en el código, español en la UI
- No comentarios obvios; solo comentar decisiones no evidentes
- Imports absolutos con `@/` alias (ej: `@/components/BookCard`)
- Variables de entorno siempre en `.env.local`, nunca hardcodeadas

---

## 10. Testing Strategy

- **Unit tests:** Funciones utilitarias y transformaciones de datos de APIs (Vitest)
- **Integration tests:** Rutas de API con datos reales de Supabase test
- **E2E:** Flujos críticos con Playwright: registro, buscar libro, agregar a lista, puntuar
- **No** mockear la DB en tests de integración

---

## 11. Boundaries

### Siempre hacer
- Mantener `.env.example` actualizado sin valores reales
- Cachear respuestas de APIs externas en la DB local
- SEO: meta tags, Open Graph y JSON-LD en cada página de libro/autor
- Responsive design (mobile primero)
- Validar datos en el servidor, nunca confiar solo en el cliente

### Consultar antes de hacer
- Cambios al esquema de DB que requieran migraciones destructivas
- Integrar nuevas APIs de pago o con costos
- Cambios al modelo de negocio o monetización

### Nunca hacer
- Guardar credenciales o API keys en el repo
- Descargar o hostear ebooks con copyright
- Scraping de Goodreads u otras plataformas (viola ToS)
- Guardar datos personales más allá de lo necesario

---

## 12. Roadmap de Implementación

| Fase | Descripción | Duración estimada |
|------|-------------|-------------------|
| **0. Setup** | Repo GitHub, Vercel, Supabase, Next.js init | ✅ Completo |
| **1. Core** | DB schema, integración Open Library + Google Books, catálogo | 1-2 semanas |
| **2. Usuarios** | Auth, perfiles, listas personales | 1 semana |
| **3. Ratings** | Sistema de estrellas, promedios, distribución | 3-4 días |
| **4. Discovery** | Géneros, trending, recomendaciones básicas | 1 semana |
| **5. SEO + Deploy** | Meta tags, sitemap, deploy en Vercel | 3-4 días |
| **6. Afiliados** | Amazon Associates links en páginas de libros | 1-2 días |
| **7. Publish** | Editorial digital — autores independientes | 2-3 semanas |
| **8. Edit IA** | Agente editor con Claude + n8n | 3-4 semanas |

---

## 13. BiblioTrack Publish — Editorial Digital

### Concepto
Módulo para que autores independientes publiquen directamente en BiblioTrack. Los libros publicados aquí aparecen en el catálogo general junto a los libros de Open Library/Google Books, pero con un badge "Publicado en BiblioTrack".

### Ventaja competitiva vs mercado actual
| Plataforma | Modelo | Royalties | Comunidad | Editor IA |
|------------|--------|-----------|-----------|-----------|
| Amazon KDP | Distribución | 70% | ❌ | ❌ |
| Draft2Digital | Agregador | 90% neto | ❌ | ❌ |
| Wattpad | Comunidad | <5% | ✅ | ❌ |
| Reedsy | Marketplace servicios | N/A | Parcial | ❌ |
| **BiblioTrack** | Todo en uno | **85%** | **✅** | **✅** |

### Features V1 (MVP gratuito)
- [ ] Upload de manuscrito (EPUB, DOCX, PDF)
- [ ] Configurar portada (upload de imagen)
- [ ] Precio: gratis / pago / "paga lo que quieras"
- [ ] Descripción, géneros, tags
- [ ] Perfil de autor vinculado a cuenta de usuario
- [ ] El libro aparece en el catálogo con badge "BiblioTrack Author"
- [ ] Dashboard del autor: lecturas, ratings, lectores únicos

### Modelo de negocio
- Publicar: siempre **gratis**
- Libros gratuitos: gratis para siempre
- Libros de pago: BiblioTrack toma **15%** (vs 30% de Amazon)
- **Plan Pro Autor** ($9.99/mes): portadas premium, analíticas avanzadas, hasta 3 ediciones con IA por mes, badge verificado

### Cambios en DB necesarios
```prisma
model Manuscript {
  id          String           @id @default(cuid())
  userId      String
  bookId      String?          @unique  // null hasta publicar
  title       String
  status      ManuscriptStatus @default(DRAFT)
  fileUrl     String           // Supabase Storage
  coverUrl    String?
  price       Decimal          @default(0)  // 0 = gratis
  publishedAt DateTime?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  user        User             @relation(...)
  book        Book?            @relation(...)
  edits       EditSession[]
}

enum ManuscriptStatus {
  DRAFT
  EDITING      // Enviado al agente editor
  REVIEW       // Esperando revisión del autor
  PUBLISHED
}
```

---

## 14. BiblioTrack Edit — Agente Editor IA

### Concepto
Pipeline de edición con Claude que lee el libro **completo**, aprende la voz del autor, y devuelve sugerencias como track-changes. No reemplaza al editor humano — hace el trabajo que un editor humano cobra $500-$2000 por hacer.

### Lo que lo diferencia de "pegarle texto a ChatGPT"
1. **Lee el libro entero** (Claude 200k tokens ≈ 150.000 palabras) antes de editar
2. **Aprende tu estilo** primero — genera un "perfil de voz del autor"
3. **Devuelve track-changes** — vos aceptás o rechazás cada cambio
4. **No inventa contenido nuevo** — solo sugiere mejoras a lo tuyo
5. **4 pasadas distintas** para distintos aspectos (no todo junto)

### Pipeline (n8n + Claude API)

```
PASO 1 — Análisis de Voz (gratis, siempre)
  Claude lee cap. 1-3
  → Detecta: tono, longitud promedio de oraciones, vocabulario,
    POV, tiempo verbal, estilo de diálogos, recursos favoritos
  → Genera: "Perfil de Voz del Autor" (JSON)
  → Output: reporte legible para el autor

PASO 2 — Análisis Estructural (Pro)
  Claude lee el manuscrito completo
  → Evalúa: pacing por capítulo, consistencia de personajes,
    arco narrativo, plot holes, balance diálogo/narración
  → Genera: "Informe Estructural" con heatmap de tensión

PASO 3 — Edición de Línea (Pro)
  Capítulo por capítulo, usando el Perfil de Voz
  → Sugiere: claridad, redundancias, repeticiones de palabras,
    frases débiles — RESPETANDO el estilo detectado
  → Devuelve: diff con accepts/rejects por párrafo

PASO 4 — Corrección (Pro)
  Gramática, ortografía, puntuación
  → Devuelve: versión limpia con cambios marcados
```

### Stack técnico del agente
- **n8n** (self-hosted en un VPS barato, ej: DigitalOcean $6/mes) — orquestador
- **Claude API** modelo `claude-opus-4-7` — el editor
- **Supabase Storage** — almacenamiento de manuscritos y resultados
- **Webhook** desde Next.js → dispara el flujo de n8n
- **Email** (Resend, gratis hasta 3000/mes) — notifica al autor cuando termina

### Prompts clave (sistema)
```
Sistema para Paso 1 (Análisis de Voz):
"Eres un editor literario senior. Tu tarea es analizar el estilo
de escritura de este autor sin hacer juicios de valor. Identifica
de manera objetiva: [lista de 12 dimensiones de estilo]. Devuelve
un JSON estructurado con los hallazgos. NO corrijas nada todavía."

Sistema para Paso 3 (Edición de Línea):
"Eres un editor que ha leído este libro completo. El perfil de voz
del autor es: [PERFIL]. Tu trabajo es MEJORAR sin cambiar la voz.
Regla central: si dudas entre cambiar o dejar, dejá. Devuelve SOLO
los párrafos con cambios, en formato diff."
```

### Modelo de negocio del editor
| Feature | Gratis | Pro ($9.99/mes) |
|---------|--------|-----------------|
| Análisis de Voz (cap. 1-3) | ✅ | ✅ |
| Informe Estructural | Primeros 3 cap. | Libro completo |
| Edición de Línea | ❌ | ✅ (3/mes) |
| Corrección | ❌ | ✅ |
| Historial de ediciones | ❌ | ✅ |

---

## 15. FODA — BiblioTrack vs Competencia

| | **Fortalezas** | **Debilidades** |
|-|----------------|-----------------|
| | Círculo virtuoso: lectores + autores en una app | Sin distribución física |
| | Claude lee libros enteros (200k tokens) | Costo de API de Claude escala con uso |
| | Mercado hispanohablante desatendido | Moderación de contenido es costosa |
| | 15% comisión vs 30% de Amazon | Amazon KDP tiene el 80% del mercado |
| | MVP 100% gratuito | |

| | **Oportunidades** | **Amenazas** |
|-|------------------|--------------|
| | Goodreads sin innovación desde 2013 | Amazon puede copiar cualquier feature |
| | Wattpad perdiendo foco (vendida a coreanos) | Regulaciones de IA cambiantes |
| | Edición IA en etapa temprana | ProWritingAid puede agregar publicación |
| | 600M hispanohablantes sin plataforma | Competencia puede bajar comisiones |
| | Autores quieren más del 70% de royalties | |

---

*Spec actualizado el 2026-05-27. Versión 2.0.*
