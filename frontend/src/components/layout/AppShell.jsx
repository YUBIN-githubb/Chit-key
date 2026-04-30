import { useAuth } from '../../context/AuthContext'
import { colors } from '../../styles/colors'

const TABS = [
  { id: 'chat',    label: 'AI 챗봇',    icon: '💬' },
  { id: 'exp',     label: '내 경험',    icon: '📂' },
  { id: 'history', label: '이력',       icon: '🗂️' },
  { id: 'my',      label: '마이페이지', icon: '👤' },
]

export default function AppShell({ profile, apiKeyRegistered, tab, setTab, onNewChat, children }) {
  const { user, avatarUrl } = useAuth()
  const displayName = profile?.nickname || user?.email?.split('@')[0] || '?'

  return (
    <div style={{
      display: 'flex', width: '100vw', height: '100vh',
      background: `linear-gradient(145deg, #D6E4FF 0%, ${colors.BG} 45%, #E8F0FF 100%)`,
      overflow: 'hidden',
    }}>
      {/* 사이드바 */}
      <div style={{
        width: 240, flexShrink: 0,
        background: colors.SIDEBAR_GLASS,
        backdropFilter: colors.BLUR_MD,
        WebkitBackdropFilter: colors.BLUR_MD,
        borderRight: `1px solid rgba(255,255,255,0.6)`,
        display: 'flex', flexDirection: 'column',
        padding: '24px 16px',
      }}>
        {/* 로고 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 32 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 11,
            background: `linear-gradient(135deg, ${colors.PRIMARY}, ${colors.PRIMARY_DARK})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: '#fff', fontWeight: 800,
            boxShadow: `0 4px 12px ${colors.PRIMARY}40`,
          }}>✦</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: colors.TEXT_PRIMARY, letterSpacing: '-0.3px' }}>취트키</div>
            <div style={{ fontSize: 11, color: colors.TEXT_SECONDARY }}>AI 자소서 도우미</div>
          </div>
        </div>

        {/* 새 채팅 버튼 */}
        <button
          onClick={onNewChat}
          style={{
            width: '100%', padding: '11px 16px', borderRadius: 14, marginBottom: 12,
            background: `linear-gradient(135deg, ${colors.PRIMARY}, ${colors.PRIMARY_DARK})`,
            border: 'none', color: '#fff',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: `0 4px 12px ${colors.PRIMARY}40`,
          }}
        >
          <span style={{ fontSize: 16 }}>✦</span>
          <span>새 채팅 시작</span>
        </button>

        {/* 탭 네비게이션 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {TABS.map(({ id, label, icon }) => (
            <NavItem key={id} icon={icon} label={label} active={tab === id} onClick={() => setTab(id)} />
          ))}
        </div>

        {/* API Key 상태 */}
        <div
          onClick={() => setTab('my')}
          style={{
            padding: '10px 12px', borderRadius: 12, marginBottom: 12,
            background: apiKeyRegistered
              ? 'rgba(0,180,147,0.10)'
              : 'rgba(245,166,35,0.10)',
            border: `1px solid ${apiKeyRegistered ? colors.SUCCESS : colors.WARNING}30`,
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            backdropFilter: colors.BLUR_SM,
          }}
        >
          <div style={{
            width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
            background: apiKeyRegistered ? colors.SUCCESS : colors.WARNING,
          }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: apiKeyRegistered ? colors.SUCCESS : colors.WARNING }}>
            {apiKeyRegistered ? 'API 키 연결됨' : 'API 키 미등록'}
          </span>
        </div>

        {/* 유저 정보 */}
        <div
          onClick={() => setTab('my')}
          style={{
            padding: '12px 12px', borderRadius: 14,
            background: 'rgba(255,255,255,0.55)',
            border: `1px solid rgba(255,255,255,0.7)`,
            backdropFilter: colors.BLUR_SM,
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          }}
        >
          <Avatar src={avatarUrl} name={displayName} size={34} />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: colors.TEXT_PRIMARY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayName}
            </div>
            <div style={{ fontSize: 11, color: colors.TEXT_SECONDARY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

export function Avatar({ src, name, size = 34 }) {
  const initial = (name || '?')[0].toUpperCase()
  return src ? (
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${colors.PRIMARY}, ${colors.PRIMARY_DARK})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, color: '#fff', fontWeight: 700,
    }}>{initial}</div>
  )
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 16px', borderRadius: 14, border: 'none',
        background: active ? `rgba(27,100,218,0.10)` : 'transparent',
        color: active ? colors.PRIMARY : colors.TEXT_SECONDARY,
        fontSize: 14, fontWeight: active ? 700 : 500,
        transition: 'all 0.15s', cursor: 'pointer', position: 'relative', textAlign: 'left',
      }}
    >
      <span style={{ fontSize: 18, width: 22, textAlign: 'center' }}>{icon}</span>
      <span>{label}</span>
      {active && (
        <div style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          width: 3, height: 22, borderRadius: 99, background: colors.PRIMARY,
        }} />
      )}
    </button>
  )
}
