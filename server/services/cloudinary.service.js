import cloudinary from "cloudinary";
import fs from "fs";
import path from "path";


cloudinary.v2.config(process.env.CLOUDINARY_URL);

const uploadImageToCloudinary = async (imageFileName) => {
  const imagePath = path.join(process.cwd(), "public", "uploads", imageFileName);

  // Ensure the file exists
  if (!fs.existsSync(imagePath)) {
    throw new Error("File not found");
  }

  try {
    // Upload the image to Cloudinary
    const result = await cloudinary.v2.uploader.upload(imagePath, {
      folder: "assets", // Optional: specify a folder in Cloudinary
    });

    // Remove the file from the server after successful upload
    fs.unlinkSync(imagePath);

    return result;
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};


export default uploadImageToCloudinary;
