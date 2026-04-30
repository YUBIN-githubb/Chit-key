import { useState } from 'react'
import { updateMe, saveApiKey } from '../../services/api'
import { colors } from '../../styles/colors'

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep]         = useState(1)
  const [nickname, setNickname] = useState('')
  const [apiKey, setApiKey]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const handleStep1 = async () => {
    if (!nickname.trim()) return setError('닉네임을 입력해 주세요')
    setLoading(true)
    setError(null)
    try {
      await updateMe({ nickname: nickname.trim() })
      setStep(2)
    } catch {
      setError('앗, 잠깐 문제가 생겼어요. 다시 시도해 볼게요.')
    } finally {
      setLoading(false)
    }
  }

  const handleStep2 = async () => {
    if (!apiKey.trim().startsWith('sk-ant-')) {
      return setError('Claude API Key는 sk-ant- 로 시작해야 해요')
    }
    setLoading(true)
    setError(null)
    try {
      await saveApiKey(apiKey.trim())
      await updateMe({ onboarding_completed: true })
      onComplete()
    } catch {
      setError('앗, 잠깐 문제가 생겼어요. 다시 시도해 볼게요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: colors.BG,
    }}>
      <div style={{
        background: colors.SURFACE, borderRadius: 24,
        padding: '48px 44px', width: 440,
        boxShadow: '0 4px 32px rgba(27,100,218,0.08)',
        border: `1px solid ${colors.BORDER}`,
      }}>
        {/* 진행률 */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 36 }}>
          {[1, 2].map(n => (
            <div key={n} style={{
              flex: 1, height: 4, borderRadius: 99,
              background: n <= step ? colors.PRIMARY : colors.BORDER,
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {step === 1 ? (
          <Step1
            nickname={nickname}
            setNickname={setNickname}
            onNext={handleStep1}
            loading={loading}
            error={error}
            setError={setError}
          />
        ) : (
          <Step2
            apiKey={apiKey}
            setApiKey={setApiKey}
            onComplete={handleStep2}
            loading={loading}
            error={error}
            setError={setError}
          />
        )}
      </div>
    </div>
  )
}

function Step1({ nickname, setNickname, onNext, loading, error, setError }) {
  return (
    <>
      <p style={{ fontSize: 13, color: colors.TEXT_SECONDARY, marginBottom: 8 }}>1/2 단계</p>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: colors.TEXT_PRIMARY, letterSpacing: '-0.5px', marginBottom: 8 }}>
        어떻게 불러드릴까요?
      </h2>
      <p style={{ fontSize: 14, color: colors.TEXT_SECONDARY, marginBottom: 32, lineHeight: 1.6 }}>
        취트키가 이름으로 친근하게 도와드릴게요
      </p>

      <input
        type="text"
        placeholder="예: 유빈, 지원자"
        value={nickname}
        onChange={e => { setNickname(e.target.value); setError(null) }}
        onKeyDown={e => e.key === 'Enter' && onNext()}
        style={inputStyle}
        autoFocus
      />

      {error && <ErrorMsg msg={error} />}

      <button onClick={onNext} disabled={loading || !nickname.trim()} style={btnStyle(loading || !nickname.trim())}>
        {loading ? '저장하는 중이에요...' : '다음으로'}
      </button>
    </>
  )
}

function Step2({ apiKey, setApiKey, onComplete, loading, error, setError }) {
  const [show, setShow] = useState(false)

  return (
    <>
      <p style={{ fontSize: 13, color: colors.TEXT_SECONDARY, marginBottom: 8 }}>2/2 단계</p>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: colors.TEXT_PRIMARY, letterSpacing: '-0.5px', marginBottom: 8 }}>
        Claude API Key를 연결해요
      </h2>
      <p style={{ fontSize: 14, color: colors.TEXT_SECONDARY, marginBottom: 8, lineHeight: 1.6 }}>
        취트키는 내 Claude API Key로 동작해요.<br />
        Key는 암호화해서 안전하게 저장돼요.
      </p>
      <a
        href="https://console.anthropic.com/"
        target="_blank"
        rel="noreferrer"
        style={{ fontSize: 13, color: colors.PRIMARY, fontWeight: 600, display: 'block', marginBottom: 28 }}
      >
        아직 없다면 여기서 발급할 수 있어요 →
      </a>

      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          placeholder="sk-ant-..."
          value={apiKey}
          onChange={e => { setApiKey(e.target.value); setError(null) }}
          onKeyDown={e => e.key === 'Enter' && onComplete()}
          style={{ ...inputStyle, paddingRight: 48 }}
          autoFocus
        />
        <button
          onClick={() => setShow(s => !s)}
          style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, color: colors.TEXT_SECONDARY,
          }}
        >{show ? '숨기기' : '보기'}</button>
      </div>

      {error && <ErrorMsg msg={error} />}

      <button onClick={onComplete} disabled={loading || !apiKey.trim()} style={btnStyle(loading || !apiKey.trim())}>
        {loading ? '연결하는 중이에요...' : '시작하기'}
      </button>
    </>
  )
}

function ErrorMsg({ msg }) {
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 10, margin: '12px 0',
      background: colors.ERROR + '12', border: `1px solid ${colors.ERROR}30`,
      fontSize: 13, color: colors.ERROR,
    }}>{msg}</div>
  )
}

const inputStyle = {
  width: '100%', padding: '13px 16px', borderRadius: 12,
  border: `1.5px solid ${colors.BORDER}`,
  fontSize: 14, color: colors.TEXT_PRIMARY,
  outline: 'none', marginBottom: 16,
  transition: 'border-color 0.15s',
}

const btnStyle = (disabled) => ({
  width: '100%', padding: '14px 0', borderRadius: 14,
  background: disabled ? colors.BORDER : colors.PRIMARY,
  color: disabled ? colors.TEXT_SECONDARY : '#fff',
  fontSize: 15, fontWeight: 700,
  border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
  marginTop: 4, transition: 'background 0.15s',
})
