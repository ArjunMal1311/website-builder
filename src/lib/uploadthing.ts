import { OurFileRouter } from '@/api/uploadthing/core'
import { generateComponents } from '@uploadthing/react'
import { generateReactHelpers } from '@uploadthing/react/hooks'


export const { UploadButton, UploadDropzone, Uploader } =
  generateComponents<OurFileRouter>()

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>()
