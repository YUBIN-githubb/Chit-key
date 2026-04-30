import { useQuery } from '@tanstack/react-query'
import { getChat, getArtifact } from '../services/api'

export function useMessages(chatId) {
  return useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      const chat = await getChat(chatId)
      const messages = chat.messages || []

      // artifact_id가 있는 메시지에 artifact 내용 병합
      const withArtifacts = await Promise.all(
        messages.map(async (msg) => {
          if (!msg.artifact_id) return msg
          try {
            const artifact = await getArtifact(msg.artifact_id)
            return { ...msg, artifact }
          } catch {
            return msg
          }
        })
      )

      return withArtifacts
    },
    enabled: !!chatId,
  })
}
