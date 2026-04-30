import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getChats, deleteChat } from '../services/api'

export function useChats() {
  return useQuery({
    queryKey: ['chats'],
    queryFn: getChats,
  })
}

export function useDeleteChat() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteChat,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chats'] }),
  })
}
