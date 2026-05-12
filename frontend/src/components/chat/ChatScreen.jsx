import { useState, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useMessages } from '../../hooks/useMessages'
import { useArtifacts } from '../../hooks/useArtifacts'
import { useCompanyAnalyze, useQuestionAnalyze, useEssayWriter } from '../../hooks/useAgents'
import { createChat, sendChatMessage } from '../../services/api'
import AgentInputPanel from './AgentInputPanel'
import { colors } from '../../styles/colors'
import { renderMarkdown } from '../../utils/markdown'

const LOADING_MESSAGES = {
  company:  'AI가 기업을 분석하고 있어요. 조금만 기다려 주세요 ☕',
  question: 'AI가 문항의 의도를 파악하고 있어요...',
  essay:    '내 경험을 바탕으로 자소서를 작성하고 있어요. 거의 다 됐어요!',
}

export default function ChatScreen({ chatId, setChatId, profile }) {
  const [loadingType, setLoadingType]       = useState(null)
  const [agentError, setAgentError]         = useState(null)
  const [textInput, setTextInput]           = useState('')
  const [sending, setSending]               = useState(false)
  const [optimisticMessages, setOptimistic] = useState([])
  const [inputFocused, setInputFocused]     = useState(false)
  const [agentPanelOpen, setAgentPanelOpen] = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  const qc = useQueryClient()

  const { data: messages = [] } = useMessages(chatId)
  const { data: artifacts = [] } = useArtifacts()

  const companyMut  = useCompanyAnalyze()
  const questionMut = useQuestionAnalyze()
  const essayMut    = useEssayWriter()

  const ensureChatId = async () => {
    if (chatId) return chatId
    const chat = await createChat({})
    setChatId(chat.id)
    qc.invalidateQueries({ queryKey: ['chats'] })
    return chat.id
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, optimisticMessages, sending, loadingType])

  const allMessages = [...messages, ...optimisticMessages]

  const handleSendText = async () => {
    const text = textInput.trim()
    if (!text || sending) return
    setOptimistic(prev => [...prev, { role: 'user', content: text, _optimistic: true }])
    setSending(true)
    setTextInput('')
    try {
      const id = await ensureChatId()
      await sendChatMessage(id, text)
      setOptimistic([])
      qc.invalidateQueries({ queryKey: ['messages', id] })
      setTimeout(() => qc.invalidateQueries({ queryKey: ['chats'] }), 2000)
    } catch (e) {
      setOptimistic([])
      setTextInput(text)
      setAgentError(e.message || '앗, 잠깐 문제가 생겼어요. 다시 시도해 볼게요.')
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendText() }
  }

  const runAgent = async (type, body) => {
    setLoadingType(type)
    setAgentError(null)
    try {
      const id = await ensureChatId()
      const payload = { chat_id: id, ...body }
      if (type === 'company')  await companyMut.mutateAsync(payload)
      if (type === 'question') await questionMut.mutateAsync(payload)
      if (type === 'essay')    await essayMut.mutateAsync(payload)
    } catch {
      setAgentError('앗, 잠깐 문제가 생겼어요. 다시 시도해 볼게요.')
    } finally {
      setLoadingType(null)
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>

      {/* ── 채팅 영역 ─────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        {/* 메시지 목록 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {allMessages.length === 0 ? (
            chatId === null
              ? <WelcomeMessage profile={profile} onOpenAgent={() => setAgentPanelOpen(true)} />
              : <EmptyChat onOpenAgent={() => setAgentPanelOpen(true)} />
          ) : (
            allMessages.map((msg, i) => (
              <MessageBubble key={msg.id || `opt-${i}`} msg={msg} />
            ))
          )}

          {(loadingType || sending) && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 18px', borderRadius: 16, margin: '8px 0',
              background: colors.PRIMARY_LIGHT, border: `1px solid ${colors.PRIMARY}20`,
            }}>
              <span style={{ fontSize: 22 }}>🤔</span>
              <div>
                <LoadingDots />
                <span style={{ fontSize: 13, color: colors.PRIMARY, fontWeight: 500, marginTop: 4, display: 'block' }}>
                  {sending ? 'AI가 답변을 생각하고 있어요...' : LOADING_MESSAGES[loadingType]}
                </span>
              </div>
            </div>
          )}

          {agentError && (
            <div style={{
              padding: '12px 16px', borderRadius: 12, margin: '8px 0',
              background: colors.ERROR + '12', color: colors.ERROR, fontSize: 13,
            }}>{agentError}</div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* 입력창 */}
        <div style={{
          padding: '10px 20px 16px', flexShrink: 0,
          background: colors.MODAL_GLASS,
          backdropFilter: colors.BLUR_SM,
          WebkitBackdropFilter: colors.BLUR_SM,
          borderTop: `1px solid rgba(255,255,255,0.5)`,
        }}>
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 8,
            background: '#fff', borderRadius: 20,
            border: `1.5px solid ${inputFocused ? colors.PRIMARY : colors.BORDER}`,
            padding: '8px 8px 8px 14px',
            boxShadow: inputFocused
              ? `0 0 0 3px ${colors.PRIMARY}18, 0 4px 20px rgba(27,100,218,0.10)`
              : '0 4px 16px rgba(0,0,0,0.06)',
            transition: 'border 0.2s, box-shadow 0.2s',
          }}>
            {/* 에이전트 토글 버튼 */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {/* 말풍선 힌트 */}
              {!agentPanelOpen && (
                <div style={{
                  position: 'absolute', bottom: 'calc(100% + 10px)', left: 0,
                  background: colors.PRIMARY, color: '#fff',
                  fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                  padding: '5px 10px', borderRadius: 8,
                  pointerEvents: 'none',
                  boxShadow: `0 4px 12px ${colors.PRIMARY}40`,
                }}>
                  기업분석 · 문항분석 · 자소서
                  {/* 말풍선 꼬리 */}
                  <div style={{
                    position: 'absolute', top: '100%', left: 14,
                    width: 0, height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: `5px solid ${colors.PRIMARY}`,
                  }} />
                </div>
              )}
              {/* 펄스 링 */}
              {!agentPanelOpen && (
                <span style={{
                  position: 'absolute', inset: -4, borderRadius: 14,
                  border: `2px solid ${colors.PRIMARY}`,
                  animation: 'agentPing 2s ease-out infinite',
                  pointerEvents: 'none',
                }} />
              )}
              <button
                onClick={() => setAgentPanelOpen(v => !v)}
                style={{
                  width: 34, height: 34, borderRadius: 10, border: 'none',
                  background: agentPanelOpen ? colors.PRIMARY_LIGHT : colors.BG,
                  color: agentPanelOpen ? colors.PRIMARY : colors.TEXT_SECONDARY,
                  fontSize: 17, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >✦</button>
              <style>{`@keyframes agentPing { 0% { transform: scale(1); opacity: 0.7; } 70% { transform: scale(1.6); opacity: 0; } 100% { transform: scale(1.6); opacity: 0; } }`}</style>
            </div>

            <textarea
              ref={inputRef}
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="✏️  무엇이든 물어보세요 · Shift+Enter 줄바꿈"
              rows={1}
              style={{
                flex: 1, resize: 'none', border: 'none', outline: 'none',
                background: 'transparent', fontSize: 14, color: colors.TEXT_PRIMARY,
                lineHeight: 1.6, maxHeight: 120, overflowY: 'auto', fontFamily: 'inherit',
              }}
              onInput={e => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
            />

            {/* 전송 버튼 */}
            <button
              onClick={handleSendText}
              disabled={!textInput.trim() || sending}
              style={{
                flexShrink: 0, width: 38, height: 38, borderRadius: 12, border: 'none',
                background: (textInput.trim() && !sending)
                  ? `linear-gradient(135deg, ${colors.PRIMARY}, #4B8EF0)`
                  : colors.BG,
                color: (textInput.trim() && !sending) ? '#fff' : colors.TEXT_SECONDARY,
                fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: (textInput.trim() && !sending) ? 'pointer' : 'not-allowed',
                boxShadow: (textInput.trim() && !sending) ? `0 4px 12px ${colors.PRIMARY}40` : 'none',
                transition: 'all 0.2s',
              }}
            >{sending ? '⏳' : '↑'}</button>
          </div>

          <p style={{ fontSize: 11, color: colors.TEXT_SECONDARY, textAlign: 'center', margin: '7px 0 0' }}>
            ✦ 버튼으로 기업분석 · 문항분석 · 자소서 작성 에이전트를 사용할 수 있어요
          </p>
        </div>
      </div>

      {/* ── 에이전트 패널 (오른쪽 슬라이드) ─────── */}
      {agentPanelOpen && (
        <div style={{
          width: 340, flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          borderLeft: `1px solid rgba(255,255,255,0.5)`,
          background: colors.SIDEBAR_GLASS,
          backdropFilter: colors.BLUR_MD,
          WebkitBackdropFilter: colors.BLUR_MD,
          overflow: 'hidden',
        }}>
          {/* 패널 헤더 */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 20px 14px',
            borderBottom: `1px solid rgba(255,255,255,0.5)`,
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>✦</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: colors.TEXT_PRIMARY }}>AI 에이전트</span>
            </div>
            <button
              onClick={() => setAgentPanelOpen(false)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 18, color: colors.TEXT_SECONDARY, lineHeight: 1,
                padding: '2px 6px', borderRadius: 6,
              }}
            >✕</button>
          </div>

          {/* 패널 콘텐츠 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            <AgentInputPanel
              artifacts={artifacts}
              loading={!!loadingType}
              onCompany={(body) => runAgent('company', body)}
              onQuestion={(body) => runAgent('question', body)}
              onEssay={(body) => runAgent('essay', body)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      alignItems: 'flex-end',
      gap: 8, marginBottom: 14,
    }}>
      {!isUser && (
        <div style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
          background: colors.PRIMARY_LIGHT, border: `1.5px solid ${colors.PRIMARY}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>🧸</div>
      )}
      <div style={{ maxWidth: '74%' }}>
        <div style={{
          padding: isUser ? '10px 16px' : '14px 18px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser ? `linear-gradient(135deg, ${colors.PRIMARY}, #4B8EF0)` : '#fff',
          border: isUser ? 'none' : `1px solid ${colors.BORDER}`,
          boxShadow: isUser ? `0 4px 16px ${colors.PRIMARY}30` : '0 2px 8px rgba(0,0,0,0.06)',
          fontSize: isUser ? 14 : 15,
          color: isUser ? '#fff' : colors.TEXT_PRIMARY,
          lineHeight: 1.7, wordBreak: 'break-word',
        }}>
          {isUser ? (
            <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
          ) : (
            <div className="md-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
          )}
        </div>
      </div>
    </div>
  )
}

function WelcomeMessage({ profile, onOpenAgent }) {
  const nickname = profile?.nickname || '게스트'
  const message = `안녕하세요, **${nickname}**님! 🗝️\n\n저는 **취트키**예요. 자기소개서 작성을 도와주는 AI 도우미랍니다.\n\n취트키에서 할 수 있는 것들을 소개할게요:\n\n- 📊 **기업 분석** — 지원하려는 기업의 특성, 인재상, 최근 이슈를 파악해요\n- 🔍 **문항 분석** — 자소서 문항이 원하는 바를 읽어내고 어떻게 써야 할지 전략을 세워요\n- ✍️ **자소서 작성** — 기업분석·문항분석 결과와 내 경험을 바탕으로 자소서 초안을 써드려요\n\n💡 **팁:** 먼저 **'내 경험'** 탭에서 나의 경험과 역량을 등록해두면, 자소서 작성 때 훨씬 구체적이고 나다운 글이 완성돼요.\n\n아래 **✦ 버튼**을 눌러 에이전트 기능을 시작하거나, 자유롭게 질문을 입력해보세요!`

  return (
    <div style={{ padding: '32px 0 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
          background: colors.PRIMARY_LIGHT, border: `1.5px solid ${colors.PRIMARY}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>🧸</div>
        <div style={{ maxWidth: '80%' }}>
          <div style={{
            padding: '16px 20px',
            borderRadius: '18px 18px 18px 4px',
            background: '#fff',
            border: `1px solid ${colors.BORDER}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            fontSize: 14,
            color: colors.TEXT_PRIMARY,
            lineHeight: 1.75,
            wordBreak: 'break-word',
          }}>
            <div className="md-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(message) }} />
          </div>
        </div>
      </div>
      <div style={{ paddingLeft: 46, marginTop: 8 }}>
        <button
          onClick={onOpenAgent}
          style={{
            padding: '10px 20px', borderRadius: 12, border: 'none',
            background: `linear-gradient(135deg, ${colors.PRIMARY}, #4B8EF0)`,
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 4px 12px ${colors.PRIMARY}40`,
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}
        >
          <span>✦</span> AI 에이전트 시작하기
        </button>
      </div>
    </div>
  )
}

function EmptyChat({ onOpenAgent }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: 80, marginBottom: 8, lineHeight: 1 }}>🧸</div>
      <p style={{ fontSize: 17, fontWeight: 800, color: colors.TEXT_PRIMARY, marginBottom: 8 }}>
        자소서 작업을 시작해 볼까요?
      </p>
      <p style={{ fontSize: 13, color: colors.TEXT_SECONDARY, lineHeight: 1.7, marginBottom: 24 }}>
        자유롭게 대화하거나,<br />
        AI 에이전트로 기업분석·문항분석·자소서 작성을 해보세요
      </p>
      <button
        onClick={onOpenAgent}
        style={{
          padding: '12px 24px', borderRadius: 14, border: 'none',
          background: `linear-gradient(135deg, ${colors.PRIMARY}, #4B8EF0)`,
          color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          boxShadow: `0 4px 16px ${colors.PRIMARY}40`,
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}
      >
        <span>✦</span> AI 에이전트 시작하기
      </button>
    </div>
  )
}

function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: colors.PRIMARY,
          animation: `bounce 1.2s ${i * 0.2}s infinite`, opacity: 0.7,
        }} />
      ))}
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  )
}
