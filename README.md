# Stock Core — Frontend operativo

SPA de inventario. Consume `InventarioSaaS-Api` y es la interfaz para productos,
stock, movimientos, compras, transferencias, conteos y reportes.

Stack: React 19, TypeScript, Vite, React Router, Tailwind CSS 4, shadcn/ui + Radix,
TanStack Query + TanStack Table, React Hook Form + Zod, Recharts.
El React Compiler esta activo: no escribas `useMemo` ni `useCallback` que el
compilador ya resuelve.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local     # VITE_API_URL -> InventarioSaaS-Api
npm run dev                    # puerto 3050
```

Necesita la API corriendo:

```bash
cd ../InventarioSaaS-Api && go run .    # puerto 3000
```

| Comando | Que hace |
|---|---|
| `npm run dev` | Servidor de desarrollo, puerto 3050 |
| `npm run build` | `tsc -b && vite build` |
| `npm run lint` | ESLint. **Baseline: 2 errores preexistentes** en `ui/form.tsx` y `usuarios/ChangeRolDialog.tsx` |
| `npm run preview` | Sirve el build |

## Arquitectura

Flujo de dependencias estrictamente unidireccional:

```text
types -> services -> hooks -> pages -> components
```

- `types/` — contratos TS que reflejan la API.
- `services/` — solo HTTP. Todo pasa por `src/lib/api.ts`, que construye la URL
  desde `VITE_API_URL`, aplica el token, desenvuelve el envelope y lanza `ApiError`
  tipado. Nunca llames `fetch` desde una pagina.
- `hooks/` — queries y mutaciones de TanStack Query, claves de cache, invalidaciones.
- `pages/` — composicion de rutas y estado de pantalla.
- `components/` — `ui/` (primitivas sin logica de negocio), `shared/`, `layout/` y
  carpetas por dominio.
- `context/` — solo estado transversal: `AuthProvider`, `SucursalProvider`,
  `ThemeProvider`, `LayoutProvider`.

Envelope de la API, identico en los dos backends:

```ts
interface ApiResponse<T> { data: T; codigo: number; error: boolean; mensaje: string }
```

## Permisos

El backend valida cada operacion; **lo del frontend es solo experiencia de usuario**.
Ocultar un boton no protege nada — la ruta del servidor ya exige el permiso y
responde `403`.

Tres capas, las tres alimentadas por `hasPermission` de `AuthProvider`, que a su vez
lee los permisos que devuelve `/api/auth/me`:

| Capa | Donde | Que hace |
|---|---|---|
| Grupos y items del menu | `components/layout/app-sidebar.tsx` | Oculta cada item; un grupo sin items visibles no muestra su titulo |
| Rutas | `App.tsx` via `shared/RequirePermission` | Redirige a `/dashboard` con un toast |
| Botones de accion | Paginas individuales | Oculta acciones que el rol no puede ejecutar |

`/dashboard` **no debe protegerse**: es el destino del redirect de
`RequirePermission` y protegerla causa un bucle infinito.

Los permisos se escriben `recurso:accion` y deben coincidir exactamente con los de
la tabla `permisos` del backend. Ojo con los guiones bajos: la ruta es
`/tipos-negocio` pero el permiso es `tipos_negocio:leer`.

Para probar por rol, ver `../PRUEBAS-ROLES.md`.

## Componentes compartidos

`src/components/shared/` es el punto de apalancamiento: `CrudTable`, `EmptyState`,
`ErrorState`, `SearchInput`, `StatusBadge`, `ConfirmDialog`, `PageHeader` sostienen
casi todas las pantallas, asi que arreglar uno arregla todas.

**`CrudTable` necesita que le pases los tres estados.** Acepta `isLoading`,
`isError` + `error` + `onRetry`, y `emptyMessage` + `emptyAction`. Si omites los de
error, un fallo de red se renderiza como un inocente "sin resultados" y el usuario
cree que no hay datos.

## Registros desactivados

El CRUD usa borrado logico. Las paginas de listado tienen un selector
**Activos / Inactivos** que envia `?activo=true|false` a la API; sin el, un registro
desactivado desaparecia de la pantalla y no habia forma de restaurarlo.

Disponible en Productos, Categorias, Unidades, Proveedores y Sucursales.

## Sucursal activa

`SucursalProvider` expone la sucursal seleccionada. Las queries con alcance por
sucursal **deben incluir `sucursalId` en su clave de React Query**, o el cache
devolvera datos de otra sucursal al cambiar.

## Convenciones

- Nada de `any`. Modela el estado desconocido o parcial de forma explicita.
- No guardes secretos ni credenciales en variables `VITE_*`: terminan en el bundle.
- No confies en precios, totales, roles ni permisos calculados en el cliente. El
  servidor recalcula y valida.
- No agregues una libreria nueva donde el stack actual ya cubre el caso.
