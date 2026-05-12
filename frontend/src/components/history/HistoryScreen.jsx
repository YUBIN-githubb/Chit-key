import { useState, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useChats, useDeleteChat, useUpdateChatTitle } from '../../hooks/useChats'
import { useArtifacts } from '../../hooks/useArtifacts'
import { getArtifact } from '../../services/api'
import { colors } from '../../styles/colors'
import { renderMarkdown } from '../../utils/markdown'

const AGENT_LABELS = {
  'company-analyze':  { label: '기업 분석',  color: colors.PRIMARY },
  'question-analyze': { label: '문항 분석',  color: '#7C3AED' },
  'essay-writer':     { label: '자소서 초안', color: colors.SUCCESS },
}

export default function HistoryScreen({ onOpenChat }) {
  const [subTab, setSubTab] = useState('chats')

  // 채팅 이력 상태
  const [editingChatId, setEditingChatId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')
  const titleInputRef = useRef(null)

  // 산출물 상태
  const [artifactType, setArtifactType] = useState('all')
  const [selectedArtifactId, setSelectedArtifactId] = useState(null)
  const [artifactContents, setArtifactContents] = useState({})
  const [loadingContent, setLoadingContent] = useState(null)
  const [copied, setCopied] = useState(null)

  const { data: chats = [], isLoading: chatsLoading } = useChats()
  const { data: artifacts = [], isLoading: artifactsLoading } = useArtifacts()
  const deleteChat = useDeleteChat()
  const updateChatTitle = useUpdateChatTitle()
  const qc = useQueryClient()

  const artifactTypes = ['all', ...new Set(artifacts.map(a => a.agent_type))]
  const filteredArtifacts = artifactType === 'all'
    ? artifacts
    : artifacts.filter(a => a.agent_type === artifactType)

  const selectedArtifact = filteredArtifacts.find(a => a.id === selectedArtifactId) || null

  // ── 채팅 이력 핸들러 ────────────────────────────

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation()
    if (!confirm('이 채팅을 삭제할까요?')) return
    try { await deleteChat.mutateAsync(chatId) }
    catch { alert('삭제 중 오류가 생겼어요.') }
  }

  const handleTitleDoubleClick = (chat, e) => {
    e.stopPropagation()
    setEditingChatId(chat.id)
    setEditingTitle(chat.title || '')
    setTimeout(() => titleInputRef.current?.select(), 0)
  }

  const handleTitleSave = async (chatId) => {
    const trimmed = editingTitle.trim()
    if (!trimmed) { setEditingChatId(null); return }
    try { await updateChatTitle.mutateAsync({ chatId, title: trimmed }) } catch {}
    setEditingChatId(null)
  }

  const handleTitleKeyDown = (e, chatId) => {
    if (e.key === 'Enter') handleTitleSave(chatId)
    if (e.key === 'Escape') setEditingChatId(null)
  }

  // ── 산출물 핸들러 ────────────────────────────────

  const handleSelect = async (artifactId) => {
    setSelectedArtifactId(artifactId)
    if (artifactContents[artifactId]) return
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

  const handleFilterChange = (type) => {
    setArtifactType(type)
    setSelectedArtifactId(null)
  }

  const handleCopy = () => {
    if (!selectedArtifactId) return
    const content = artifactContents[selectedArtifactId] || ''
    navigator.clipboard.writeText(content)
    setCopied(selectedArtifactId)
    setTimeout(() => setCopied(null), 2000)
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

      {/* ── 채팅 이력 탭 ── */}
      {subTab === 'chats' && (
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 28 }}>
          {chatsLoading ? (
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
                <div style={{ overflow: 'hidden', flex: 1, marginRight: 8 }}>
                  {editingChatId === chat.id ? (
                    <input
                      ref={titleInputRef}
                      value={editingTitle}
                      onChange={e => setEditingTitle(e.target.value)}
                      onBlur={() => handleTitleSave(chat.id)}
                      onKeyDown={e => handleTitleKeyDown(e, chat.id)}
                      onClick={e => e.stopPropagation()}
                      style={{
                        width: '100%', fontSize: 14, fontWeight: 700,
                        color: colors.TEXT_PRIMARY, border: 'none', borderBottom: `2px solid ${colors.PRIMARY}`,
                        outline: 'none', background: 'transparent', padding: '0 0 2px', marginBottom: 4,
                      }}
                    />
                  ) : (
                    <div
                      onDoubleClick={e => handleTitleDoubleClick(chat, e)}
                      title="더블클릭해서 이름 변경"
                      style={{
                        fontSize: 14, fontWeight: 700, color: colors.TEXT_PRIMARY,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        marginBottom: 4, cursor: 'text',
                      }}
                    >{chat.title || '제목 없음'}</div>
                  )}
                  <div style={{ fontSize: 12, color: colors.TEXT_SECONDARY }}>{formatDate(chat.created_at)}</div>
                </div>
                <button
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  style={{
                    flexShrink: 0, marginLeft: 12, padding: '6px 12px', borderRadius: 8,
                    border: `1px solid ${colors.BORDER}`, background: 'rgba(255,255,255,0.5)',
                    fontSize: 12, fontWeight: 600, color: colors.ERROR, cursor: 'pointer',
                  }}
                >삭제</button>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── 산출물 탭 (좌우 분할) ── */}
      {subTab === 'artifacts' && (
        artifactsLoading ? (
          <div style={{ flex: 1 }}><Loading /></div>
        ) : (
          <div style={{ flex: 1, display: 'flex', minHeight: 0, gap: 0 }}>

            {/* 왼쪽: 목록 */}
            <div style={{
              width: 256, flexShrink: 0, display: 'flex', flexDirection: 'column',
              borderRight: `1px solid rgba(0,0,0,0.07)`, paddingRight: 16, overflowY: 'auto', paddingBottom: 28,
            }}>
              {/* 타입 필터 */}
              <div style={{ display: 'flex', gap: 5, marginBottom: 14, flexWrap: 'wrap' }}>
                {artifactTypes.map(t => {
                  const meta = t === 'all'
                    ? { label: '전체', color: colors.TEXT_SECONDARY }
                    : AGENT_LABELS[t] || { label: t, color: colors.TEXT_SECONDARY }
                  const active = artifactType === t
                  return (
                    <button key={t} onClick={() => handleFilterChange(t)} style={{
                      padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                      border: `1.5px solid ${active ? meta.color : colors.BORDER}`,
                      background: active ? meta.color + '15' : 'rgba(255,255,255,0.6)',
                      color: active ? meta.color : colors.TEXT_SECONDARY,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>{meta.label}</button>
                  )
                })}
              </div>

              {/* 산출물 목록 */}
              {filteredArtifacts.length === 0 ? (
                <Empty text="산출물이 없어요" />
              ) : (
                filteredArtifacts.map(a => {
                  const meta = AGENT_LABELS[a.agent_type] || { label: a.agent_type, color: colors.TEXT_SECONDARY }
                  const isSelected = selectedArtifactId === a.id
                  return (
                    <div
                      key={a.id}
                      onClick={() => handleSelect(a.id)}
                      style={{
                        padding: '12px 14px', borderRadius: 12, marginBottom: 6,
                        cursor: 'pointer', transition: 'all 0.15s',
                        background: isSelected ? meta.color + '12' : 'rgba(255,255,255,0.5)',
                        border: `1.5px solid ${isSelected ? meta.color + '50' : 'transparent'}`,
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.8)' }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.5)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                          background: meta.color + '18', color: meta.color, flexShrink: 0,
                        }}>{meta.label}</span>
                      </div>
                      <div style={{
                        fontSize: 13, fontWeight: 600, color: colors.TEXT_PRIMARY,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        marginBottom: 3,
                      }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: colors.TEXT_SECONDARY }}>{formatDate(a.created_at)}</div>
                    </div>
                  )
                })
              )}
            </div>

            {/* 오른쪽: 상세 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 28px 20px', background: colors.BG }}>
              {!selectedArtifact ? (
                <div style={{
                  height: '100%', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', color: colors.TEXT_SECONDARY,
                }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>←</div>
                  <p style={{ fontSize: 14 }}>왼쪽 목록에서 산출물을 선택해요</p>
                </div>
              ) : (
                <div style={{
                  background: colors.SURFACE, borderRadius: 18,
                  border: `1px solid ${colors.BORDER}`,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  padding: '24px 28px',
                }}>
                  {/* 상세 헤더 */}
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                    marginBottom: 20, paddingBottom: 16,
                    borderBottom: `1px solid ${colors.BORDER}`,
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        {(() => {
                          const meta = AGENT_LABELS[selectedArtifact.agent_type] || { label: selectedArtifact.agent_type, color: colors.TEXT_SECONDARY }
                          return (
                            <span style={{
                              padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                              background: meta.color + '15', color: meta.color,
                            }}>{meta.label}</span>
                          )
                        })()}
                        <span style={{ fontSize: 12, color: colors.TEXT_SECONDARY }}>{formatDate(selectedArtifact.created_at)}</span>
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.TEXT_PRIMARY }}>{selectedArtifact.title}</h3>
                    </div>
                    <button
                      onClick={handleCopy}
                      style={{
                        flexShrink: 0, marginLeft: 16,
                        padding: '7px 16px', borderRadius: 10,
                        border: `1px solid ${colors.BORDER}`,
                        background: colors.BG,
                        fontSize: 12, fontWeight: 600,
                        color: copied === selectedArtifactId ? colors.SUCCESS : colors.TEXT_SECONDARY,
                        cursor: 'pointer', transition: 'color 0.2s',
                      }}
                    >{copied === selectedArtifactId ? '복사됐어요!' : '복사'}</button>
                  </div>

                  {/* 본문 */}
                  {loadingContent === selectedArtifactId ? (
                    <p style={{ fontSize: 13, color: colors.TEXT_SECONDARY }}>불러오는 중이에요...</p>
                  ) : (
                    <div
                      className="md-body"
                      style={{ fontSize: 14, color: colors.TEXT_PRIMARY, lineHeight: 1.75 }}
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(artifactContents[selectedArtifactId] || '') }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )
      )}
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
