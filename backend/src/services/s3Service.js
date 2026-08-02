import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
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

// Delete an object given its public URL (the key is the URL path after the host).
export const deleteFileFromS3 = async (fileUrl) => {
  if (!fileUrl) return;

  const key = decodeURIComponent(new URL(fileUrl).pathname.slice(1));

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    }),
  );
};
