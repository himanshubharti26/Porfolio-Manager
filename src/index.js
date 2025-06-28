import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __fileName = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__fileName);
dotenv.config({
    path:path.resolve(__dirname, "./.env")
})
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import { app } from "./app.js";



( async() => {
    try{
        console.log("env var ======> ",process.env.MONGODB_URI, __dirname);
       const connection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
       app.on('error',(err)=>{
        console.error("Error in server")
       })

       app.listen(process.env.PORT, ()=>{
        console.log(` server running on port:${process.env.PORT}`);
       })
    }catch(err){
        console.error("ERROR:", err);
        throw err;
    }
})()