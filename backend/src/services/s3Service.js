import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/s3.js";

export const uploadFileToS3 = async (file, folderName = "uploads") => {
  const uniqueFileName = `${folderName}/${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: uniqueFileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;

  return fileUrl;
};
