export interface NavItem {
  label: string
  href?: string
  icon: string
  children?: { label: string; href: string }[]
}

export const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    label: 'Catálogo',
    icon: 'Package',
    children: [
      { label: 'Productos', href: '/catalog/products' },
      { label: 'Combos', href: '/catalog/combos' },
      { label: 'Categorías', href: '/catalog/categories' },
    ],
  },
  {
    label: 'Precios',
    icon: 'DollarSign',
    children: [
      { label: 'Márgenes', href: '/pricing/margins' },
      { label: 'Productos', href: '/pricing/products' },
      { label: 'Combos', href: '/pricing/combos' },
    ],
  },
  {
    label: 'Impuestos',
    href: '/taxes',
    icon: 'Receipt',
  },
  {
    label: 'Inventario',
    icon: 'Warehouse',
    children: [
      { label: 'Stock', href: '/stock/items' },
      { label: 'Ubicaciones', href: '/stock/locations' },
      { label: 'Movimientos', href: '/stock/movements' },
      { label: 'Bajas', href: '/stock/write-offs' },
    ],
  },
  {
    label: 'Promociones',
    icon: 'Tag',
    children: [
      { label: 'Cupones', href: '/promotions/coupons' },
      { label: 'Descuentos', href: '/promotions/discounts' },
    ],
  },
  {
    label: 'Órdenes',
    href: '/orders',
    icon: 'ShoppingCart',
  },
  {
    label: 'Usuarios',
    href: '/users',
    icon: 'Users',
  },
]
