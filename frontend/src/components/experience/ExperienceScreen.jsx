import { useState } from 'react'
import { useExperiences, useDeleteExperience } from '../../hooks/useExperiences'
import ExperienceForm from './ExperienceForm'
import { colors } from '../../styles/colors'

const TAG_COLORS = {
  '인턴': colors.PRIMARY, '프로젝트': '#7C3AED', '동아리': '#0EA5E9',
  '대외활동': colors.SUCCESS, '봉사활동': colors.WARNING,
  '아르바이트': colors.ERROR, '학술': '#EC4899', '기타': colors.TEXT_SECONDARY,
}

export default function ExperienceScreen() {
  const { data: experiences = [], isLoading, error } = useExperiences()
  const deleteMut = useDeleteExperience()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing]   = useState(null) // null = 추가, {...} = 수정

  if (isLoading) return <LoadingState />

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '36px 36px' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: colors.TEXT_PRIMARY, letterSpacing: '-0.5px', marginBottom: 4 }}>
            내 경험
          </h2>
          <p style={{ fontSize: 13, color: colors.TEXT_SECONDARY }}>
            등록한 경험은 자소서 작성 때 AI가 자동으로 활용해요
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setFormOpen(true) }}
          style={{
            padding: '10px 18px', borderRadius: 12,
            background: colors.PRIMARY, color: '#fff',
            fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
          }}
        >
          + 경험 추가
        </button>
      </div>

      {error && (
        <div style={{ padding: '14px 18px', borderRadius: 12, background: colors.ERROR + '12', color: colors.ERROR, fontSize: 14, marginBottom: 24 }}>
          앗, 경험을 불러오지 못했어요. 다시 시도해 볼게요.
        </div>
      )}

      {/* 빈 상태 */}
      {experiences.length === 0 ? (
        <EmptyState onAdd={() => { setEditing(null); setFormOpen(true) }} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {experiences.map(exp => (
            <ExperienceCard
              key={exp.id}
              exp={exp}
              tagColors={TAG_COLORS}
              onEdit={() => { setEditing(exp); setFormOpen(true) }}
              onDelete={() => {
                if (window.confirm('정말 삭제할까요?')) deleteMut.mutate(exp.id)
              }}
            />
          ))}
        </div>
      )}

      {/* 폼 모달 */}
      {formOpen && (
        <ExperienceForm
          initial={editing}
          onClose={() => { setFormOpen(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

function ExperienceCard({ exp, tagColors, onEdit, onDelete }) {
  const [hover, setHover] = useState(false)
  const period = `${exp.period_start} ~ ${exp.period_end || '현재'}`

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: colors.SURFACE, borderRadius: 18, padding: '22px',
        border: `1.5px solid ${hover ? colors.PRIMARY + '60' : colors.BORDER}`,
        boxShadow: hover ? `0 8px 28px rgba(27,100,218,0.10)` : '0 2px 8px rgba(27,100,218,0.04)',
        transition: 'all 0.2s', position: 'relative',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: colors.TEXT_PRIMARY, marginBottom: 4 }}>{exp.name}</div>
          <div style={{ fontSize: 13, color: colors.TEXT_SECONDARY }}>{exp.role} · {period}</div>
        </div>
        {hover && (
          <div style={{ display: 'flex', gap: 6 }}>
            <IconBtn onClick={onEdit} bg={colors.BG} color={colors.TEXT_SECONDARY}>✏️</IconBtn>
            <IconBtn onClick={onDelete} bg={colors.ERROR + '12'} color={colors.ERROR}>🗑</IconBtn>
          </div>
        )}
      </div>

      {exp.star_situation && (
        <p style={{ fontSize: 13, color: colors.TEXT_SECONDARY, marginBottom: 12, lineHeight: 1.5 }}>
          {exp.star_situation.length > 80 ? exp.star_situation.slice(0, 80) + '...' : exp.star_situation}
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {(exp.competency_tags || []).map(tag => {
          const color = tagColors[tag] || colors.TEXT_SECONDARY
          return (
            <span key={tag} style={{
              padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
              background: color + '15', color, border: `1px solid ${color}25`,
            }}>{tag}</span>
          )
        })}
      </div>
    </div>
  )
}

function IconBtn({ onClick, bg, color, children }) {
  return (
    <button onClick={onClick} style={{
      width: 32, height: 32, borderRadius: 8,
      background: bg, color, fontSize: 14,
      border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{children}</button>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
      <p style={{ fontSize: 16, fontWeight: 700, color: colors.TEXT_PRIMARY, marginBottom: 8 }}>
        아직 경험이 없어요
      </p>
      <p style={{ fontSize: 13, color: colors.TEXT_SECONDARY, marginBottom: 24 }}>
        첫 번째 경험을 등록해 볼까요?<br />등록할수록 자소서 품질이 올라가요
      </p>
      <button onClick={onAdd} style={{
        padding: '12px 24px', borderRadius: 12,
        background: colors.PRIMARY, color: '#fff',
        fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
      }}>경험 추가하기</button>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: 14, color: colors.TEXT_SECONDARY }}>경험을 불러오는 중이에요...</p>
    </div>
  )
}
