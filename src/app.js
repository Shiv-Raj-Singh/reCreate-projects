import express from "express"
import multer from "multer"
const app = express()
import router from "./route/route.js"
import "./dbConnection.js"
// import dotenv from "dotenv"
// dotenv.config({silent : process.env})

import { globalerrorHandler } from "./middlewares/errorHandler.js"
const PORT = process.env.PORT || 3000


app.use(express.json())
app.use(multer().any())

app.use("/" , router ) 

app.use(globalerrorHandler) 

app.listen(PORT , ()=>{
    console.log("App Server is Running On The Port Number --"+ PORT)
})