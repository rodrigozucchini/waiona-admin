export interface ProductImageResponseDto {
  id: number
  productId: number
  url: string
  position: number
  createdAt: string
  updatedAt: string
}

export interface ComboImageResponseDto {
  id: number
  comboId: number
  url: string
  position: number
  createdAt: string
  updatedAt: string
}

export interface CreateProductImageDto {
  productId: number
  url: string
  position: number
}

export interface CreateComboImageDto {
  comboId: number
  url: string
  position: number
}

export interface UpdateImageDto {
  position?: number
}

// Campos del multipart/form-data para POST /product-images/upload
export interface UploadProductImageFields {
  file: File
  productId: number
  position: number
}

// Campos del multipart/form-data para POST /combo-images/upload
export interface UploadComboImageFields {
  file: File
  comboId: number
  position: number
}
