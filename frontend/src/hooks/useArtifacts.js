import { useQuery } from '@tanstack/react-query'
import { getArtifacts } from '../services/api'

export function useArtifacts(agentType) {
  return useQuery({
    queryKey: ['artifacts', agentType ?? 'all'],
    queryFn: () => getArtifacts(agentType),
  })
}
