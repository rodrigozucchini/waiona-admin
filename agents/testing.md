# Testing Strategy — Waiona Admin

Test what matters: Server Actions (business logic), Route Handlers (API proxy correctness), and critical Client Components (forms, destructive actions). Don't test Next.js itself.

---

## 1. Stack

```bash
npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
npm install --save-dev msw       # Mock Service Worker — mock fetch in tests
npm install --save-dev playwright # E2E — only for critical paths
```

`vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': resolve(__dirname, '.') },
  },
})
```

`tests/setup.ts`:
```typescript
import '@testing-library/jest-dom'
import { server } from './mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

---

## 2. What to Test (Priority Order)

| Layer | What | Why |
|-------|------|-----|
| Server Actions | Validation logic, error mapping, revalidation calls | Most business logic lives here |
| Route Handlers | Status codes, error propagation, auth header forwarding | API contract with Client Components |
| Utility functions | formatCurrency, formatDate, getCouponStatus, etc. | Pure functions, cheap to test |
| Client Components | Form submission, error display, confirm dialogs | User-facing correctness |
| E2E (Playwright) | Login flow, create product, update order status | Critical happy paths only |

**Don't test:** Next.js routing, Server Component rendering, shadcn/ui internals.

---

## 3. Testing Server Actions

Server Actions can't use `cookies()` in the test environment. Mock `lib/auth.ts` and `lib/api.ts`:

```typescript
// tests/actions/products.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createProduct } from '@/actions/products'

// Mock the API client
vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    constructor(public status: number, message: string) {
      super(message)
    }
  },
  isApiError: (err: unknown) => err instanceof Error && 'status' in err,
}))

vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

import { api } from '@/lib/api'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

describe('createProduct', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns error when SKU is missing', async () => {
    const formData = new FormData()
    formData.set('name', 'Test Product')
    // sku intentionally missing

    const result = await createProduct({ status: 'idle' }, formData)

    expect(result).toEqual({ status: 'error', message: 'SKU y nombre son requeridos' })
    expect(api.post).not.toHaveBeenCalled()
  })

  it('calls API and redirects on success', async () => {
    vi.mocked(api.post).mockResolvedValue({ id: '123' })

    const formData = new FormData()
    formData.set('sku', 'PROD-001')
    formData.set('name', 'Test Product')
    formData.set('categoryId', 'cat-1')
    formData.set('measurementUnit', 'unit')
    formData.set('measurementValue', '1')

    await createProduct({ status: 'idle' }, formData)

    expect(api.post).toHaveBeenCalledWith('/products', expect.objectContaining({
      sku: 'PROD-001',
      name: 'Test Product',
    }))
    expect(revalidateTag).toHaveBeenCalledWith('products')
    expect(redirect).toHaveBeenCalledWith('/catalog/products')
  })

  it('maps 409 to duplicate SKU error', async () => {
    const { ApiError } = await import('@/lib/api')
    vi.mocked(api.post).mockRejectedValue(new ApiError(409, 'Conflict'))

    const formData = new FormData()
    formData.set('sku', 'EXISTING-SKU')
    formData.set('name', 'Test')
    formData.set('categoryId', 'cat-1')
    formData.set('measurementUnit', 'unit')
    formData.set('measurementValue', '1')

    const result = await createProduct({ status: 'idle' }, formData)

    expect(result).toEqual({ status: 'error', message: 'El SKU ya existe' })
  })
})
```

---

## 4. Testing Route Handlers

```typescript
// tests/api/products.test.ts
import { describe, it, expect, vi } from 'vitest'
import { GET, POST } from '@/app/api/products/route'
import { NextRequest } from 'next/server'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'mock-token' }),
  }),
}))

import { api } from '@/lib/api'

describe('GET /api/products', () => {
  it('passes page and limit to the API', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 0 })

    const req = new NextRequest('http://localhost/api/products?page=2&limit=10')
    await GET(req)

    expect(api.get).toHaveBeenCalledWith('/products?page=2&limit=10')
  })

  it('returns 500 on unexpected errors', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('DB down'))

    const req = new NextRequest('http://localhost/api/products')
    const res = await GET(req)

    expect(res.status).toBe(500)
  })
})
```

---

## 5. Testing Utilities

```typescript
// tests/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatCurrency, formatEnum, getCouponStatus } from '@/lib/utils'

describe('formatCurrency', () => {
  it('formats ARS correctly', () => {
    expect(formatCurrency(1500, 'ARS')).toMatch(/1.500/)
  })
})

describe('getCouponStatus', () => {
  it('returns exhausted when usageCount >= maxUses', () => {
    const coupon = {
      validFrom: '2020-01-01',
      validTo: null,
      maxUses: 10,
      usageCount: 10,
    }
    expect(getCouponStatus(coupon as any)).toBe('exhausted')
  })

  it('returns expired when validTo is in the past', () => {
    const coupon = {
      validFrom: '2020-01-01',
      validTo: '2020-12-31',
      maxUses: null,
      usageCount: 0,
    }
    expect(getCouponStatus(coupon as any)).toBe('expired')
  })
})
```

---

## 6. Testing Client Components

```typescript
// tests/components/LoginForm.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/forms/LoginForm'

// Mock the server action
vi.mock('@/actions/auth', () => ({
  loginAction: vi.fn(),
}))

describe('LoginForm', () => {
  it('disables submit button while pending', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'admin@test.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'password')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows error message from action state', () => {
    // Test with pre-set error state
    render(<LoginForm initialState={{ status: 'error', message: 'Credenciales inválidas' }} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Credenciales inválidas')
  })
})
```

---

## 7. MSW — Mock Service Worker Setup

For tests that can't mock at the module level:

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('http://localhost:3000/api/v1/products', () => {
    return HttpResponse.json({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      hasNextPage: false,
    })
  }),
]

// tests/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

---

## 8. E2E — Playwright (Critical Paths Only)

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('admin can log in and see dashboard', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', process.env.TEST_ADMIN_EMAIL!)
  await page.fill('[name="password"]', process.env.TEST_ADMIN_PASSWORD!)
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})

test('unauthenticated user is redirected to login', async ({ page }) => {
  await page.goto('/catalog/products')
  await expect(page).toHaveURL(/\/login/)
})
```

`playwright.config.ts`:
```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
})
```

---

## 9. package.json Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## 10. Rules

- Test **behavior**, not **implementation** — test what the user sees or what the API receives.
- Server Action tests always mock `lib/api`, `next/cache`, and `next/navigation`.
- Never test Next.js internals (routing, `redirect`, `revalidatePath` behavior itself).
- E2E tests need a running waiona-core instance — run them in CI only.
- One test file per action file and per Route Handler file.
- Utility functions must have 100% coverage — they're pure and cheap.
