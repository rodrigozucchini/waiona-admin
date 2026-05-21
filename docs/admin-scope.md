# Waiona Admin — Relevamiento Frontend

Documento para definir el alcance del panel de administración **antes** de mapear la API.
Completar cada sección para que el desarrollo sea preciso y sin retrabajo.

---

## 1. Autenticación

- [ ] ¿Cómo se autentica el admin? (usuario/contraseña, SSO, OAuth, magic link)
- [ ] ¿La API devuelve JWT, cookie de sesión u otro mecanismo?
- [ ] ¿Hay múltiples roles de administrador? (superadmin, moderador, soporte, etc.)
- [ ] ¿Qué permisos distinguen cada rol? (solo lectura, escritura, borrado, etc.)

---

## 2. Módulos / Secciones

Lista los recursos que el admin necesita gestionar. Para cada uno indicar qué operaciones aplican:

| Módulo | Ver lista | Ver detalle | Crear | Editar | Eliminar | Notas |
|--------|-----------|-------------|-------|--------|----------|-------|
| (ej. Usuarios) | ✓ | ✓ | ✓ | ✓ | ✓ | |
| | | | | | | |
| | | | | | | |

---

## 3. Dashboard / Home

- [ ] ¿Qué métricas o KPIs debe mostrar la pantalla de inicio?
  - Ejemplos: total de usuarios, ventas del día, pedidos pendientes, alertas activas
- [ ] ¿Se necesitan gráficas o solo números?
- [ ] ¿Los datos del dashboard son en tiempo real (WebSocket/polling) o estáticos?

---

## 4. Tablas y Listados

- [ ] ¿Las tablas necesitan paginación del lado del servidor o del cliente?
- [ ] ¿Se requiere búsqueda/filtrado por columnas?
- [ ] ¿Se necesita ordenamiento por columnas?
- [ ] ¿Exportar a CSV/Excel?
- [ ] ¿Acciones en bulk (seleccionar varios y borrar/editar)?

---

## 5. Formularios

- [ ] ¿Qué campos son comunes en los formularios? (texto, selects, fechas, imágenes, rich text)
- [ ] ¿Hay carga de archivos/imágenes?
- [ ] ¿Validaciones del lado del cliente además de las del servidor?

---

## 6. Notificaciones y Feedback

- [ ] ¿Se muestran notificaciones en tiempo real dentro del panel? (nuevos pedidos, alertas)
- [ ] ¿Toast/snackbar para confirmar acciones (guardado, borrado)?
- [ ] ¿Hay un centro de notificaciones (campana)?

---

## 7. Navegación y Layout

- [ ] ¿Sidebar fijo o colapsable?
- [ ] ¿El menú de navegación es estático o dinámico según el rol del usuario?
- [ ] ¿Breadcrumbs en páginas de detalle?
- [ ] ¿Multi-idioma o solo español?

---

## 8. Páginas mínimas requeridas

Marcar las que aplican:

- [ ] Login
- [ ] Dashboard / Home
- [ ] Por cada módulo: lista + detalle/formulario
- [ ] Perfil del admin logueado
- [ ] Gestión de roles/permisos (si aplica)
- [ ] Logs de actividad / auditoría
- [ ] Configuración general

---

## 9. Integraciones externas

- [ ] ¿Hay mapas, editores de texto enriquecido, gráficas (chart library)?
- [ ] ¿Pagos, facturación, algún dashboard de terceros embebido?

---

## 10. Preguntas sobre la API

Una vez compartida la ubicación de la API, revisar:

- [ ] ¿Tiene spec OpenAPI/Swagger? (`/docs`, `openapi.json`)
- [ ] ¿Cómo maneja la paginación? (cursor, offset/limit, page/size)
- [ ] ¿Cómo maneja errores? (estructura del body de error)
- [ ] ¿Hay endpoints específicos para el rol admin o usa el mismo base que el cliente?
- [ ] ¿Requiere headers especiales además del token de auth?

---

## Resumen ejecutivo (completar al final)

**Módulos confirmados:**
-

**Roles de usuario:**
-

**Páginas totales estimadas:**
-

**Dependencias o blockers identificados:**
-
