import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { colors } from '../../styles/colors'

export default function LoginScreen() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) {
      setError('앗, 로그인 중 문제가 생겼어요. 다시 시도해 볼게요.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(145deg, ${colors.PRIMARY_LIGHT} 0%, ${colors.BG} 60%, #FFF8F0 100%)`,
    }}>
      <div style={{
        background: colors.SURFACE,
        borderRadius: 24,
        padding: '48px 44px',
        width: 400,
        boxShadow: '0 4px 32px rgba(27,100,218,0.08)',
        border: `1px solid ${colors.BORDER}`,
      }}>
        {/* 로고 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: `linear-gradient(135deg, ${colors.PRIMARY}, ${colors.PRIMARY_DARK})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: '#fff', fontWeight: 800,
          }}>✦</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: colors.TEXT_PRIMARY, letterSpacing: '-0.4px' }}>취트키</div>
            <div style={{ fontSize: 12, color: colors.TEXT_SECONDARY }}>AI 자소서 도우미</div>
          </div>
        </div>

        {/* 헤드라인 */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.TEXT_PRIMARY, letterSpacing: '-0.5px', marginBottom: 8 }}>
            취업 준비,<br />AI와 함께라면 달라요
          </h1>
          <p style={{ fontSize: 14, color: colors.TEXT_SECONDARY, lineHeight: 1.6 }}>
            기업분석부터 자소서 초안까지,<br />내 경험 기반으로 맞춤 작성해 드려요
          </p>
        </div>

        {/* 에이전트 소개 뱃지 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {[
            { label: '기업 분석', color: colors.PRIMARY },
            { label: '문항 분석', color: '#7C3AED' },
            { label: '자소서 작성', color: colors.SUCCESS },
          ].map(({ label, color }) => (
            <span key={label} style={{
              padding: '5px 12px', borderRadius: 99,
              background: color + '12', border: `1.5px solid ${color}28`,
              fontSize: 12, fontWeight: 600, color,
            }}>{label}</span>
          ))}
        </div>

        {/* 에러 */}
        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: 12, marginBottom: 16,
            background: colors.ERROR + '12', border: `1px solid ${colors.ERROR}30`,
            fontSize: 13, color: colors.ERROR,
          }}>{error}</div>
        )}

        {/* 로그인 버튼 */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 14,
            background: loading ? colors.BORDER : colors.PRIMARY,
            color: '#fff', fontSize: 15, fontWeight: 700,
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            transition: 'background 0.15s',
          }}
        >
          {loading ? '연결하는 중이에요...' : (
            <>
              <GoogleIcon />
              Google로 시작하기
            </>
          )}
        </button>

        <p style={{ fontSize: 12, color: colors.TEXT_SECONDARY, textAlign: 'center', marginTop: 16 }}>
          로그인하면 서비스 이용약관에 동의하는 것으로 간주해요
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}
