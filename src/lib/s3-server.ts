import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs/promises";
import { Readable } from "stream";

export async function downloadFromS3(file_key: string): Promise<string> {
  try {
    console.log("File Key: ", file_key);
    const client = new S3Client({
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY!,
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
      },
      region: "us-east-1",
    });

    const command = new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
    });

    const file_name = `/tmp/pdf-${Date.now()}.pdf`;
    console.log(file_name);

    const response = await client.send(command);
    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      stream.on("data", (chunk) => {
        chunks.push(chunk);
      });

      stream.on("end", async () => {
        try {
          const buffer = Buffer.concat(chunks);
          await fs.writeFile(file_name, buffer);
          console.log(`File downloaded and saved to ${file_name}`);
          resolve(file_name);
        } catch (err) {
          reject(err);
        }
      });

      stream.on("error", (err) => {
        console.error("Error downloading the file", err);
        reject(err);
      });
    });
  } catch (error) {
    console.error("Failed to download file from S3", error);
    throw error;
  }
}
