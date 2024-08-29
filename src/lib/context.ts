import { MetaData } from "@/types/context";
import { getEmbeddings } from "./embeddings";
import { pinecone } from "./pinecone";
import { convertToAscii } from "./string";

// We use fileKey for choosing the correct namespace in pineconedb i.e. correct file in consideration
export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  const index = await pinecone.Index("chatpdf");
  try {
    const namespace = convertToAscii(fileKey);
    const queryResult = await index.namespace(namespace).query({
      topK: 5,
      vector: embeddings,
      includeMetadata: true,
    });
    return queryResult.matches || [];
  } catch (error) {
    console.log("Error querying Embeddings!");
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

  const qualifyingDocs = matches.filter(
    (match) => match.score && match.score > 0.7
  );

  let docs = qualifyingDocs.map((match) => (match.metadata as MetaData).text);

  return docs.join("\n").substring(0, 3000);
}
