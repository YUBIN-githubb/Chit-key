import { useState } from 'react'
import { colors } from '../../styles/colors'

const AGENT_LABELS = {
  'company-analyze':  { label: '기업 분석',  color: colors.PRIMARY },
  'question-analyze': { label: '문항 분석',  color: '#7C3AED' },
  'essay-writer':     { label: '자소서 초안', color: colors.SUCCESS },
}

export default function ArtifactPicker({ artifacts, onSelect, onClose }) {
  const [activeType, setActiveType] = useState('all')

  const types = ['all', ...new Set(artifacts.map(a => a.agent_type))]
  const filtered = activeType === 'all'
    ? artifacts
    : artifacts.filter(a => a.agent_type === activeType)

  return (
    <div style={{
      position: 'absolute', bottom: '100%', left: 0, right: 0, zIndex: 50,
      background: colors.MODAL_GLASS,
      backdropFilter: colors.BLUR_MD,
      WebkitBackdropFilter: colors.BLUR_MD,
      border: `1px solid rgba(255,255,255,0.7)`,
      borderRadius: '16px 16px 0 0',
      boxShadow: '0 -8px 32px rgba(27,100,218,0.10)',
      padding: '16px 16px 0',
      maxHeight: 320, display: 'flex', flexDirection: 'column',
    }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: colors.TEXT_PRIMARY }}>산출물 첨부</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: colors.TEXT_SECONDARY }}>✕</button>
      </div>

      {/* 타입 필터 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {types.map(t => {
          const meta = t === 'all' ? { label: '전체', color: colors.TEXT_SECONDARY } : AGENT_LABELS[t]
          const active = activeType === t
          return (
            <button key={t} onClick={() => setActiveType(t)} style={{
              padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600,
              border: `1.5px solid ${active ? (meta?.color || colors.PRIMARY) : colors.BORDER}`,
              background: active ? (meta?.color || colors.PRIMARY) + '15' : 'transparent',
              color: active ? (meta?.color || colors.PRIMARY) : colors.TEXT_SECONDARY,
              cursor: 'pointer',
            }}>{meta?.label || t}</button>
          )
        })}
      </div>

      {/* 목록 */}
      <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 16 }}>
        {filtered.length === 0 ? (
          <p style={{ fontSize: 13, color: colors.TEXT_SECONDARY, textAlign: 'center', padding: '24px 0' }}>
            첨부할 산출물이 없어요
          </p>
        ) : (
          filtered.map(a => {
            const meta = AGENT_LABELS[a.agent_type] || { label: a.agent_type, color: colors.TEXT_SECONDARY }
            return (
              <button
                key={a.id}
                onClick={() => { onSelect(a); onClose() }}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '10px 12px', borderRadius: 10, marginBottom: 6,
                  background: 'rgba(255,255,255,0.5)',
                  border: `1px solid ${colors.BORDER}`,
                  cursor: 'pointer', transition: 'background 0.15s',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
                onMouseEnter={e => e.currentTarget.style.background = colors.PRIMARY_LIGHT}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'}
              >
                <span style={{
                  padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                  background: meta.color + '15', color: meta.color, whiteSpace: 'nowrap',
                }}>{meta.label}</span>
                <span style={{ fontSize: 13, color: colors.TEXT_PRIMARY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.title}
                </span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
