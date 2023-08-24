import { config } from 'dotenv'
import path from 'node:path'
import { createClient } from 'redis';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { TokenTextSplitter } from 'langchain/text_splitter'
import { RedisVectorStore } from 'langchain/vectorstores/redis'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'

config()

const loader = new DirectoryLoader(
  path.resolve(__dirname, '../tmp'),
  {
    '.txt': path => new TextLoader(path)
  }
)

async function load() {
  const docs = await loader.load()

  const splitter = new TokenTextSplitter({
    encodingName: 'cl100k_base',
    chunkSize: 600,
    chunkOverlap: 0
  })

  const spplitedDocuments = await splitter.splitDocuments(docs)

  const redis = createClient({
    url: process.env.REDIS_URL
  })

  await redis.connect()

  const embeddings = new OpenAIEmbeddings({
    azureOpenAIApiKey: process.env.OPENAI_API_KEY , 
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION, 
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
    azureOpenAIApiDeploymentName:  process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME
  });

  await RedisVectorStore.fromDocuments(
    spplitedDocuments, 
    embeddings,
    {
      indexName: 'main',
      redisClient: redis,
      keyPrefix: 'document:'
    }
  )

  await redis.disconnect()
}

load()