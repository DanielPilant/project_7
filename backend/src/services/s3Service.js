import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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

// Build a temporary signed link for a private object, given its stored URL.
// The link carries its own signature, so the browser can fetch the file without
// credentials — and it stops working once it expires.
export const getSignedDownloadUrl = async (fileUrl, downloadName) => {
  const key = decodeURIComponent(new URL(fileUrl).pathname.slice(1));
  const safeName = String(downloadName).replace(/[^a-zA-Z0-9._-]+/g, "_");

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    // Makes the browser save the file under a readable name instead of the S3 key.
    ResponseContentDisposition: `attachment; filename="${safeName}"`,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 60 });
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
