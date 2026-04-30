import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useChats, useDeleteChat } from '../../hooks/useChats'
import { useArtifacts } from '../../hooks/useArtifacts'
import { getArtifact } from '../../services/api'
import { colors } from '../../styles/colors'

// 간단한 마크다운 → HTML 변환 (외부 라이브러리 없이)
function renderMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // 헤더
    .replace(/^### (.+)$/gm, '<h3 style="font-size:14px;font-weight:700;margin:12px 0 4px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:15px;font-weight:800;margin:14px 0 4px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:16px;font-weight:800;margin:16px 0 6px">$1</h1>')
    // 볼드 + 이탤릭
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 인라인 코드
    .replace(/`(.+?)`/g, '<code style="background:rgba(0,0,0,0.06);padding:1px 5px;border-radius:4px;font-size:12px">$1</code>')
    // 리스트
    .replace(/^- (.+)$/gm, '<li style="margin:2px 0;padding-left:4px">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul style="margin:6px 0;padding-left:18px">$&</ul>')
    // 줄바꿈
    .replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')
}

const AGENT_LABELS = {
  'company-analyze':  { label: '기업 분석',  color: colors.PRIMARY },
  'question-analyze': { label: '문항 분석',  color: '#7C3AED' },
  'essay-writer':     { label: '자소서 초안', color: colors.SUCCESS },
}

export default function HistoryScreen({ onOpenChat }) {
  const [subTab, setSubTab] = useState('chats')
  const [artifactType, setArtifactType] = useState('all')
  const [expandedArtifact, setExpandedArtifact] = useState(null)
  const [artifactContents, setArtifactContents] = useState({}) // id → content 캐시
  const [loadingContent, setLoadingContent] = useState(null)
  const [copied, setCopied] = useState(null)

  const { data: chats = [], isLoading: chatsLoading } = useChats()
  const { data: artifacts = [], isLoading: artifactsLoading } = useArtifacts()
  const deleteChat = useDeleteChat()
  const qc = useQueryClient()

  const artifactTypes = ['all', ...new Set(artifacts.map(a => a.agent_type))]
  const filteredArtifacts = artifactType === 'all'
    ? artifacts
    : artifacts.filter(a => a.agent_type === artifactType)

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation()
    if (!confirm('이 채팅을 삭제할까요?')) return
    try {
      await deleteChat.mutateAsync(chatId)
    } catch {
      alert('삭제 중 오류가 생겼어요.')
    }
  }

  const handleCopy = (id, text, e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleExpand = async (artifactId) => {
    if (expandedArtifact === artifactId) {
      setExpandedArtifact(null)
      return
    }
    setExpandedArtifact(artifactId)
    if (artifactContents[artifactId]) return // 이미 캐시됨
    setLoadingContent(artifactId)
    try {
      const full = await getArtifact(artifactId)
      setArtifactContents(prev => ({ ...prev, [artifactId]: full.content?.raw || '' }))
    } catch {
      setArtifactContents(prev => ({ ...prev, [artifactId]: '내용을 불러올 수 없어요.' }))
    } finally {
      setLoadingContent(null)
    }
  }

  const formatDate = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '28px 28px 0' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: colors.TEXT_PRIMARY, letterSpacing: '-0.5px', marginBottom: 4 }}>이력</h2>
        <p style={{ fontSize: 13, color: colors.TEXT_SECONDARY }}>채팅 기록과 AI 산출물을 확인해요</p>
      </div>

      {/* 서브 탭 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[{ id: 'chats', label: '채팅 이력' }, { id: 'artifacts', label: '산출물' }].map(({ id, label }) => (
          <button key={id} onClick={() => setSubTab(id)} style={{
            padding: '8px 18px', borderRadius: 99, fontSize: 13, fontWeight: 600,
            border: `1.5px solid ${subTab === id ? colors.PRIMARY : colors.BORDER}`,
            background: subTab === id ? colors.PRIMARY_LIGHT : 'rgba(255,255,255,0.6)',
            color: subTab === id ? colors.PRIMARY : colors.TEXT_SECONDARY,
            cursor: 'pointer', transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 28 }}>

        {/* ── 채팅 이력 ── */}
        {subTab === 'chats' && (
          chatsLoading ? (
            <Loading />
          ) : chats.length === 0 ? (
            <Empty text="아직 채팅 이력이 없어요" />
          ) : (
            chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => onOpenChat?.(chat.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 18px', borderRadius: 14, marginBottom: 10,
                  background: colors.SURFACE_GLASS,
                  backdropFilter: colors.BLUR_SM,
                  WebkitBackdropFilter: colors.BLUR_SM,
                  border: `1px solid rgba(255,255,255,0.7)`,
                  cursor: onOpenChat ? 'pointer' : 'default',
                  transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 16px rgba(27,100,218,0.10)`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ overflow: 'hidden' }}>
                  <div style={{
                    fontSize: 14, fontWeight: 700, color: colors.TEXT_PRIMARY,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4,
                  }}>{chat.title || '제목 없음'}</div>
                  <div style={{ fontSize: 12, color: colors.TEXT_SECONDARY }}>{formatDate(chat.created_at)}</div>
                </div>
                <button
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  style={{
                    flexShrink: 0, marginLeft: 12,
                    padding: '6px 12px', borderRadius: 8,
                    border: `1px solid ${colors.BORDER}`,
                    background: 'rgba(255,255,255,0.5)',
                    fontSize: 12, fontWeight: 600,
                    color: colors.ERROR, cursor: 'pointer',
                  }}
                >삭제</button>
              </div>
            ))
          )
        )}

        {/* ── 산출물 ── */}
        {subTab === 'artifacts' && (
          artifactsLoading ? (
            <Loading />
          ) : (
            <>
              {/* 타입 필터 */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                {artifactTypes.map(t => {
                  const meta = t === 'all'
                    ? { label: '전체', color: colors.TEXT_SECONDARY }
                    : AGENT_LABELS[t] || { label: t, color: colors.TEXT_SECONDARY }
                  const active = artifactType === t
                  return (
                    <button key={t} onClick={() => setArtifactType(t)} style={{
                      padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                      border: `1.5px solid ${active ? (meta.color) : colors.BORDER}`,
                      background: active ? meta.color + '15' : 'rgba(255,255,255,0.6)',
                      color: active ? meta.color : colors.TEXT_SECONDARY,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>{meta.label}</button>
                  )
                })}
              </div>

              {filteredArtifacts.length === 0 ? (
                <Empty text="산출물이 없어요" />
              ) : (
                filteredArtifacts.map(a => {
                  const meta = AGENT_LABELS[a.agent_type] || { label: a.agent_type, color: colors.TEXT_SECONDARY }
                  const isOpen = expandedArtifact === a.id
                  const content = artifactContents[a.id] || ''
                  const isLoadingThis = loadingContent === a.id
                  return (
                    <div
                      key={a.id}
                      style={{
                        borderRadius: 14, marginBottom: 10, overflow: 'hidden',
                        background: colors.SURFACE_GLASS,
                        backdropFilter: colors.BLUR_SM,
                        WebkitBackdropFilter: colors.BLUR_SM,
                        border: `1px solid ${meta.color}25`,
                      }}
                    >
                      {/* 헤더 행 */}
                      <div
                        onClick={() => handleExpand(a.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '14px 16px', cursor: 'pointer',
                          background: meta.color + '08',
                          borderBottom: isOpen ? `1px solid ${meta.color}20` : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                            background: meta.color + '15', color: meta.color,
                          }}>{meta.label}</span>
                          <span style={{
                            fontSize: 13, fontWeight: 600, color: colors.TEXT_PRIMARY,
                            maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>{a.title}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, color: colors.TEXT_SECONDARY }}>{formatDate(a.created_at)}</span>
                          <span style={{ fontSize: 12, color: colors.TEXT_SECONDARY }}>{isOpen ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {/* 펼쳐진 내용 */}
                      {isOpen && (
                        <div style={{ padding: '14px 16px' }}>
                          {isLoadingThis ? (
                            <p style={{ fontSize: 13, color: colors.TEXT_SECONDARY }}>불러오는 중이에요...</p>
                          ) : (
                            <>
                              <div
                                style={{
                                  fontSize: 13, color: colors.TEXT_PRIMARY, lineHeight: 1.7,
                                  maxHeight: 320, overflowY: 'auto', marginBottom: 10,
                                }}
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                              />
                              <button
                                onClick={(e) => handleCopy(a.id, content, e)}
                                style={{
                                  padding: '6px 14px', borderRadius: 8,
                                  border: `1px solid ${colors.BORDER}`,
                                  background: 'rgba(255,255,255,0.5)',
                                  fontSize: 12, fontWeight: 600,
                                  color: copied === a.id ? colors.SUCCESS : colors.TEXT_SECONDARY,
                                  cursor: 'pointer',
                                }}
                              >{copied === a.id ? '복사됐어요!' : '복사'}</button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </>
          )
        )}
      </div>
    </div>
  )
}

function Loading() {
  return <p style={{ fontSize: 13, color: colors.TEXT_SECONDARY, padding: '24px 0' }}>불러오는 중이에요...</p>
}

function Empty({ text }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🗂️</div>
      <p style={{ fontSize: 14, color: colors.TEXT_SECONDARY }}>{text}</p>
    </div>
  )
}
