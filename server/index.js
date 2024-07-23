
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();
import connectDB from './config/db.js'
const PORT = process.env.PORT || 8000;



connectDB()
  .then(() => {
    app.on('error',(error)=>{
        console.log(`Error: ${error}`);
    })
    app.listen(PORT, async() => {
        console.log(process.env.NODE_ENV);
        console.log(`app is listening on port ${PORT}`);
      });
  })
  .catch((error) => {
    console.log(`Connection Failed: ${error.message}`);
  });