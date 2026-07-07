# Plan de Implementación: Frontend ↔ Backend

## Estado Actual

### Backend (`InventarioSaaS-Api/`)
- Go + Gin + pgx/sqlc + PostgreSQL
- API REST completa con 15+ módulos en `http://localhost:8080/api`
- JWT multi-tenant con organización como boundary
- Envelope estándar: `{ data, codigo, error, mensaje }`
- Middleware pipeline: Logger → Auth → Permission → Audit → Handler

### Frontend (`stock-core/`)
- React 19 + Vite 8 + TypeScript 6 + Tailwind v4 + shadcn/ui
- TanStack React Query 5 (instalado, sin usar)
- TanStack React Table 8 + Recharts 3.8 + dnd-kit
- React Hook Form + Zod 4
- **Sin router** (no React Router)
- **Sin capa API**
- **Sin auth**
- **Sin tipos compartidos**
- Solo Dashboard con datos mock:
  - `SectionCards` (tarjetas con datos estáticos)
  - `ChartAreaInteractive` (área chart mock, 3 meses de datos)
  - `DataTable` (tabla con `data.json` de documentos)
- Sidebar con items hardcodeados apuntando a `#`

---

## Fase 1: Infraestructura Base

### 1.1 Variables de entorno

Crear `stock-core/.env`:

```env
VITE_API_URL=http://localhost:8080/api
```

### 1.2 Cliente HTTP (`src/lib/api.ts`)

Wrapper sobre `fetch` con:

- Base URL desde `import.meta.env.VITE_API_URL`
- Header `Authorization: Bearer <token>` automático desde cookie/localStorage
- Manejo del envelope estándar
- Tipado genérico:
  ```typescript
  interface ApiResponse<T> { data: T; codigo: number; error: boolean; mensaje: string }
  interface ApiListResponse<T> { data: T[]; codigo: number; error: boolean; mensaje: string }
  ```
- Manejo de errores (red, HTTP, validación)
- Interceptor 401 → redirigir a login

Funciones exportadas:

| Función | Descripción |
|---------|-------------|
| `api.get<T>(path, params?)` | GET request |
| `api.post<T>(path, body?)` | POST request |
| `api.patch<T>(path, body?)` | PATCH request |
| `api.del<T>(path)` | DELETE request |

### 1.3 Tipos compartidos (`src/types/`)

Un archivo por dominio:

```
src/types/
  auth.ts        -> LoginRequest, LoginResponse, AuthContext, UsuarioSesion
  producto.ts    -> Producto, CreateProductoInput, UpdateProductoInput
  categoria.ts   -> Categoria, CreateCategoriaInput, ...
  unidad.ts      -> Unidad, ...
  proveedor.ts   -> Proveedor, ...
  sucursal.ts    -> Sucursal, ...
  usuario.ts     -> Usuario, ...
  rol.ts         -> Rol, Permiso, ...
  compra.ts      -> Compra, CompraItem, CreateCompraInput
  transferencia.ts -> Transferencia, TransferenciaItem
  devolucion.ts  -> Devolucion, DevolucionItem
  conteo.ts      -> Conteo, ConteoItem
  inventario.ts  -> Stock, Movimiento, ReservaStock
  reporte.ts     -> StockBajoItem, KardexItem, ValoracionInventario
  configuracion.ts -> Configuracion
  organizacion.ts -> Organizacion
  common.ts      -> PaginationParams, PaginatedResponse, ApiResponse, ApiListResponse
```

Ejemplo de `Producto`:

```typescript
export interface Producto {
  id: string
  organizacionId: string
  categoriaId?: string
  unidadId?: string
  codigo?: string
  nombre: string
  descripcion?: string
  costo: number
  precio: number
  stockMinimo: number
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CreateProductoInput {
  categoriaId?: string
  unidadId?: string
  codigo?: string
  nombre: string
  descripcion?: string
  costo?: number
  precio?: number
  stockMinimo?: number
}

export interface UpdateProductoInput {
  categoriaId?: string
  unidadId?: string
  codigo?: string
  nombre?: string
  descripcion?: string
  costo?: number
  precio?: number
  stockMinimo?: number
}
```

### 1.4 Servicios (`src/services/`)

Capa delgada que usa `api.ts` y los tipos. Un archivo por dominio:

```typescript
// src/services/productos.ts
import { api } from "@/lib/api"
import type { Producto, CreateProductoInput, UpdateProductoInput } from "@/types/producto"

export const productosService = {
  list: (params?: Record<string, string>) =>
    api.get<Producto[]>("/productos", params),
  getById: (id: string) =>
    api.get<Producto>(`/productos/${id}`),
  create: (data: CreateProductoInput) =>
    api.post<Producto>("/productos", data),
  update: (id: string, data: UpdateProductoInput) =>
    api.patch<Producto>(`/productos/${id}`, data),
  remove: (id: string) =>
    api.del<Producto>(`/productos/${id}`),
  restore: (id: string) =>
    api.patch<Producto>(`/productos/${id}/restaurar`),
}
```

### 1.5 React Router (`react-router-dom`)

Instalar `react-router-dom`.

Estructura de routing en `App.tsx`:

```typescript
<QueryClientProvider>
  <AuthProvider>
    <ThemeProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/productos" element={<ProductosPage />} />
              <Route path="/categorias" element={<CategoriasPage />} />
              <Route path="/unidades" element={<UnidadesPage />} />
              <Route path="/proveedores" element={<ProveedoresPage />} />
              <Route path="/sucursales" element={<SucursalesPage />} />
              <Route path="/usuarios" element={<UsuariosPage />} />
              <Route path="/roles" element={<RolesPage />} />
              <Route path="/compras" element={<ComprasPage />} />
              <Route path="/compras/nueva" element={<CompraFormPage />} />
              <Route path="/compras/:id" element={<CompraDetailPage />} />
              <Route path="/transferencias" element={<TransferenciasPage />} />
              <Route path="/devoluciones" element={<DevolucionesPage />} />
              <Route path="/conteos" element={<ConteosPage />} />
              <Route path="/inventario" element={<InventarioPage />} />
              <Route path="/inventario/movimientos" element={<MovimientosPage />} />
              <Route path="/inventario/ajustes" element={<AjustesPage />} />
              <Route path="/reportes/stock-bajo" element={<StockBajoPage />} />
              <Route path="/reportes/kardex" element={<KardexPage />} />
              <Route path="/reportes/valoracion" element={<ValoracionPage />} />
              <Route path="/configuracion" element={<ConfiguracionPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </AuthProvider>
</QueryClientProvider>
```

**ProtectedLayout**: Componente que:
- Renderiza AppSidebar + SiteHeader + `<Outlet />`
- Verifica auth vía `useAuth()`, redirige a `/login` si no hay token

---

## Fase 2: Autenticación

### 2.1 Página de Login (`/login`)

- Ruta pública (sin ProtectedLayout)
- Formulario con React Hook Form + Zod:
  ```
  schema: { codigoOrganizacion: string, email: string, contrasena: string }
  ```
- Submit → `POST /api/auth/login`
- En respuesta: guardar `token` en cookie/localStorage, guardar `usuario` y `permisos` en contexto
- Redirigir a `/dashboard`

### 2.2 Auth Provider (`src/context/auth-provider.tsx`)

```typescript
interface AuthContextType {
  user: UsuarioSesion | null
  token: string | null
  permisos: string[]
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  logout: () => void
  hasPermission: (permiso: string) => boolean
}
```

- Al mount: leer token de cookie, si existe → `GET /api/auth/me` para cargar sesión
- `login()`: llama al endpoint, guarda token, carga usuario
- `logout()`: limpia token, redirige a `/login`

### 2.3 AuthGuard / ProtectedLayout

```typescript
function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <Skeleton />
  if (!isAuthenticated) return <Navigate to="/login" />
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
```

### 2.4 Sidebar dinámica

- Reemplazar `data.user` hardcodeado con `useAuth().user`
- Los items de navegación deben usar `<NavLink>` de react-router-dom
- `NavUser`: mostrar nombre real, email, menú desplegable con "Cerrar sesión"

---

## Fase 3: React Query Hooks

Configurar `QueryClientProvider` en `App.tsx`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,       // 30 seg
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

### Patrón de hooks por módulo

```
src/hooks/
  useProductos.ts
  useCategorias.ts
  useUnidades.ts
  useProveedores.ts
  useSucursales.ts
  useUsuarios.ts
  useRoles.ts
  useCompras.ts
  useTransferencias.ts
  useDevoluciones.ts
  useConteos.ts
  useInventario.ts
  useReportes.ts
  useConfiguraciones.ts
```

Cada hook sigue la misma estructura:

```typescript
// src/hooks/useProductos.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { productosService } from "@/services/productos"
import type { CreateProductoInput, UpdateProductoInput } from "@/types/producto"

export const productosKeys = {
  all: ["productos"] as const,
  lists: () => [...productosKeys.all, "list"] as const,
  list: (filters: Record<string, string>) => [...productosKeys.lists(), filters] as const,
  details: () => [...productosKeys.all, "detail"] as const,
  detail: (id: string) => [...productosKeys.details(), id] as const,
}

export function useProductos(filters?: Record<string, string>) {
  return useQuery({
    queryKey: productosKeys.list(filters ?? {}),
    queryFn: () => productosService.list(filters),
  })
}

export function useProducto(id: string) {
  return useQuery({
    queryKey: productosKeys.detail(id),
    queryFn: () => productosService.getById(id),
    enabled: !!id,
  })
}

export function useCreateProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProductoInput) => productosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productosKeys.lists() })
    },
  })
}

export function useUpdateProducto(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProductoInput) => productosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productosKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productosKeys.detail(id) })
    },
  })
}

export function useDeleteProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productosService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productosKeys.lists() })
    },
  })
}
```

---

## Fase 4: Dashboard Real

### 4.1 SectionCards

Reemplazar datos mock:

| Tarjeta | Endpoint |
|---------|----------|
| Productos Activos | `GET /api/productos` → `data.length` |
| Stock Bajo | `GET /api/reportes/stock-bajo` → `data.length` |
| Valor del Inventario | `GET /api/reportes/valoracion` → sumar `valorTotal` |
| Movimientos Hoy | `GET /api/inventario/movimientos?fechaDesde=<hoy>` → `data.length` |

Usar hooks:
```typescript
const { data: productos } = useProductos({ activo: "true" })
const { data: stockBajo } = useStockBajo()
const { data: valoracion } = useValoracionInventario()
```

### 4.2 ChartAreaInteractive

Reemplazar datos mock del área chart con movimientos agrupados por día:

- `GET /api/inventario/movimientos` con filtro de fecha (últimos 90/30/7 días)
- Agrupar por fecha y tipo (entradas vs salidas)
- Dos áreas apiladas: "Entradas" y "Salidas"

### 4.3 DataTable – Productos en lugar de documentos mock

Reemplazar `data.json` por datos de `GET /api/productos`:

```typescript
const { data: productos, isLoading } = useProductos()
```

Columnas:
| Columna | Accessor | Tipo |
|---------|----------|------|
| Código | `codigo` | texto |
| Nombre | `nombre` | texto (link a detalle) |
| Categoría | `categoriaId` | badge con nombre (join) |
| Stock Mínimo | `stockMinimo` | número |
| Costo | `costo` | moneda |
| Precio | `precio` | moneda |
| Estado | `activo` | badge Activo/Inactivo |
| Acciones | — | dropdown (editar, eliminar, restaurar) |

---

## Fase 5: Páginas CRUD

### Patrón de implementación para cada módulo

```
src/pages/categorias/
  index.tsx          -> Página con tabla + toolbar
  CategoriaForm.tsx  -> Formulario crear/editar (React Hook Form + Zod)
```

### Componentes reutilizables a crear

| Componente | Propósito |
|------------|-----------|
| `CrudTable` | Tabla genérica con columnas, paginación, selección, toolbar |
| `SearchInput` | Input de búsqueda con debounce |
| `ConfirmDialog` | Diálogo de confirmación (eliminar, anular) |
| `StatusBadge` | Badge para activo/inactivo, estados de compra, etc. |
| `PageHeader` | Header de página con título + breadcrumb + botón crear |
| `EmptyState` | Estado vacío para tablas sin datos |
| `LoadingSkeleton` | Skeleton loader para páginas |

### 5.1 Productos (`/productos`)

- Tabla con columnas: Código, Nombre, Categoría, Unidad, Costo, Precio, Stock Mínimo, Activo
- Filtros: código, nombre, categoriaId, unidadId (query params → backend)
- Formulario: nombre (req), código, descripción, categoría (select), unidad (select), costo, precio, stockMinimo
- Acciones inline: editar (drawer/modal), desactivar, restaurar

### 5.2 Categorías (`/categorias`)

- Tabla simple: Código, Nombre, Descripción, Activo
- Formulario simple: código, nombre, descripción

### 5.3 Unidades (`/unidades`)

- Tabla: Símbolo, Nombre, Precisión, Activo
- Formulario: nombre, símbolo, precisión

### 5.4 Proveedores (`/proveedores`)

- Tabla: Nombre, NIT, Email, Teléfono, Activo
- Formulario: nombre, nit, email, teléfono, dirección

### 5.5 Sucursales (`/sucursales`)

- Tabla: Código, Nombre, Dirección, Teléfono, Activo
- Formulario: nombre, código, dirección, teléfono

### 5.6 Usuarios (`/usuarios`)

- Tabla: Email, Nombres, Apellidos, Rol, Último Login, Activo
- Formulario crear: email, contraseña, rol (select), nombres, apellidos
- Acciones: desactivar, restaurar, cambiar rol, cambiar contraseña

### 5.7 Roles (`/roles`)

- Tabla: Código, Nombre, Descripción
- Formulario: nombre, código, descripción
- Sección de permisos: tabla de permisos con checkboxes para asignar/desasignar

### 5.8 Compras (`/compras`, `/compras/nueva`, `/compras/:id`)

**Lista**: Número, Proveedor, Sucursal, Estado, Total, Fecha

**Formulario maestrodetalle**:
- Maestro: sucursal (select), proveedor (select), número, observación
- Detalle: tabla de items con producto (search/select), cantidad, costo unitario, subtotal calculado
- Total calculado dinámicamente
- Submit → `POST /api/compras`

**Detalle**: Ver compra con todos sus items, botón para anular

### 5.9 Transferencias (`/transferencias`, `/transferencias/nueva`, `/transferencias/:id`)

Misma estructura que compras:
- Maestro: sucursal origen, sucursal destino, número, observación
- Detalle: items con producto + cantidad
- Acción: anular

### 5.10 Devoluciones (`/devoluciones`, `/devoluciones/nueva`, `/devoluciones/:id`)

- Maestro: sucursal, proveedor, compra asociada (opcional), número, motivo
- Detalle: items con producto, cantidad, costo unitario
- Acción: anular

### 5.11 Conteos (`/conteos`, `/conteos/:id`)

**Lista**: Sucursal, Estado (Abierto/Cerrado/Anulado), Observación, Fecha

**Detalle/Registro**:
- Si estado es "abierto": formulario para registrar cantidades contadas por producto
- Botón "Cerrar Conteo" → `PATCH /api/conteos/:id/cerrar`
- Botón "Anular" → `PATCH /api/conteos/:id/anular`

**Crear**: seleccionar sucursal + productos a contar

### 5.12 Inventario (`/inventario`)

**Stock**: Tabla con Producto, Sucursal, Cantidad Actual
- Filtros: productoId, sucursalId

**Movimientos**: Tabla histórica con Tipo, Producto, Sucursal, Cantidad, Fecha, Motivo
- Filtros: productoId, sucursalId, tipo, fechaDesde, fechaHasta

**Ajustes**: Formulario para ajustes de stock
- Tipo: entrada/salida
- Producto, Sucursal, Cantidad, Motivo
- Submit según tipo → `POST /api/inventario/ajustes` o `POST /api/inventario/mermas`

### 5.13 Reportes

**Stock Bajo** (`/reportes/stock-bajo`):
- Tabla: Producto, Sucursal, Stock Actual, Stock Mínimo, Diferencia
- Filtro: sucursalId

**Kardex** (`/reportes/kardex`):
- Tabla: Fecha, Tipo, Documento, Entrada, Salida, Saldo
- Filtros: productoId, sucursalId, fechaDesde, fechaHasta

**Valoración** (`/reportes/valoracion`):
- Tabla: Producto, Stock Actual, Costo Promedio, Valor Total
- Filtro: sucursalId

### 5.14 Configuración (`/configuracion`)

- Tabla de configuraciones con clave/valor
- Formulario: sucursal (opcional), clave, valor (JSONB → input de texto)

---

## Fase 6: Sidebar Definitiva

Reemplazar items mock en `app-sidebar.tsx` con navegación real:

```
Panel              -> /dashboard
Catálogo
├── Productos      -> /productos
├── Categorías     -> /categorias
├── Unidades       -> /unidades
└── Proveedores    -> /proveedores
Inventario
├── Stock          -> /inventario
├── Movimientos    -> /inventario/movimientos
├── Ajustes        -> /inventario/ajustes
└── Conteos        -> /conteos
Operaciones
├── Compras        -> /compras
├── Transferencias -> /transferencias
└── Devoluciones   -> /devoluciones
Reportes
├── Stock Bajo     -> /reportes/stock-bajo
├── Kardex         -> /reportes/kardex
└── Valoración     -> /reportes/valoracion
Configuración
├── General        -> /configuracion
├── Usuarios       -> /usuarios
├── Roles          -> /roles
└── Sucursales     -> /sucursales
```

Usar `<NavLink>` de react-router-dom para los `url`:
```typescript
{
  title: "Productos",
  url: "/productos",
  icon: IconPackage,
}
```

Activar estado activo con `isActive` de NavLink para estilos.

---

## Mapa Completo de Endpoints ↔ Frontend

| Endpoint Backend | Página Frontend | Hook | Componente |
|---|---|---|---|
| `POST /api/auth/login` | `/login` | `useLogin` | LoginPage |
| `GET /api/auth/me` | — (layout) | `useAuth` | AuthProvider |
| `GET /api/productos` | `/productos` | `useProductos` | ProductosTable |
| `POST /api/productos` | `/productos` | `useCreateProducto` | ProductoForm |
| `GET /api/productos/:id` | — | `useProducto` | — |
| `PATCH /api/productos/:id` | — | `useUpdateProducto` | ProductoForm |
| `DELETE /api/productos/:id` | — | `useDeleteProducto` | — |
| `PATCH /api/productos/:id/restaurar` | — | `useRestoreProducto` | — |
| *(mismo patrón para categorías, unidades, proveedores, sucursales)* | | | |
| `GET /api/usuarios` | `/usuarios` | `useUsuarios` | UsuariosTable |
| `POST /api/usuarios` | `/usuarios` | `useCreateUsuario` | UsuarioForm |
| `GET /api/roles` | `/roles` | `useRoles` | RolesTable |
| `GET /api/roles/:id/permisos` | `/roles/:id` | `useRolPermisos` | PermisosAsignacion |
| `GET /api/compras` | `/compras` | `useCompras` | ComprasTable |
| `POST /api/compras` | `/compras/nueva` | `useCreateCompra` | CompraForm |
| `GET /api/transferencias` | `/transferencias` | `useTransferencias` | TransferenciasTable |
| `GET /api/devoluciones` | `/devoluciones` | `useDevoluciones` | DevolucionesTable |
| `GET /api/conteos` | `/conteos` | `useConteos` | ConteosTable |
| `PATCH /api/conteos/:id/items` | `/conteos/:id` | `useRegistrarConteo` | ConteoRegistro |
| `GET /api/inventario/stock` | `/inventario` | `useStock` | StockTable |
| `GET /api/inventario/movimientos` | `/inventario/movimientos` | `useMovimientos` | MovimientosTable |
| `POST /api/inventario/ajustes` | `/inventario/ajustes` | `useAjustarStock` | AjusteForm |
| `POST /api/inventario/mermas` | `/inventario/ajustes` | `useRegistrarMerma` | MermaForm |
| `GET /api/reportes/stock-bajo` | `/reportes/stock-bajo` | `useStockBajo` | StockBajoTable |
| `GET /api/reportes/kardex` | `/reportes/kardex` | `useKardex` | KardexTable |
| `GET /api/reportes/valoracion` | `/reportes/valoracion` | `useValoracion` | ValoracionTable |
| `GET /api/configuraciones` | `/configuracion` | `useConfiguraciones` | ConfigTable |
| `GET /api/catalogo/productos` | (selector en compras) | `useCatalogoProductos` | ProductoSelector |

---

## Orden de Implementación Recomendado

| # | Fase | Estimación | Dependencias |
|---|------|-----------|--------------|
| 1 | Infraestructura (API client, types, router) | 1 sesión | — |
| 2 | Login + Auth Provider + ProtectedLayout | 1 sesión | Fase 1 |
| 3 | Dashboard real con datos del backend | 1 sesión | Fase 2 |
| 4 | Productos + Categorías + Unidades | 1 sesión | Fase 2 |
| 5 | Proveedores + Sucursales | 1 sesión | Fase 4 |
| 6 | Compras (maestro-detalle) | 2 sesiones | Fase 4 |
| 7 | Inventario (stock, movimientos, ajustes, mermas) | 1 sesión | Fase 4 |
| 8 | Transferencias + Devoluciones | 2 sesiones | Fase 4 |
| 9 | Conteos físicos | 1 sesión | Fase 4 |
| 10 | Usuarios + Roles + Permisos | 1 sesión | Fase 2 |
| 11 | Reportes (stock bajo, kardex, valoración) | 1 sesión | Fase 4 |
| 12 | Configuración + Sidebar final + pulidos | 1 sesión | Fase 4 |

**Total estimado: ~13-14 sesiones de trabajo**

---

## API Endpoints de Referencia

### Auth
| Método | Ruta | Cuerpo |
|--------|------|--------|
| POST | `/api/auth/login` | `{ codigoOrganizacion, email, contrasena }` |
| GET | `/api/auth/me` | — |

### Organizaciones (solo admin)
| Método | Ruta |
|--------|------|
| GET | `/api/organizaciones` |
| POST | `/api/organizaciones` |
| GET | `/api/organizaciones/:id` |
| PATCH | `/api/organizaciones/:id` |
| DELETE | `/api/organizaciones/:id` |
| PATCH | `/api/organizaciones/:id/restaurar` |

### CRUD Genérico (categorías, unidades, sucursales, productos, proveedores, configuraciones)
| Método | Ruta |
|--------|------|
| GET | `/api/<recursos>` |
| POST | `/api/<recursos>` |
| GET | `/api/<recursos>/:id` |
| PATCH | `/api/<recursos>/:id` |
| DELETE | `/api/<recursos>/:id` |
| PATCH | `/api/<recursos>/:id/restaurar` |

### Usuarios
| Método | Ruta |
|--------|------|
| GET | `/api/usuarios` |
| POST | `/api/usuarios` |
| PATCH | `/api/usuarios/:id/desactivar` |
| PATCH | `/api/usuarios/:id/restaurar` |
| PATCH | `/api/usuarios/:id/rol` |
| PATCH | `/api/usuarios/:id/contrasena` |

### Roles & Permisos
| Método | Ruta |
|--------|------|
| GET | `/api/roles` |
| POST | `/api/roles` |
| PATCH | `/api/roles/:id` |
| GET | `/api/roles/:id/permisos` |
| POST | `/api/roles/:id/permisos` |
| DELETE | `/api/roles/:id/permisos/:permisoId` |
| GET | `/api/permisos` |

### Compras
| Método | Ruta |
|--------|------|
| GET | `/api/compras` |
| POST | `/api/compras` |
| GET | `/api/compras/:id` |
| PATCH | `/api/compras/:id/anular` |

### Transferencias
| Método | Ruta |
|--------|------|
| GET | `/api/transferencias` |
| POST | `/api/transferencias` |
| GET | `/api/transferencias/:id` |
| PATCH | `/api/transferencias/:id/anular` |

### Devoluciones
| Método | Ruta |
|--------|------|
| GET | `/api/devoluciones` |
| POST | `/api/devoluciones` |
| GET | `/api/devoluciones/:id` |
| PATCH | `/api/devoluciones/:id/anular` |

### Conteos
| Método | Ruta |
|--------|------|
| GET | `/api/conteos` |
| POST | `/api/conteos` |
| GET | `/api/conteos/:id` |
| PATCH | `/api/conteos/:id/items` |
| PATCH | `/api/conteos/:id/cerrar` |
| PATCH | `/api/conteos/:id/anular` |

### Inventario
| Método | Ruta |
|--------|------|
| GET | `/api/inventario/stock` |
| GET | `/api/inventario/movimientos` |
| POST | `/api/inventario/ajustes` |
| POST | `/api/inventario/mermas` |
| GET | `/api/inventario/reservas` |
| POST | `/api/inventario/reservas` |
| PATCH | `/api/inventario/reservas/:id/confirmar` |
| PATCH | `/api/inventario/reservas/:id/liberar` |
| PATCH | `/api/inventario/reservas/:id/expirar` |

### Catálogo (para selectores)
| Método | Ruta |
|--------|------|
| GET | `/api/catalogo/productos` |

### Reportes
| Método | Ruta |
|--------|------|
| GET | `/api/reportes/stock-bajo` |
| GET | `/api/reportes/kardex` |
| GET | `/api/reportes/valoracion` |

### Salud
| Método | Ruta |
|--------|------|
| GET | `/api/health` |

---

## Convenios de Código

### Nombramiento
- Archivos: `kebab-case.ts`
- Componentes: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Servicios: `camelCase.ts`
- Tipos: `camelCase.ts`
- Interfaces: `PascalCase`
- Tipos alias: `Tipo + PascalCase`

### Organización de imports
1. React/hooks
2. Librerías externas (react-router, tanstack, recharts, etc.)
3. Componentes/ui
4. Componentes propios
5. Hooks
6. Servicios
7. Tipos
8. Utilidades
9. Estilos

### Convenios de React Query
- Query keys con spread operator para filtros parciales
- Separar `all`, `lists`, `list`, `details`, `detail` por módulo
- Invalidar solo lo necesario tras mutations
- Usar `onSuccess` para invalidar, no para setear estado local

### Convenios de formularios
- React Hook Form + Zod para validación
- Esquema Zod define la validación y el tipo
- Errores del backend mostrados vía toast (sonner)
- Estados loading/disabled durante submit
- Reset del formulario tras creación exitosa

### Manejo de errores
- Errores de red: toast "Error de conexión"
- Errores 401: logout automático
- Errores 403: toast "No tienes permiso"
- Errores 422/400: mostrar mensaje del backend
- Errores 500: toast "Error interno del servidor"
