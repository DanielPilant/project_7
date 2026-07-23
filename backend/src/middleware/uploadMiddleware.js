import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 1000 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "audio/mpeg",
      "audio/wav",
      "audio/x-wav",
      "application/zip",
      "application/x-zip-compressed",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Upload only zip or audio file"), false);
    }
  },
});

export default upload;
