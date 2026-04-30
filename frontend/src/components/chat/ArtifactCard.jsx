import { useState } from 'react'
import { colors } from '../../styles/colors'

function renderMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:14px;font-weight:700;margin:10px 0 3px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:15px;font-weight:800;margin:12px 0 4px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:16px;font-weight:800;margin:14px 0 5px">$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(0,0,0,0.06);padding:1px 5px;border-radius:4px;font-size:12px">$1</code>')
    .replace(/^- (.+)$/gm, '<li style="margin:2px 0;padding-left:4px">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul style="margin:6px 0;padding-left:18px">$&</ul>')
    .replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')
}

const AGENT_LABELS = {
  'company-analyze':  { label: '기업 분석', color: colors.PRIMARY },
  'question-analyze': { label: '문항 분석', color: '#7C3AED' },
  'essay-writer':     { label: '자소서 초안', color: colors.SUCCESS },
}

export default function ArtifactCard({ artifact }) {
  const [copied, setCopied] = useState(false)
  const meta  = AGENT_LABELS[artifact.agent_type] || { label: artifact.agent_type, color: colors.TEXT_SECONDARY }
  const text  = artifact.content?.raw || ''

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.65)', borderRadius: 16,
      backdropFilter: colors.BLUR_SM,
      WebkitBackdropFilter: colors.BLUR_SM,
      border: `1.5px solid ${meta.color}30`,
      overflow: 'hidden', margin: '8px 0',
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px',
        background: meta.color + '08',
        borderBottom: `1px solid ${meta.color}20`,
      }}>
        <span style={{
          fontSize: 12, fontWeight: 700, color: meta.color,
          padding: '3px 10px', borderRadius: 99,
          background: meta.color + '15',
        }}>{meta.label}</span>
        <button
          onClick={handleCopy}
          style={{
            fontSize: 12, fontWeight: 600,
            color: copied ? colors.SUCCESS : colors.TEXT_SECONDARY,
            background: 'none', border: 'none', cursor: 'pointer',
          }}
        >{copied ? '복사됐어요!' : '복사'}</button>
      </div>

      {/* 결과 텍스트 (마크다운 렌더링) */}
      <div
        style={{
          padding: '16px 16px',
          fontSize: 13, color: colors.TEXT_PRIMARY, lineHeight: 1.7,
          maxHeight: 320, overflowY: 'auto',
        }}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
      />
    </div>
  )
}
