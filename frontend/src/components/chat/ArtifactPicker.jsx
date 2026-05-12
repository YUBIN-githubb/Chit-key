import { colors } from '../../styles/colors'

const AGENT_LABELS = {
  'company-analyze':  { label: '기업 분석',  color: colors.PRIMARY },
  'question-analyze': { label: '문항 분석',  color: '#7C3AED' },
  'essay-writer':     { label: '자소서 초안', color: colors.SUCCESS },
}

export default function ArtifactPicker({ artifacts, title, onSelect, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(25,31,40,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          background: colors.SURFACE,
          borderRadius: 20,
          boxShadow: '0 8px 48px rgba(25,31,40,0.18)',
          display: 'flex', flexDirection: 'column',
          maxHeight: '70vh',
        }}
      >
        {/* 헤더 */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px 16px',
          borderBottom: `1px solid ${colors.BORDER}`,
          flexShrink: 0,
        }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 800, color: colors.TEXT_PRIMARY }}>
              {title || '산출물 선택'}
            </span>
            <span style={{ fontSize: 12, color: colors.TEXT_SECONDARY, marginLeft: 8 }}>
              {artifacts.length}개
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: colors.TEXT_SECONDARY, lineHeight: 1 }}
          >✕</button>
        </div>

        {/* 목록 */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '12px 16px 16px' }}>
          {artifacts.length === 0 ? (
            <p style={{ fontSize: 13, color: colors.TEXT_SECONDARY, textAlign: 'center', padding: '40px 0' }}>
              첨부할 산출물이 없어요
            </p>
          ) : (
            artifacts.map(a => {
              const meta = AGENT_LABELS[a.agent_type] || { label: a.agent_type, color: colors.TEXT_SECONDARY }
              return (
                <button
                  key={a.id}
                  onClick={() => onSelect(a)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '12px 14px', borderRadius: 12, marginBottom: 8,
                    background: '#fff',
                    border: `1.5px solid ${colors.BORDER}`,
                    cursor: 'pointer', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = meta.color
                    e.currentTarget.style.background = meta.color + '08'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = colors.BORDER
                    e.currentTarget.style.background = '#fff'
                  }}
                >
                  <span style={{
                    flexShrink: 0,
                    padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                    background: meta.color + '15', color: meta.color,
                  }}>{meta.label}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: colors.TEXT_PRIMARY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.title}
                    </div>
                    {a.company_name && (
                      <div style={{ fontSize: 11, color: colors.TEXT_SECONDARY, marginTop: 2 }}>
                        {a.company_name}{a.position ? ` · ${a.position}` : ''}
                      </div>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
