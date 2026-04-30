import { useState, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useMessages } from '../../hooks/useMessages'
import { useCompanyAnalyze, useQuestionAnalyze, useEssayWriter } from '../../hooks/useAgents'
import { sendChatMessage } from '../../services/api'
import ArtifactCard from './ArtifactCard'
import AgentInputPanel from './AgentInputPanel'
import { colors } from '../../styles/colors'

const LOADING_MESSAGES = {
  company:  'AI가 기업을 분석하고 있어요. 조금만 기다려 주세요 ☕',
  question: 'AI가 문항의 의도를 파악하고 있어요...',
  essay:    '내 경험을 바탕으로 자소서를 작성하고 있어요. 거의 다 됐어요!',
}

export default function ChatScreen({ chatId }) {
  const [loadingType, setLoadingType] = useState(null)
  const [agentError, setAgentError]   = useState(null)
  const [textInput, setTextInput]     = useState('')
  const [sending, setSending]         = useState(false)
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const qc         = useQueryClient()

  const { data: messages = [], isLoading: msgLoading } = useMessages(chatId)

  const companyMut  = useCompanyAnalyze(chatId)
  const questionMut = useQuestionAnalyze(chatId)
  const essayMut    = useEssayWriter(chatId)

  // 메시지 추가 시 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 전체 artifact 목록 (파이프라인 연결용)
  const artifacts = messages
    .filter(m => m.artifact)
    .map(m => m.artifact)

  const handleSendText = async () => {
    const text = textInput.trim()
    if (!text || !chatId || sending) return
    setSending(true)
    setTextInput('')
    try {
      await sendChatMessage(chatId, text)
      qc.invalidateQueries({ queryKey: ['messages', chatId] })
    } catch (e) {
      setTextInput(text)
      setAgentError(e.message || '앗, 잠깐 문제가 생겼어요. 다시 시도해 볼게요.')
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  const runAgent = async (type, body) => {
    setLoadingType(type)
    setAgentError(null)
    try {
      if (type === 'company')  await companyMut.mutateAsync(body)
      if (type === 'question') await questionMut.mutateAsync(body)
      if (type === 'essay')    await essayMut.mutateAsync(body)
    } catch (e) {
      setAgentError('앗, 잠깐 문제가 생겼어요. 다시 시도해 볼게요.')
    } finally {
      setLoadingType(null)
    }
  }

  if (!chatId) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 14, color: colors.TEXT_SECONDARY }}>채팅을 불러오는 중이에요...</p>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* 메시지 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {messages.length === 0 ? (
          <EmptyChat />
        ) : (
          messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))
        )}

        {/* 로딩 인디케이터 */}
        {(loadingType || sending) && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '16px 20px', borderRadius: 16,
            background: colors.PRIMARY_LIGHT,
            border: `1px solid ${colors.PRIMARY}20`,
            margin: '8px 0',
          }}>
            <LoadingDots />
            <span style={{ fontSize: 13, color: colors.PRIMARY, fontWeight: 500 }}>
              {sending ? 'AI가 답변을 생각하고 있어요...' : LOADING_MESSAGES[loadingType]}
            </span>
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

      {/* 일반 텍스트 입력창 */}
      <div style={{
        borderTop: `1px solid rgba(255,255,255,0.4)`,
        background: colors.MODAL_GLASS,
        backdropFilter: colors.BLUR_SM,
        WebkitBackdropFilter: colors.BLUR_SM,
        padding: '10px 16px',
        display: 'flex', gap: 8, alignItems: 'flex-end',
      }}>
        <textarea
          ref={inputRef}
          value={textInput}
          onChange={e => setTextInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요 (Shift+Enter로 줄바꿈)"
          rows={1}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 12,
            border: `1.5px solid ${colors.BORDER}`,
            background: 'rgba(255,255,255,0.7)',
            fontSize: 13, color: colors.TEXT_PRIMARY,
            outline: 'none', resize: 'none', fontFamily: 'inherit',
            lineHeight: 1.5, maxHeight: 120, overflowY: 'auto',
            boxSizing: 'border-box',
          }}
          onInput={e => {
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
          }}
        />
        <button
          onClick={handleSendText}
          disabled={!textInput.trim() || sending}
          style={{
            padding: '10px 16px', borderRadius: 12, border: 'none',
            background: !textInput.trim() || sending ? colors.BORDER : colors.PRIMARY,
            color: !textInput.trim() || sending ? colors.TEXT_SECONDARY : '#fff',
            fontSize: 13, fontWeight: 700,
            cursor: !textInput.trim() || sending ? 'not-allowed' : 'pointer',
            flexShrink: 0, alignSelf: 'flex-end',
          }}
        >{sending ? '...' : '전송'}</button>
      </div>

      {/* 에이전트 입력 패널 */}
      <AgentInputPanel
        artifacts={artifacts}
        loading={!!loadingType}
        onCompany={(body) => runAgent('company', body)}
        onQuestion={(body) => runAgent('question', body)}
        onEssay={(body) => runAgent('essay', body)}
      />
    </div>
  )
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 12,
    }}>
      <div style={{
        maxWidth: '72%',
        padding: '10px 14px', borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser ? colors.PRIMARY : colors.SURFACE,
        border: isUser ? 'none' : `1px solid ${colors.BORDER}`,
        fontSize: 13, color: isUser ? '#fff' : colors.TEXT_PRIMARY,
        lineHeight: 1.6,
      }}>
        {msg.content}
        {msg.artifact && <ArtifactCard artifact={msg.artifact} />}
      </div>
    </div>
  )
}

function EmptyChat() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
      <p style={{ fontSize: 16, fontWeight: 700, color: colors.TEXT_PRIMARY, marginBottom: 8 }}>
        자소서 작업을 시작해 볼까요?
      </p>
      <p style={{ fontSize: 13, color: colors.TEXT_SECONDARY, lineHeight: 1.6 }}>
        아래에서 기업분석 → 문항분석 → 자소서 작성 순서로<br />
        AI 에이전트를 활용해 보세요
      </p>
    </div>
  )
}

function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: colors.PRIMARY,
          animation: `bounce 1.2s ${i * 0.2}s infinite`,
          opacity: 0.7,
        }} />
      ))}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </div>
  )
}
