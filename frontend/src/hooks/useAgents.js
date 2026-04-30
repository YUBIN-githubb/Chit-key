import { useMutation, useQueryClient } from '@tanstack/react-query'
import { runCompanyAnalyze, runQuestionAnalyze, runEssayWriter } from '../services/api'

export function useCompanyAnalyze(chatId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => runCompanyAnalyze({ chat_id: chatId, ...body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages', chatId] }),
  })
}

export function useQuestionAnalyze(chatId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => runQuestionAnalyze({ chat_id: chatId, ...body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages', chatId] }),
  })
}

export function useEssayWriter(chatId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => runEssayWriter({ chat_id: chatId, ...body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages', chatId] }),
  })
}
