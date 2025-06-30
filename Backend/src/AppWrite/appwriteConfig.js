import { Client, Storage } from "appwrite";
import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
});

const client = new Client();

client
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID);
    
const storage = new Storage(client);

export { storage };
