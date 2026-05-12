import { useMutation, useQueryClient } from '@tanstack/react-query'
import { runCompanyAnalyze, runQuestionAnalyze, runEssayWriter } from '../services/api'

// body에 chat_id를 포함해서 호출해야 함 (ChatScreen의 ensureChatId 결과를 전달)

export function useCompanyAnalyze() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ chat_id, ...body }) => runCompanyAnalyze({ chat_id, ...body }),
    onSuccess: (_, { chat_id }) => {
      qc.invalidateQueries({ queryKey: ['messages', chat_id] })
      qc.invalidateQueries({ queryKey: ['chats'] })
      qc.invalidateQueries({ queryKey: ['artifacts'] })
    },
  })
}

export function useQuestionAnalyze() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ chat_id, ...body }) => runQuestionAnalyze({ chat_id, ...body }),
    onSuccess: (_, { chat_id }) => {
      qc.invalidateQueries({ queryKey: ['messages', chat_id] })
      qc.invalidateQueries({ queryKey: ['chats'] })
      qc.invalidateQueries({ queryKey: ['artifacts'] })
    },
  })
}

export function useEssayWriter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ chat_id, ...body }) => runEssayWriter({ chat_id, ...body }),
    onSuccess: (_, { chat_id }) => {
      qc.invalidateQueries({ queryKey: ['messages', chat_id] })
      qc.invalidateQueries({ queryKey: ['chats'] })
      qc.invalidateQueries({ queryKey: ['artifacts'] })
    },
  })
}
