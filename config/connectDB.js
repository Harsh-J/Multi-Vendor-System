import mongoose from "mongoose";
import dotenv from "dotenv";    
dotenv.config()
if(!process.env.MONGO_URI){
    throw new Error(
        "please provide MONGODB_URI in the .env file"
    )
}
async function connectDB() {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("DB connnected!!")
    }
    catch(error){
        console.log("Mongodb connection error!!",error)
        process.exit(1)
    }
}
export default connectDB