import { Client, Storage } from "appwrite";
// import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from "@env"

const client = new Client();

// client
//     .setEndpoint(APPWRITE_ENDPOINT)
//     .setProject(APPWRITE_PROJECT_ID);
client
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("67d073f0000aec55ce72");

const storage = new Storage(client);

export { storage };