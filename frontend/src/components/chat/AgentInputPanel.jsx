import { useState } from 'react'
import ArtifactPicker from './ArtifactPicker'
import { colors } from '../../styles/colors'

const AGENT_TABS = [
  { id: 'company',  label: '기업 분석' },
  { id: 'question', label: '문항 분석' },
  { id: 'essay',    label: '자소서 작성' },
]

export default function AgentInputPanel({ artifacts, onCompany, onQuestion, onEssay, loading }) {
  const [activeTab, setActiveTab] = useState('company')

  return (
    <div style={{
      borderTop: `1px solid rgba(255,255,255,0.5)`,
      background: colors.MODAL_GLASS,
      backdropFilter: colors.BLUR_SM,
      WebkitBackdropFilter: colors.BLUR_SM,
      padding: '14px 20px',
      position: 'relative',
    }}>
      {/* 에이전트 탭 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {AGENT_TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
            border: `1.5px solid ${activeTab === id ? colors.PRIMARY : colors.BORDER}`,
            background: activeTab === id ? colors.PRIMARY_LIGHT : 'rgba(255,255,255,0.5)',
            color: activeTab === id ? colors.PRIMARY : colors.TEXT_SECONDARY,
            cursor: 'pointer', transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {activeTab === 'company' && <CompanyForm onSubmit={onCompany} loading={loading} />}
      {activeTab === 'question' && <QuestionForm onSubmit={onQuestion} loading={loading} artifacts={artifacts} />}
      {activeTab === 'essay'    && <EssayForm    onSubmit={onEssay}    loading={loading} artifacts={artifacts} />}
    </div>
  )
}

// ── 기업분석 폼 ────────────────────────────────────────────────────────────────
function CompanyForm({ onSubmit, loading }) {
  const [company, setCompany]   = useState('')
  const [position, setPosition] = useState('')
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
      <InputField label="기업명" value={company} onChange={setCompany} placeholder="예: 카카오" />
      <InputField label="직무" value={position} onChange={setPosition} placeholder="예: 백엔드 개발자" />
      <SubmitBtn onClick={() => onSubmit({ company: company.trim(), position: position.trim() })}
        disabled={loading || !company.trim() || !position.trim()} loading={loading}>분석 시작</SubmitBtn>
    </div>
  )
}

// ── 문항분석 폼 ────────────────────────────────────────────────────────────────
function QuestionForm({ onSubmit, loading, artifacts }) {
  const [company, setCompany]     = useState('')
  const [position, setPosition]   = useState('')
  const [questions, setQuestions] = useState([{ question: '', char_limit: '' }])
  const [attached, setAttached]   = useState(null)  // { id, title, agent_type }
  const [pickerOpen, setPickerOpen] = useState(false)

  const companyArtifacts = artifacts.filter(a => a.agent_type === 'company-analyze')

  const addQ    = () => setQuestions(q => [...q, { question: '', char_limit: '' }])
  const removeQ = (i) => setQuestions(q => q.filter((_, idx) => idx !== i))
  const updateQ = (i, k, v) => setQuestions(q => q.map((item, idx) => idx === i ? { ...item, [k]: v } : item))

  const handleSubmit = () => {
    const valid = questions.filter(q => q.question.trim())
    if (!company.trim() || !position.trim() || !valid.length) return
    onSubmit({
      company: company.trim(), position: position.trim(),
      questions: valid.map(q => ({ question: q.question.trim(), char_limit: q.char_limit ? parseInt(q.char_limit) : null })),
      company_artifact_id: attached?.id || null,
    })
  }

  return (
    <div style={{ position: 'relative' }}>
      {pickerOpen && (
        <ArtifactPicker
          artifacts={companyArtifacts}
          onSelect={setAttached}
          onClose={() => setPickerOpen(false)}
        />
      )}
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <InputField label="기업명" value={company} onChange={setCompany} placeholder="예: 카카오" />
        <InputField label="직무" value={position} onChange={setPosition} placeholder="예: 백엔드 개발자" />
      </div>

      {/* 첨부 영역 */}
      <AttachBar
        attached={attached}
        onAttach={() => setPickerOpen(p => !p)}
        onDetach={() => setAttached(null)}
        label="기업분석 결과 첨부"
        disabled={companyArtifacts.length === 0}
      />

      <label style={labelSt}>자소서 문항</label>
      {questions.map((q, i) => (
        <QuestionRow key={i} q={q} i={i} onChange={updateQ} onRemove={removeQ} canRemove={questions.length > 1} />
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <AddBtn onClick={addQ}>+ 문항 추가</AddBtn>
        <SubmitBtn onClick={handleSubmit} disabled={loading || !company.trim() || !position.trim()} loading={loading}>분석 시작</SubmitBtn>
      </div>
    </div>
  )
}

// ── 자소서작성 폼 ───────────────────────────────────────────────────────────────
function EssayForm({ onSubmit, loading, artifacts }) {
  const [company, setCompany]     = useState('')
  const [position, setPosition]   = useState('')
  const [questions, setQuestions] = useState([{ question: '', char_limit: '' }])
  const [attached, setAttached]   = useState(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  const questionArtifacts = artifacts.filter(a => a.agent_type === 'question-analyze')

  const addQ    = () => setQuestions(q => [...q, { question: '', char_limit: '' }])
  const removeQ = (i) => setQuestions(q => q.filter((_, idx) => idx !== i))
  const updateQ = (i, k, v) => setQuestions(q => q.map((item, idx) => idx === i ? { ...item, [k]: v } : item))

  const handleSubmit = () => {
    const valid = questions.filter(q => q.question.trim())
    if (!company.trim() || !position.trim() || !valid.length) return
    onSubmit({
      company: company.trim(), position: position.trim(),
      questions: valid.map(q => ({ question: q.question.trim(), char_limit: q.char_limit ? parseInt(q.char_limit) : null })),
      question_artifact_id: attached?.id || null,
    })
  }

  return (
    <div style={{ position: 'relative' }}>
      {pickerOpen && (
        <ArtifactPicker
          artifacts={questionArtifacts}
          onSelect={setAttached}
          onClose={() => setPickerOpen(false)}
        />
      )}
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <InputField label="기업명" value={company} onChange={setCompany} placeholder="예: 카카오" />
        <InputField label="직무" value={position} onChange={setPosition} placeholder="예: 백엔드 개발자" />
      </div>

      <AttachBar
        attached={attached}
        onAttach={() => setPickerOpen(p => !p)}
        onDetach={() => setAttached(null)}
        label="문항분석 결과 첨부"
        disabled={questionArtifacts.length === 0}
      />

      <label style={labelSt}>자소서 문항</label>
      {questions.map((q, i) => (
        <QuestionRow key={i} q={q} i={i} onChange={updateQ} onRemove={removeQ} canRemove={questions.length > 1} />
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <AddBtn onClick={addQ}>+ 문항 추가</AddBtn>
        <SubmitBtn onClick={handleSubmit} disabled={loading || !company.trim() || !position.trim()} loading={loading}>자소서 작성</SubmitBtn>
      </div>
    </div>
  )
}

// ── 공용 컴포넌트 ────────────────────────────────────────────────────────────
function AttachBar({ attached, onAttach, onDetach, label, disabled }) {
  if (attached) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', borderRadius: 99,
          background: colors.PRIMARY_LIGHT, border: `1px solid ${colors.PRIMARY}30`,
        }}>
          <span style={{ fontSize: 12, color: colors.PRIMARY, fontWeight: 600 }}>📎 {attached.title}</span>
          <button onClick={onDetach} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: colors.PRIMARY, padding: 0 }}>✕</button>
        </div>
      </div>
    )
  }
  return (
    <button
      onClick={onAttach}
      disabled={disabled}
      style={{
        marginBottom: 10, padding: '6px 12px', borderRadius: 10,
        border: `1.5px dashed ${disabled ? colors.BORDER : colors.PRIMARY + '60'}`,
        background: 'transparent',
        fontSize: 12, fontWeight: 600,
        color: disabled ? colors.TEXT_SECONDARY : colors.PRIMARY,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {disabled ? `${label} (없음)` : `📎 ${label}`}
    </button>
  )
}

function QuestionRow({ q, i, onChange, onRemove, canRemove }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
      <input value={q.question} onChange={e => onChange(i, 'question', e.target.value)}
        placeholder={`문항 ${i + 1}`} style={{ ...inSt, flex: 3 }} />
      <input type="number" value={q.char_limit} onChange={e => onChange(i, 'char_limit', e.target.value)}
        placeholder="글자수" style={{ ...inSt, flex: 1 }} />
      {canRemove && (
        <button onClick={() => onRemove(i)} style={{ background: 'none', border: 'none', color: colors.ERROR, cursor: 'pointer', fontSize: 16 }}>✕</button>
      )}
    </div>
  )
}

function InputField({ label, value, onChange, placeholder }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={labelSt}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inSt} />
    </div>
  )
}

function AddBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 14px', borderRadius: 10,
      border: `1.5px solid ${colors.BORDER}`, background: 'rgba(255,255,255,0.5)',
      fontSize: 12, fontWeight: 600, color: colors.TEXT_SECONDARY, cursor: 'pointer',
    }}>{children}</button>
  )
}

function SubmitBtn({ onClick, disabled, loading, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      alignSelf: 'flex-end', padding: '10px 18px', borderRadius: 10,
      background: disabled ? colors.BORDER : colors.PRIMARY,
      color: disabled ? colors.TEXT_SECONDARY : '#fff',
      fontSize: 13, fontWeight: 700, border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
      boxShadow: disabled ? 'none' : `0 4px 12px ${colors.PRIMARY}40`,
    }}>{loading ? '처리 중...' : children}</button>
  )
}

const labelSt = { fontSize: 11, fontWeight: 600, color: colors.TEXT_SECONDARY, display: 'block', marginBottom: 4 }
const inSt = {
  width: '100%', padding: '9px 12px', borderRadius: 10,
  border: `1.5px solid ${colors.BORDER}`, background: 'rgba(255,255,255,0.7)',
  fontSize: 13, color: colors.TEXT_PRIMARY, outline: 'none', boxSizing: 'border-box',
}
