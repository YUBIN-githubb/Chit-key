// components/mypage.jsx — My Page with API key management
const { useState: useStateMy, useRef: useRefMy } = React;

function MaskKey(key) {
  if (!key) return '';
  if (key.length <= 12) return '••••••••••••';
  return key.slice(0, 10) + '••••••••••••' + key.slice(-4);
}

function MyPage({ user, apiKey, setApiKey }) {
  const [editing, setEditing] = useStateMy(false);
  const [draft, setDraft] = useStateMy(apiKey || '');
  const [show, setShow] = useStateMy(false);
  const [focused, setFocused] = useStateMy(false);
  const [saved, setSaved] = useStateMy(false);

  const valid = draft.trim().startsWith('sk-ant-');

  const handleSave = () => {
    setApiKey(draft.trim());
    setEditing(false);
    setShow(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDelete = () => {
    setApiKey('');
    setDraft('');
    setEditing(false);
    setShow(false);
  };

  const handleEdit = () => {
    setDraft(apiKey || '');
    setEditing(true);
    setSaved(false);
  };

  return (
    <div style={{flex:1, overflowY:'auto', padding:'36px 36px'}}>
      {/* Header */}
      <div style={{marginBottom:36}}>
        <h2 style={{fontSize:22,fontWeight:800,letterSpacing:'-0.5px',marginBottom:6}}>마이페이지</h2>
        <p style={{fontSize:13,color:'#52526E'}}>계정 정보와 API 키를 관리해요</p>
      </div>

      {/* Profile card */}
      <div style={{
        background:'#fff',borderRadius:20,padding:'28px 28px',
        border:'1.5px solid #E8EAFA',marginBottom:20,
        boxShadow:'0 2px 12px rgba(84,104,255,0.05)',
      }}>
        <div style={{fontSize:13,fontWeight:700,color:'#9CA3B8',marginBottom:16,letterSpacing:'0.5px'}}>프로필</div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{
            width:56,height:56,borderRadius:'50%',
            background:'linear-gradient(135deg,#5468FF,#8B5CF6)',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:22,color:'#fff',fontWeight:800,flexShrink:0,
          }}>{(user?.name||'?')[0]}</div>
          <div>
            <div style={{fontSize:17,fontWeight:800,color:'#1A1A2E',marginBottom:3}}>{user?.name || '사용자'}</div>
            <div style={{fontSize:13,color:'#52526E'}}>{user?.email || 'user@gmail.com'}</div>
            <div style={{
              display:'inline-flex',alignItems:'center',gap:5,marginTop:6,
              padding:'3px 10px',borderRadius:99,
              background:'#EEF0FF',
            }}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#5468FF'}} />
              <span style={{fontSize:11,fontWeight:600,color:'#5468FF'}}>Google 계정 연동됨</span>
            </div>
          </div>
        </div>
      </div>

      {/* API Key card */}
      <div style={{
        background:'#fff',borderRadius:20,padding:'28px 28px',
        border:'1.5px solid #E8EAFA',
        boxShadow:'0 2px 12px rgba(84,104,255,0.05)',
      }}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:'#9CA3B8',marginBottom:4,letterSpacing:'0.5px'}}>AI 엔진</div>
            <div style={{fontSize:17,fontWeight:800,color:'#1A1A2E',whiteSpace:'nowrap'}}>Anthropic API 키</div>
          </div>
          {apiKey && !editing && (
            <div style={{
              display:'flex',alignItems:'center',gap:5,
              padding:'5px 12px',borderRadius:99,
              background:'#EFFDF8',border:'1px solid #10B98125',
            }}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#10B981'}} />
              <span style={{fontSize:12,fontWeight:600,color:'#10B981',whiteSpace:'nowrap'}}>연결됨</span>
            </div>
          )}
          {!apiKey && !editing && (
            <div style={{
              display:'flex',alignItems:'center',gap:5,
              padding:'5px 12px',borderRadius:99,
              background:'#FFF7ED',border:'1px solid #F59E0B25',
            }}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#F59E0B'}} />
              <span style={{fontSize:12,fontWeight:600,color:'#F59E0B',whiteSpace:'nowrap'}}>미등록</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{
          background:'#F5F6FF',borderRadius:12,padding:'12px 16px',
          marginBottom:20,display:'flex',flexDirection:'column',gap:6,
        }}>
          {[
            '🔒 API 키는 암호화되어 안전하게 저장돼요',
            '💡 Anthropic Console(console.anthropic.com)에서 발급받을 수 있어요',
          ].map(t => (
            <div key={t} style={{fontSize:12,color:'#52526E'}}>{t}</div>
          ))}
        </div>

        {/* Current key display */}
        {!editing ? (
          <div>
            <label style={{fontSize:12,fontWeight:600,color:'#52526E',display:'block',marginBottom:8}}>
              현재 API 키
            </label>
            <div style={{
              height:48,borderRadius:12,border:'1.5px solid #E8EAFA',
              background:'#F5F6FF',padding:'0 14px',
              display:'flex',alignItems:'center',justifyContent:'space-between',
              marginBottom:16,
            }}>
              <span style={{fontSize:14,color: apiKey ? '#1A1A2E' : '#9CA3B8',fontFamily:'monospace',letterSpacing:'0.5px'}}>
                {apiKey ? MaskKey(apiKey) : '등록된 API 키가 없어요'}
              </span>
              {apiKey && (
                <button onClick={() => setShow(s => !s)} style={{
                  background:'transparent',color:'#9CA3B8',fontSize:16,
                }}>{show ? '🙈' : '👁'}</button>
              )}
            </div>
            {show && apiKey && (
              <div className="anim-fadeIn" style={{
                background:'#1A1A2E',borderRadius:12,padding:'12px 16px',
                marginBottom:16,overflowX:'auto',
              }}>
                <code style={{fontSize:12,color:'#A0ABFF',letterSpacing:'0.5px',wordBreak:'break-all'}}>
                  {apiKey}
                </code>
              </div>
            )}

            {saved && (
              <div className="anim-fadeIn" style={{
                display:'flex',alignItems:'center',gap:8,
                padding:'10px 16px',borderRadius:12,
                background:'#EFFDF8',border:'1px solid #10B98125',
                marginBottom:16,
              }}>
                <span style={{fontSize:16}}>✅</span>
                <span style={{fontSize:13,fontWeight:600,color:'#10B981'}}>API 키가 저장됐어요!</span>
              </div>
            )}

            <div style={{display:'flex',gap:10}}>
              <button onClick={handleEdit} style={{
                flex:1,height:48,borderRadius:12,
                background:'linear-gradient(135deg,#5468FF,#7C84FF)',
                color:'#fff',fontSize:14,fontWeight:700,
                boxShadow:'0 4px 14px rgba(84,104,255,0.25)',cursor:'pointer',
              }}>{apiKey ? '키 변경하기' : '키 등록하기'}</button>
              {apiKey && (
                <button onClick={handleDelete} style={{
                  width:48,height:48,borderRadius:12,
                  background:'#FFF0F0',color:'#EF4444',fontSize:18,
                  display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
                }}>🗑</button>
              )}
            </div>
          </div>
        ) : (
          <div className="anim-fadeUp">
            <label style={{fontSize:12,fontWeight:600,color:'#52526E',display:'block',marginBottom:8}}>
              새 API 키 입력
            </label>
            <div style={{
              display:'flex',alignItems:'center',
              border: focused ? '1.5px solid #A0ABFF' : '1.5px solid #E8EAFA',
              borderRadius:12,background:'#F5F6FF',overflow:'hidden',
              marginBottom:8,transition:'border 0.2s',
            }}>
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                type={show ? 'text' : 'password'}
                placeholder="sk-ant-api03-..."
                autoFocus
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                  flex:1,height:48,background:'transparent',
                  padding:'0 14px',fontSize:14,color:'#1A1A2E',
                }}
              />
              <button onClick={() => setShow(s => !s)} style={{
                padding:'0 14px',height:48,background:'transparent',
                color:'#9CA3B8',fontSize:16,
              }}>{show ? '🙈' : '👁'}</button>
            </div>
            {draft && !valid && (
              <p style={{fontSize:11,color:'#EF4444',marginBottom:12}}>
                올바른 형식이 아니에요 (sk-ant-로 시작해야 해요)
              </p>
            )}
            {valid && (
              <p className="anim-fadeIn" style={{fontSize:11,color:'#10B981',marginBottom:12}}>
                ✓ API 키 형식이 올바르네요!
              </p>
            )}
            <div style={{display:'flex',gap:10,marginTop:4}}>
              <button onClick={() => { setEditing(false); setShow(false); }} style={{
                flex:1,height:48,borderRadius:12,
                background:'#F5F6FF',color:'#52526E',fontSize:14,fontWeight:600,cursor:'pointer',
              }}>취소</button>
              <button onClick={handleSave} disabled={!valid} style={{
                flex:2,height:48,borderRadius:12,
                background: valid ? 'linear-gradient(135deg,#5468FF,#7C84FF)' : '#E8EAFA',
                color: valid ? '#fff' : '#9CA3B8',
                fontSize:14,fontWeight:700,
                boxShadow: valid ? '0 4px 14px rgba(84,104,255,0.25)' : 'none',
                transition:'all 0.2s',cursor: valid ? 'pointer' : 'not-allowed',
              }}>저장하기</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { MyPage });
