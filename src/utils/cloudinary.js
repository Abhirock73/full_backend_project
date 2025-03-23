import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
    // Configuration
cloudinary.config({ 
    cloud_name: "dhbxy5tz3", 
    api_key: "174916359828756", 
    api_secret: "CXy7yom9dnttNhLsFnL73J2CxeQ",
});

const uploadOnCloudinary = async(localFilePath)=>{
     try {
         if(!localFilePath) return null;
         const response = cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
         })
         console.log("file uploaded", (await response).url);
         fs.unlinkSync(localFilePath)
         return response;
     } catch (error) {
        console.log(" failed to file upload",error);
        fs.unlinkSync(localFilePath) // remove the file from temporary storage
        return null;
     }
}

export default uploadOnCloudinary;