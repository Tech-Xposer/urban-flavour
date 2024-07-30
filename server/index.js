import "dotenv/config";
import app from "./app.js";
import ApiResponse from "./handlers/response.handler.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 8000;

app.get("/", async (req, res) => {
  return ApiResponse.success(
    res,
    200,
    "Hello Welcome to Urban Falvour Backend",
  );
});

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log(`Error: ${error}`);
    });
    app.listen(PORT, async () => {
      console.log(process.env.NODE_ENV);
      console.log(`app is listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(`Connection Failed: ${error.message}`);
  });
