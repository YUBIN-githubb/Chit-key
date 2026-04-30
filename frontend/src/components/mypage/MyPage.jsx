import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { saveApiKey } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../layout/AppShell'
import { colors } from '../../styles/colors'

export default function MyPage({ user, profile, apiKeyRegistered, onApiKeyUpdate }) {
  const { avatarUrl } = useAuth()
  const [editing, setEditing]   = useState(false)
  const [draft, setDraft]       = useState('')
  const [show, setShow]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState(null)

  const handleSave = async () => {
    if (!draft.trim().startsWith('sk-ant-')) {
      return setError('Claude API Key는 sk-ant- 로 시작해야 해요')
    }
    setLoading(true)
    setError(null)
    try {
      await saveApiKey(draft.trim())
      setSaved(true)
      setEditing(false)
      setShow(false)
      onApiKeyUpdate?.()
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('앗, 잠깐 문제가 생겼어요. 다시 시도해 볼게요.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '36px 36px' }}>
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: colors.TEXT_PRIMARY, letterSpacing: '-0.5px', marginBottom: 4 }}>마이페이지</h2>
        <p style={{ fontSize: 13, color: colors.TEXT_SECONDARY }}>계정 정보와 API 키를 관리해요</p>
      </div>

      {/* 프로필 카드 */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar src={avatarUrl} name={profile?.nickname || user?.email || '?'} size={56} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: colors.TEXT_PRIMARY, marginBottom: 2 }}>
              {profile?.nickname || '이름 미설정'}
            </div>
            <div style={{ fontSize: 13, color: colors.TEXT_SECONDARY }}>{user?.email}</div>
          </div>
        </div>
      </Card>

      {/* API Key 카드 */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: colors.TEXT_PRIMARY, marginBottom: 4 }}>Claude API Key</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: apiKeyRegistered ? colors.SUCCESS : colors.WARNING,
              }} />
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: apiKeyRegistered ? colors.SUCCESS : colors.WARNING,
              }}>
                {apiKeyRegistered ? '등록됨' : '미등록'}
              </span>
            </div>
          </div>
          {!editing && (
            <button
              onClick={() => { setEditing(true); setDraft(''); setError(null) }}
              style={{
                padding: '8px 14px', borderRadius: 10,
                border: `1.5px solid ${colors.BORDER}`, background: colors.BG,
                fontSize: 12, fontWeight: 600, color: colors.TEXT_SECONDARY, cursor: 'pointer',
              }}
            >{apiKeyRegistered ? '변경' : '등록'}</button>
          )}
        </div>

        {saved && (
          <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 12, background: colors.SUCCESS + '12', color: colors.SUCCESS, fontSize: 13 }}>
            API Key가 저장됐어요!
          </div>
        )}

        {editing && (
          <>
            <p style={{ fontSize: 13, color: colors.TEXT_SECONDARY, marginBottom: 12 }}>
              취트키는 내 Claude API Key로 동작해요. Key는 암호화해서 안전하게 저장돼요.
            </p>
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <input
                type={show ? 'text' : 'password'}
                value={draft}
                onChange={e => { setDraft(e.target.value); setError(null) }}
                placeholder="sk-ant-..."
                autoFocus
                style={{
                  width: '100%', padding: '11px 48px 11px 14px', borderRadius: 10,
                  border: `1.5px solid ${colors.BORDER}`,
                  fontSize: 13, color: colors.TEXT_PRIMARY, outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button onClick={() => setShow(s => !s)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, color: colors.TEXT_SECONDARY,
              }}>{show ? '숨기기' : '보기'}</button>
            </div>
            {error && (
              <div style={{ padding: '8px 12px', borderRadius: 8, marginBottom: 10, background: colors.ERROR + '12', color: colors.ERROR, fontSize: 12 }}>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditing(false)} style={{
                flex: 1, padding: '10px 0', borderRadius: 10,
                border: `1.5px solid ${colors.BORDER}`, background: colors.BG,
                fontSize: 13, fontWeight: 600, color: colors.TEXT_SECONDARY, cursor: 'pointer',
              }}>취소</button>
              <button onClick={handleSave} disabled={loading || !draft.trim()} style={{
                flex: 2, padding: '10px 0', borderRadius: 10,
                background: loading || !draft.trim() ? colors.BORDER : colors.PRIMARY,
                color: loading || !draft.trim() ? colors.TEXT_SECONDARY : '#fff',
                fontSize: 13, fontWeight: 700, border: 'none',
                cursor: loading || !draft.trim() ? 'not-allowed' : 'pointer',
              }}>
                {loading ? '저장하는 중이에요...' : '저장'}
              </button>
            </div>
          </>
        )}
      </Card>

      {/* 로그아웃 */}
      <button
        onClick={handleLogout}
        style={{
          marginTop: 24, padding: '12px 20px', borderRadius: 12,
          border: `1.5px solid ${colors.BORDER}`, background: colors.SURFACE,
          fontSize: 13, fontWeight: 600, color: colors.TEXT_SECONDARY,
          cursor: 'pointer', display: 'block',
        }}
      >로그아웃</button>
    </div>
  )
}

function Card({ children, style }) {
  return (
    <div style={{
      background: colors.SURFACE_GLASS, borderRadius: 18,
      backdropFilter: colors.BLUR_SM,
      WebkitBackdropFilter: colors.BLUR_SM,
      padding: '24px 24px', border: `1px solid rgba(255,255,255,0.7)`,
      boxShadow: '0 2px 12px rgba(27,100,218,0.06)',
      ...style,
    }}>{children}</div>
  )
}
