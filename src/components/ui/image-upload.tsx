'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from './button'
import { X, Upload, Image as ImageIcon } from 'lucide-react'

interface ImageFile {
  id: string
  file: File
  preview: string
  uploading?: boolean
  uploaded?: boolean
  url?: string
}

interface ImageUploadProps {
  maxFiles?: number
  maxSize?: number // in MB
  onImagesChange: (images: ImageFile[]) => void
  existingImages?: { id: string; url: string; altText?: string }[]
}

function ImageUpload({ 
  maxFiles = 10, 
  maxSize = 5, 
  onImagesChange,
  existingImages = []
}: ImageUploadProps) {
  const [images, setImages] = useState<ImageFile[]>([])
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newImages: ImageFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      uploading: true
    }))

    setImages(prev => [...prev, ...newImages])
    setUploading(true)

    // Upload each file
    const uploadedImages = await Promise.all(
      newImages.map(async (imageFile) => {
        try {
          const formData = new FormData()
          formData.append('file', imageFile.file)

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })

          if (response.ok) {
            const data = await response.json()
            return {
              ...imageFile,
              uploading: false,
              uploaded: true,
              url: data.url
            }
          } else {
            return {
              ...imageFile,
              uploading: false,
              uploaded: false
            }
          }
        } catch (error) {
          console.error('Upload error:', error)
          return {
            ...imageFile,
            uploading: false,
            uploaded: false
          }
        }
      })
    )

    setImages(prev => {
      const updated = prev.map(img => {
        const uploaded = uploadedImages.find(up => up.id === img.id)
        return uploaded || img
      })
      onImagesChange(updated)
      return updated
    })

    setUploading(false)
  }, [onImagesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: maxFiles - images.length - existingImages.length,
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    disabled: uploading || (images.length + existingImages.length >= maxFiles)
  })

  const removeImage = (id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id)
      onImagesChange(updated)
      return updated
    })
  }

  const reorderImages = (dragIndex: number, hoverIndex: number) => {
    setImages(prev => {
      const updated = [...prev]
      const draggedItem = updated[dragIndex]
      updated.splice(dragIndex, 1)
      updated.splice(hoverIndex, 0, draggedItem)
      onImagesChange(updated)
      return updated
    })
  }

  const totalImages = images.length + existingImages.length

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {totalImages < maxFiles && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-blue-600">Drop the images here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Drag & drop images here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                {maxFiles - totalImages} more images allowed (max {maxSize}MB each)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Image Previews */}
      {(existingImages.length > 0 || images.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Existing Images */}
          {existingImages.map((img, index) => (
            <div key={img.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={img.url}
                  alt={img.altText || `Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Main
                </div>
              )}
            </div>
          ))}

          {/* New Images */}
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {image.uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
                {image.uploaded === false && (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-50 flex items-center justify-center">
                    <X className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
              
              {/* Image Controls */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeImage(image.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Main Image Indicator */}
              {existingImages.length === 0 && index === 0 && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Main
                </div>
              )}

              {/* Upload Status */}
              {image.uploaded && (
                <div className="absolute bottom-2 right-2 bg-green-600 text-white rounded-full p-1">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      {totalImages === 0 && (
        <div className="text-center text-gray-500 py-8">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>No images uploaded yet</p>
          <p className="text-sm">Add up to {maxFiles} images to showcase your product</p>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="text-center text-blue-600">
          <p className="text-sm">Uploading images...</p>
        </div>
      )}
    </div>
  )
}

export default ImageUpload