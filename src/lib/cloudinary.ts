import { v2 as cloudinary } from "cloudinary"

const isConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== "your-cloud-name" &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export async function uploadImageToCloudinary(file: File, folder: string): Promise<string> {
  if (!isConfigured) {
    console.log(`[SIMULATED CLOUDINARY UPLOAD] Uploading file "${file.name}" to folder "${folder}"`)
    
    // Provide gorgeous high-quality Unsplash fallbacks matching the content folder
    if (folder === "banners") {
      return "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80" // Premium event hall banner
    }
    return "https://images.unsplash.com/photo-1496469888073-80de7e9b97cb?w=1000&auto=format&fit=crop&q=80" // Default certificate bg or landscape mockup
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload stream error:", error)
          reject(new Error(error.message))
        } else {
          resolve(result?.secure_url || "")
        }
      }
    ).end(buffer)
  })
}
export { cloudinary }
