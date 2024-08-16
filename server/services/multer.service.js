import multer from "multer";
import fs from "fs";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const path = "./public/uploads/";
    fs.mkdirSync(path, { recursive: true });
    cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      req.user.id +
        "-" +
        Date.now() +
        "." +
        file.mimetype.split("/")[1],
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

export default upload;
