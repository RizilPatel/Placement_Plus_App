import { storage } from "./appwriteConfig.js"
// import { APPWRITE_STUDY_MATERIAL_BUCKET_ID } from "@env"
//code for getFile
const getFileFromAppwrite = async (profilePicId) => {
    try {
        // return storage.getFileView(APPWRITE_STUDY_MATERIAL_BUCKET_ID, profilePicId);
        return storage.getFileView("67d9c8b00014a09ab052", profilePicId);

    } catch (error) {
        console.error("Appwrite Error:", error.message);
        return null;
    }
};

export { getFileFromAppwrite }