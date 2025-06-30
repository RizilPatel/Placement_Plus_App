import { ID } from "appwrite";
import { storage } from "../AppWrite/appwriteConfig.js";
import fs from "fs";
import dotenv from "dotenv";
import ApiError from "./ApiError.js";
import { InputFile } from "node-appwrite/file"

dotenv.config({
    path: "./.env",
});

const uploadResumeOnAppwrite = async (filePath, username, previousFileId = null) => {
    try {
        if (!fs.existsSync(filePath)) {
            throw new ApiError(404, "Resume does not exist");
        }
        console.log("Previous File ID:", previousFileId);


        if (previousFileId) {
            try {
                await storage.deleteFile(process.env.APPWRITE_BUCKET_ID, previousFileId);
                console.log("🗑️ Previous resume deleted:", previousFileId);
            } catch (deleteErr) {
                console.warn("⚠️ Failed to delete previous resume:", deleteErr.message);
            }
        }

        const response = await storage.createFile(
            process.env.APPWRITE_BUCKET_ID,
            ID.unique(),
            InputFile.fromPath(filePath, `${username} - resume.pdf`),
        );

        console.log("✅ Upload Success:", response);
        return response;
    } catch (error) {
        console.error("❌ Appwrite Upload Error:", error.message);
        return null;
    } finally {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

const uploadFileOnAppwrite = async (filePath, subjectName) => {
    try {
        if (!fs.existsSync(filePath)) {
            throw new ApiError(404, "Resume does not exist");
        }

        const response = await storage.createFile(
            process.env.APPWRITE_STUDY_MATERIAL_BUCKET_ID,
            ID.unique(),
            InputFile.fromPath(filePath, `${subjectName}.pdf`),
        );

        console.log("Upload Success:", response);
        return response;
    } catch (error) {
        console.error("Appwrite Upload Error:", error.message);
        return null;
    } finally {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

const uploadImageonAppwrite = async (filePath, originalName = "profilepic.png") => {
    try {
        if (!fs.existsSync(filePath)) {
            throw new ApiError(404, "Profile pic does not exist");
        }

        const response = await storage.createFile(
            process.env.APPWRITE_STUDY_MATERIAL_BUCKET_ID,
            ID.unique(),
            InputFile.fromPath(filePath, originalName),
        );

        console.log("Upload Success:", response);
        return response;
    } catch (error) {
        console.error("Appwrite Upload Error:", error.message);
        return null;
    } finally {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

const getResumeFromAppwrite = async (fileId) => {
    try {
        return storage.getFileView(process.env.APPWRITE_BUCKET_ID, fileId);
    } catch (error) {
        console.error("Appwrite Error:", error);
        return null;
    }
};

const getFileFromAppwrite = async (fileId) => {
    try {
        return storage.getFileView(process.env.APPWRITE_STUDY_MATERIAL_BUCKET_ID, fileId);
    } catch (error) {
        console.error("Appwrite Error:", error);
        return null;
    }
};

const downloadResume = async (fileId) => {
    try {
        return storage.getFileDownload(process.env.APPWRITE_BUCKET_ID, fileId)
    } catch (error) {
        console.error("Appwrite Error:", error);
        return null;
    }
}

export { uploadResumeOnAppwrite, getFileFromAppwrite, downloadResume, uploadFileOnAppwrite, getResumeFromAppwrite, uploadImageonAppwrite };
