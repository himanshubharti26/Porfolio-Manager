import { v2 as cloudinary} from "cloudinary";
import fs from "fs";

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __fileName = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__fileName);
dotenv.config({
    path:path.resolve(__dirname, "../.env")
})
// import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});
console.log("Cloudinary Configuration:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const uploadOnCloudinary = async(localFilePath)=>{
console.log("cloudinay config:",)

    try{
        if(!localFilePath) return null;
        //upload the file on clodinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",

        })
        //file has been uploaded successfully
        console.log("File has been uploaded successfully", response.url);
        fs.unlinkSync(localFilePath);
        return response;
        
    }catch(err){
        console.log("error in cloudinay:", err);
        fs.unlinkSync(localFilePath) // remove the temporarily saved file  as the upload operation failed
        return null;


    }
}

const deleteImage = async(imageUrl)=>{
    if(!imageUrl){
        return null;
    }
    const lastSegment = imageUrl.split('/').pop();
    const public_id = lastSegment.split('.')[0];
    console.log("public url ===>", public_id);
    const deletedImage = await cloudinary.uploader.destroy(public_id);
    return deletedImage;
}

export { uploadOnCloudinary, deleteImage };


// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });