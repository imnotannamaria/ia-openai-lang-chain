import { config } from 'dotenv'
import { createClient } from 'redis';
import { RedisVectorStore } from 'langchain/vectorstores/redis'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'

config()

export const redis = createClient({
  url: 'redis://0.0.0.0:32769'
})

const embeddings = new OpenAIEmbeddings({
  azureOpenAIApiKey: process.env.OPENAI_API_KEY , 
  azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION, 
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
  azureOpenAIApiDeploymentName:  process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME
});

export const redisVectorStore = new RedisVectorStore(
  embeddings,
  {
    indexName: 'main',
    redisClient: redis,
    keyPrefix: 'document:'
  }
)