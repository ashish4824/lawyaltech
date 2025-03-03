import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { join } from 'path';
dotenv.config({ path: join('../../.env') });
async function uploadImage(image ,path) {
    cloudinary.config({
        cloud_name:"dnjcu5zlk",
        api_key:"888161698946875",
        api_secret:"m6SFN10dXA9ClG6COOKtnmVWqRI",
    });
    // console.log("Uploading Image", path)
    const uploadResult = await cloudinary.uploader
        .upload(
            `data:image/jpeg;base64,${image}`, {
            public_id: path,
        })
        .catch((error) => {
            console.log("Error Uploading Image");
        });
    return uploadResult.url
}

export default uploadImage;