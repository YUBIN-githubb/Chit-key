import { useState, useEffect } from 'react'
import { useCreateExperience, useUpdateExperience } from '../../hooks/useExperiences'
import { colors } from '../../styles/colors'

const TAG_CATEGORIES = [
  { label: '리더십 / 조직관리', tags: ['리더십', '팀장경험', '역할분배', '동기부여', '의사결정', '위임', '목표설정', '성과관리'] },
  { label: '협업 / 커뮤니케이션', tags: ['협업', '팀워크', '갈등관리', '설득', '경청', '이해관계조율', '피드백수용', '다양성존중'] },
  { label: '문제해결 / 분석',     tags: ['문제해결', '원인분석', '데이터기반판단', '가설검증', '창의적접근', '트레이드오프', '우선순위판단', '논리적사고'] },
  { label: '도전 / 실패극복',     tags: ['도전정신', '실패경험', '회복탄력성', '한계돌파', '처음시도', '불확실성대응', '피벗', '재도전'] },
  { label: '자기개발 / 학습',     tags: ['자기주도학습', '역량개발', '자격증', '독학', '멘토링', '습관형성', '꾸준함', '성장마인드셋'] },
  { label: '실행력 / 주도성',     tags: ['주도성', '기획', '실행력', '프로세스개선', '자동화', '일정관리', '자원관리', '결과도출'] },
  { label: '윤리 / 책임감',       tags: ['책임감', '윤리의식', '정직', '원칙준수', '사회적책임', '고객지향', '봉사', '공정성'] },
  { label: '맥락',                tags: ['인턴', '대외활동', '학교프로젝트', '동아리', '아르바이트', '공모전', '연구', '창업', '봉사활동', '해외경험', '군경험'] },
]

const CATEGORY_COLORS = [
  '#1B64DA', '#7C3AED', '#0EA5E9', '#F97316',
  '#10B981', '#0D9488', '#EC4899', '#6B7280',
]

const EMPTY = {
  name: '', role: '', period_start: '', period_end: '',
  star_situation: '', star_task: '', star_action: '', star_result: '',
  competency_tags: [],
}

const DRAFT_KEY = 'exp_form_draft'

export default function ExperienceForm({ initial, onClose }) {
  const isEdit = !!initial
  const [form, setForm] = useState(() => {
    if (initial) {
      return { ...initial, period_start: initial.period_start || '', period_end: initial.period_end || '' }
    }
    // 새 경험 추가 시 임시저장된 초안이 있으면 복원
    try {
      const draft = sessionStorage.getItem(DRAFT_KEY)
      if (draft) return JSON.parse(draft)
    } catch {}
    return EMPTY
  })
  const [error, setError] = useState(null)

  // 새 경험 작성 중 폼 변경 시 sessionStorage에 임시저장
  useEffect(() => {
    if (!isEdit) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form))
  }, [form, isEdit])

  const createMut = useCreateExperience()
  const updateMut = useUpdateExperience()
  const loading   = createMut.isPending || updateMut.isPending

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const toggleTag = (tag) => setForm(f => {
    if (f.competency_tags.includes(tag)) {
      return { ...f, competency_tags: f.competency_tags.filter(t => t !== tag) }
    }
    const category = TAG_CATEGORIES.find(c => c.tags.includes(tag))
    const countInCategory = category
      ? f.competency_tags.filter(t => category.tags.includes(t)).length
      : 0
    if (countInCategory >= 2) return f   // 카테고리당 최대 2개
    return { ...f, competency_tags: [...f.competency_tags, tag] }
  })

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError('경험 이름을 입력해 주세요')
    if (!form.period_start) return setError('시작 날짜를 입력해 주세요')
    setError(null)

    const body = {
      ...form,
      period_start: form.period_start + '-01',
      period_end: form.period_end ? form.period_end + '-01' : null,
    }

    try {
      if (isEdit) {
        await updateMut.mutateAsync({ id: initial.id, ...body })
      } else {
        await createMut.mutateAsync(body)
        sessionStorage.removeItem(DRAFT_KEY)
      }
      onClose()
    } catch (e) {
      setError(e.message || '앗, 잠깐 문제가 생겼어요. 다시 시도해 볼게요.')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(25,31,40,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 24,
    }}>
      <div style={{
        background: colors.SURFACE, borderRadius: 24,
        padding: '36px 36px', width: '100%', maxWidth: 560,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 8px 48px rgba(25,31,40,0.18)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: colors.TEXT_PRIMARY }}>
            {isEdit ? '경험 수정' : '경험 추가'}
          </h3>
          <button onClick={() => { sessionStorage.removeItem(DRAFT_KEY); onClose() }} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: colors.TEXT_SECONDARY }}>✕</button>
        </div>

        {/* 기본 정보 */}
        <Section label="기본 정보">
          <Field label="경험 이름 *" value={form.name} onChange={set('name')} placeholder="예: 네이버 인턴십" />
          <Field label="역할" value={form.role} onChange={set('role')} placeholder="예: 백엔드 개발 인턴" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="시작 월 *" type="month" value={form.period_start} onChange={set('period_start')} />
            <Field label="종료 월" type="month" value={form.period_end} onChange={set('period_end')} placeholder="재직 중이면 비워두세요" />
          </div>
        </Section>

        {/* STAR 구조 */}
        <Section label="STAR 구조">
          <p style={{ fontSize: 12, color: colors.TEXT_SECONDARY, marginBottom: 12 }}>
            구체적으로 작성할수록 자소서 품질이 올라가요
          </p>
          <TextArea label="Situation — 어떤 상황이었나요?" value={form.star_situation} onChange={set('star_situation')} placeholder="당시 상황과 배경을 설명해 주세요" />
          <TextArea label="Task — 어떤 과제를 맡았나요?" value={form.star_task} onChange={set('star_task')} placeholder="본인이 담당한 역할이나 목표를 설명해 주세요" />
          <TextArea label="Action — 어떻게 해결했나요?" value={form.star_action} onChange={set('star_action')} placeholder="실제로 취한 행동을 구체적으로 설명해 주세요" />
          <TextArea label="Result — 결과는 어떻었나요?" value={form.star_result} onChange={set('star_result')} placeholder="수치나 성과가 있다면 함께 작성해 주세요" />
        </Section>

        {/* 태그 */}
        <Section label="역량 태그">
          <p style={{ fontSize: 12, color: colors.TEXT_SECONDARY, marginBottom: 14 }}>
            해당되는 것만 골라주세요. 카테고리당 최대 2개까지 선택할 수 있어요.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {TAG_CATEGORIES.map(({ label, tags }, ci) => {
              const color = CATEGORY_COLORS[ci]
              const selectedInCategory = tags.filter(t => form.competency_tags.includes(t)).length
              const atLimit = selectedInCategory >= 2
              return (
                <div key={label}>
                  <p style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 7, letterSpacing: '0.2px' }}>
                    {label}
                    {selectedInCategory > 0 && (
                      <span style={{ fontWeight: 400, color: atLimit ? color : colors.TEXT_SECONDARY, marginLeft: 6 }}>
                        {selectedInCategory}/2
                      </span>
                    )}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {tags.map(tag => {
                      const selected = form.competency_tags.includes(tag)
                      const disabled = !selected && atLimit
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          disabled={disabled}
                          style={{
                            padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                            border: `1.5px solid ${selected ? color : colors.BORDER}`,
                            background: selected ? color + '18' : colors.SURFACE,
                            color: selected ? color : disabled ? colors.BORDER : colors.TEXT_SECONDARY,
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            opacity: disabled ? 0.45 : 1,
                            transition: 'all 0.15s',
                          }}
                        >{tag}</button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 16, background: colors.ERROR + '12', color: colors.ERROR, fontSize: 13 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { sessionStorage.removeItem(DRAFT_KEY); onClose() }} style={{
            flex: 1, padding: '13px 0', borderRadius: 12,
            background: colors.BG, border: `1.5px solid ${colors.BORDER}`,
            fontSize: 14, fontWeight: 600, color: colors.TEXT_SECONDARY, cursor: 'pointer',
          }}>취소</button>
          <button onClick={handleSubmit} disabled={loading} style={{
            flex: 2, padding: '13px 0', borderRadius: 12,
            background: loading ? colors.BORDER : colors.PRIMARY,
            color: loading ? colors.TEXT_SECONDARY : '#fff',
            fontSize: 14, fontWeight: 700, border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? '저장하는 중이에요...' : (isEdit ? '수정 완료' : '경험 추가')}
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: colors.TEXT_SECONDARY, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 12 }}>{label}</p>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: colors.TEXT_PRIMARY, display: 'block', marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: 10,
          border: `1.5px solid ${colors.BORDER}`,
          fontSize: 13, color: colors.TEXT_PRIMARY,
          outline: 'none', boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

function TextArea({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: colors.TEXT_PRIMARY, display: 'block', marginBottom: 6 }}>{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: 10,
          border: `1.5px solid ${colors.BORDER}`,
          fontSize: 13, color: colors.TEXT_PRIMARY,
          outline: 'none', resize: 'vertical', fontFamily: 'inherit',
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}
