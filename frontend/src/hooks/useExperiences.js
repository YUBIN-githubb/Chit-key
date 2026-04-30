import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getExperiences, createExperience, updateExperience, deleteExperience } from '../services/api'

export function useExperiences() {
  return useQuery({
    queryKey: ['experiences'],
    queryFn: () => getExperiences(),
  })
}

export function useCreateExperience() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createExperience,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['experiences'] }),
  })
}

export function useUpdateExperience() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }) => updateExperience(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['experiences'] }),
  })
}

export function useDeleteExperience() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['experiences'] }),
  })
}
