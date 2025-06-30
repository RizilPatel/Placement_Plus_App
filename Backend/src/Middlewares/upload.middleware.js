import fileUpload from "express-fileupload";
import fs from "fs";
import path from "path";

const tempDir = path.join(process.cwd(), "public", "temp");
if (!fs.existsSync(tempDir)) {
    console.log("✅ Creating temp directory at:", tempDir);
    fs.mkdirSync(tempDir, { recursive: true });
} else {
    console.log("📁 Temp directory already exists:", tempDir);
}

const uploadMiddleware = fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    useTempFiles: true,
    tempFileDir: tempDir,
    abortOnLimit: true,
    preserveExtension: true,
    createParentPath: true,
    debug: true
});

export { uploadMiddleware };
