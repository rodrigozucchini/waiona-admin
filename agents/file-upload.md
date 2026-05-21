# File Upload — Product & Combo Images

Images are uploaded to the API via `multipart/form-data`. The API handles Cloudinary internally and returns a URL. The admin panel never talks to Cloudinary directly.

---

## 1. API Endpoints

```
POST /product-images/upload        → Upload file → returns { imageUrl, publicId }
POST /product-images               → Create image record { productId, imageUrl, altText, position }
GET  /product-images/product/:id   → List images for a product
PATCH /product-images/:id          → Update altText, position
DELETE /product-images/:id         → Delete image

# Same pattern for combos:
POST /combo-images/upload
POST /combo-images
GET  /combo-images/combo/:id
PATCH /combo-images/:id
DELETE /combo-images/:id
```

Upload is a **two-step process**: first upload the file (returns URL), then create the record linking the URL to the product.

---

## 2. Route Handler — Multipart Proxy

The Route Handler must forward the FormData as-is (not JSON):

```typescript
// app/api/product-images/upload/route.ts
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  // Forward the FormData directly — don't parse it
  const formData = await request.formData()

  const res = await fetch(`${process.env.API_URL}/product-images/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Do NOT set Content-Type — let fetch set the multipart boundary
    },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json()
    return Response.json(err, { status: res.status })
  }

  return Response.json(await res.json())
}
```

---

## 3. Server Action — Two-Step Upload

```typescript
// actions/products.ts
'use server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function uploadProductImage(
  productId: string,
  _prev: unknown,
  formData: FormData
) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  // Step 1: Upload file to get Cloudinary URL
  const uploadRes = await fetch(`${process.env.API_URL}/product-images/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData, // FormData with 'file' field
  })

  if (!uploadRes.ok) {
    return { error: 'Error al subir la imagen' }
  }

  const { imageUrl } = await uploadRes.json()

  // Step 2: Create the image record
  const createRes = await fetch(`${process.env.API_URL}/product-images`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      productId,
      imageUrl,
      altText: formData.get('altText') ?? '',
      position: Number(formData.get('position') ?? 0),
    }),
  })

  if (!createRes.ok) {
    return { error: 'Error al guardar la imagen' }
  }

  revalidatePath(`/catalog/products/${productId}/images`)
  return null
}
```

---

## 4. ImageUploader Component

```typescript
// components/shared/ImageUploader.tsx
'use client'
import { useActionState, useRef } from 'react'
import Image from 'next/image'

interface Props {
  action: (prev: unknown, formData: FormData) => Promise<unknown>
  existingImages?: { id: string; imageUrl: string; position: number; altText: string }[]
  onDelete?: (id: string) => void
}

export function ImageUploader({ action, existingImages = [] }: Props) {
  const [state, formAction, isPending] = useActionState(action, null)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-6">
      {/* Existing images */}
      <div className="grid grid-cols-4 gap-4">
        {existingImages.map((img) => (
          <div key={img.id} className="group relative">
            <Image
              src={img.imageUrl}
              alt={img.altText}
              width={200}
              height={200}
              className="rounded-lg object-cover"
            />
          </div>
        ))}
      </div>

      {/* Upload form */}
      <form action={formAction} className="space-y-3">
        <div
          className="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center hover:border-primary"
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            name="file"
            type="file"
            accept="image/*"
            className="hidden"
            required
          />
          <p className="text-muted-foreground">
            {isPending ? 'Subiendo...' : 'Click para seleccionar imagen'}
          </p>
        </div>

        <input name="altText" placeholder="Texto alternativo" />

        {(state as { error?: string })?.error && (
          <p className="text-destructive">{(state as { error: string }).error}</p>
        )}

        <button type="submit" disabled={isPending}>
          Subir imagen
        </button>
      </form>
    </div>
  )
}
```

---

## 5. next.config.ts — Cloudinary Domain

Add the Cloudinary domain to allow `next/image` to optimize remote images:

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
```

Always use `<Image>` from `next/image`, never `<img>`, for Cloudinary URLs.

---

## 6. Image Position Management

Images have a `position` field for ordering. To reorder:

```typescript
// actions/products.ts
export async function updateImagePosition(imageId: string, position: number) {
  try {
    await api.patch(`/product-images/${imageId}`, { position })
  } catch {
    return { error: 'Error al actualizar posición' }
  }
  revalidatePath('/catalog/products')
  return null
}
```

Display images sorted by `position` ascending. Position 0 is the primary/cover image.

---

## 7. Rules

- Never send files directly to Cloudinary from the browser — always go through the API.
- When proxying FormData, do NOT set `Content-Type` manually — let the runtime set the multipart boundary.
- Always use the two-step process: upload file first, then create record.
- Use `next/image` for all Cloudinary image rendering.
- The `res.cloudinary.com` domain must be in `next.config.ts` `remotePatterns`.
- Show upload progress state via `isPending` from `useActionState`.
