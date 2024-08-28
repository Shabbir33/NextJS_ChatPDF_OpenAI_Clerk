import {
  Pinecone,
  PineconeRecord,
  RecordMetadata,
} from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { PDFPage } from "@/types/PDFPage";
import md5 from "md5";
import { getEmbeddings } from "./embeddings";
import { Vector } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/data";
import { convertToAscii } from "./string";

export const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

export async function loadS3IntoPinecone(file_key: string) {
  // 1. obtain the pdf -> download and read the pdf
  console.log("Downloading S3 file into file system.");
  const file_name = await downloadFromS3(file_key);
  if (!file_name) {
    throw new Error("Could not Download file from S3!");
  }

  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  // 2. split and segment the pdf
  const documents = await Promise.all(
    pages.map((pages) => prepareDocument(pages))
  );

  // 3. vectorize and embed individual documents
  const vectors = (await Promise.all(
    documents.flat().map((doc) => embedDocument(doc))
  )) as PineconeRecord<RecordMetadata>[];

  // 4. upload to pinecone
  const pineconeIndex = pinecone.Index("chatpdf");

  console.log("inserting vectors into pinecone");
  const namespace = convertToAscii(file_key);
  pineconeIndex.namespace(namespace).upsert(vectors);

  return documents[0];
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as Vector;
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, " ");

  // Split the Docs
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);

  return docs;
}
