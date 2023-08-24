import { ChatOpenAI  } from 'langchain/chat_models/openai'
import { RetrievalQAChain } from 'langchain/chains'
import { PromptTemplate  } from 'langchain/prompts'
import { redis, redisVectorStore } from './redis-store'

const openAiChat = new ChatOpenAI({
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
  azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME,
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
  temperature: 0.4,
})

const prompt = new PromptTemplate({
  template: `
    Você responde perguntas sobre academia, treinos e grupos musculares.

    Você pode montar um treino baseado nas informações que o usuário disponibilizar.

    Use o conteúdo para ajudar o usuário em suas perguntas, tente ser simples e breve.

    Conteúdo: 
    {context}

    Pergunta: 
    {question}
  `.trim(),
  inputVariables: ['context', 'question']
})

const chain = RetrievalQAChain.fromLLM(openAiChat, redisVectorStore.asRetriever(1), {
  prompt,
  returnSourceDocuments: true,
  verbose: true,
})

async function main() {
  await redis.connect()

  const response = await chain.call({
    query: "Qual exercício eu devo fazer para melhorar o Deltoides anterior do meu onbro?"
  })

  console.log(response)

  await redis.disconnect()
}

main()