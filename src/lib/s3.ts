import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

export async function uploadToS3(file: File) {
  try {
    const client = new S3Client({
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY!,
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
      },
      region: "us-east-1",
    });

    const file_key =
      "uploads/" + Date.now().toString() + file.name.replace(" ", "-");

    // Create an upload object
    const upload = new Upload({
      client: client,
      params: {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
        Key: file_key,
        Body: file,
      },
      leavePartsOnError: false, // Whether to leave parts on error
    });

    upload.on("httpUploadProgress", (progress) => {
      console.log(
        `Progress: ${((progress.loaded! / progress.total!) * 100).toFixed(2)}%`
      );
    });

    upload.done().then((data) => {
      console.log("Upload Success", file_key);
    });

    return Promise.resolve({
      file_key,
      file_name: file.name,
    });
  } catch (error) {
    console.error(error);
  }
}

export function getS3Url(file_key: string) {
  const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/${file_key}`;

  return url;
}
