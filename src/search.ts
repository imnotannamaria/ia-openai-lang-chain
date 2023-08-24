import { redis, redisVectorStore } from "./redis-store"

async function search() {
  await redis.connect()

  const response = await redisVectorStore.similaritySearchWithScore(
    'Quais os grupos musculares?'
  )

  console.log(response)

  await redis.disconnect()
}

search()