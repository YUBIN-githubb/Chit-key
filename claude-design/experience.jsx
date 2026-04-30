// components/experience.jsx — Experience management tab
const { useState: useStateExp, useEffect: useEffectExp } = React;

const TAGS = ['인턴','프로젝트','동아리','대외활동','봉사활동','아르바이트','학술','기타'];
const TAG_COLORS = {
  '인턴':'#5468FF','프로젝트':'#8B5CF6','동아리':'#0EA5E9',
  '대외활동':'#10B981','봉사활동':'#F59E0B','아르바이트':'#EF4444',
  '학술':'#EC4899','기타':'#6B7280',
};

function ExpTag({ label }) {
  const color = TAG_COLORS[label] || '#6B7280';
  return (
    <span style={{
      padding:'3px 10px',borderRadius:99,fontSize:11,fontWeight:600,
      background: color + '15', color, border:`1px solid ${color}25`,
    }}>{label}</span>
  );
}

function ExpCard({ exp, onEdit, onDelete }) {
  const [hover, setHover] = useStateExp(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background:'#fff',borderRadius:18,padding:'22px 22px',
        border: hover ? '1.5px solid #A0ABFF' : '1.5px solid #E8EAFA',
        transition:'all 0.2s ease',
        boxShadow: hover ? '0 8px 28px rgba(84,104,255,0.10)' : '0 2px 8px rgba(84,104,255,0.04)',
        cursor:'default',position:'relative',
      }}
    >
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
        <div>
          <div style={{fontSize:16,fontWeight:700,color:'#1A1A2E',marginBottom:4}}>{exp.title}</div>
          <div style={{fontSize:13,color:'#52526E'}}>{exp.role} · {exp.period}</div>
        </div>
        {hover && (
          <div style={{display:'flex',gap:6}} className="anim-fadeIn">
            <button onClick={() => onEdit(exp)} style={{
              width:32,height:32,borderRadius:8,background:'#F5F6FF',
              color:'#52526E',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',
            }}>✏️</button>
            <button onClick={() => onDelete(exp.id)} style={{
              width:32,height:32,borderRadius:8,background:'#FFF0F0',
              color:'#EF4444',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',
            }}>🗑</button>
          </div>
        )}
      </div>

      {exp.desc && (
        <p style={{
          fontSize:13,color:'#52526E',lineHeight:1.65,
          marginBottom: exp.tags?.length ? 12 : 0,
          display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',
        }}>{exp.desc}</p>
      )}

      {exp.tags?.length > 0 && (
        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
          {exp.tags.map(t => <ExpTag key={t} label={t} />)}
        </div>
      )}
    </div>
  );
}

// ── Add/Edit Modal ────────────────────────────────────────────────────────────
function ExpModal({ exp: initExp, onSave, onClose }) {
  const [form, setForm] = useStateExp(initExp || { title:'', role:'', period:'', desc:'', tags:[] });

  const update = (k, v) => setForm(prev => ({...prev, [k]: v}));
  const toggleTag = t => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(t) ? prev.tags.filter(x => x !== t) : [...prev.tags, t],
    }));
  };

  const valid = form.title.trim() && form.role.trim() && form.period.trim();

  const inputStyle = {
    width:'100%',height:48,borderRadius:12,
    border:'1.5px solid #E8EAFA',background:'#F5F6FF',
    padding:'0 14px',fontSize:14,color:'#1A1A2E',
    transition:'border 0.2s',
  };

  return (
    <div style={{
      position:'fixed',inset:0,background:'rgba(26,26,46,0.45)',
      display:'flex',alignItems:'center',justifyContent:'center',
      zIndex:1000,backdropFilter:'blur(4px)',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="anim-fadeUp" style={{
        background:'#fff',borderRadius:24,padding:'36px 36px',width:480,
        boxShadow:'0 16px 64px rgba(84,104,255,0.18)',
        maxHeight:'90vh',overflowY:'auto',
      }}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
          <h3 style={{fontSize:20,fontWeight:800,letterSpacing:'-0.3px'}}>
            {initExp ? '경험 수정' : '새 경험 추가'}
          </h3>
          <button onClick={onClose} style={{
            width:34,height:34,borderRadius:10,background:'#F5F6FF',
            color:'#52526E',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',
          }}>×</button>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {[
            {k:'title', label:'활동/경험 이름', ph:'예: 스타트업 마케팅 인턴'},
            {k:'role',  label:'역할',           ph:'예: 콘텐츠 마케터'},
            {k:'period',label:'활동 기간',       ph:'예: 2023.07 – 2023.12'},
          ].map(f => (
            <div key={f.k}>
              <label style={{fontSize:12,fontWeight:600,color:'#52526E',display:'block',marginBottom:6}}>{f.label}</label>
              <input
                value={form[f.k]}
                onChange={e => update(f.k, e.target.value)}
                placeholder={f.ph}
                style={inputStyle}
                onFocus={e => e.target.style.border='1.5px solid #A0ABFF'}
                onBlur={e => e.target.style.border='1.5px solid #E8EAFA'}
              />
            </div>
          ))}

          <div>
            <label style={{fontSize:12,fontWeight:600,color:'#52526E',display:'block',marginBottom:6}}>주요 내용</label>
            <textarea
              value={form.desc}
              onChange={e => update('desc', e.target.value)}
              placeholder="이 경험에서 무엇을 했고 어떤 성과를 냈는지 적어주세요"
              rows={4}
              style={{
                ...inputStyle,height:'auto',padding:'12px 14px',
                resize:'vertical',lineHeight:1.6,
              }}
              onFocus={e => e.target.style.border='1.5px solid #A0ABFF'}
              onBlur={e => e.target.style.border='1.5px solid #E8EAFA'}
            />
          </div>

          <div>
            <label style={{fontSize:12,fontWeight:600,color:'#52526E',display:'block',marginBottom:8}}>태그</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {TAGS.map(t => {
                const active = form.tags?.includes(t);
                const color = TAG_COLORS[t] || '#6B7280';
                return (
                  <button key={t} onClick={() => toggleTag(t)} style={{
                    padding:'6px 14px',borderRadius:99,fontSize:12,fontWeight:600,
                    background: active ? color : '#F5F6FF',
                    color: active ? '#fff' : '#52526E',
                    border: active ? `1.5px solid ${color}` : '1.5px solid #E8EAFA',
                    transition:'all 0.15s', whiteSpace:'nowrap',
                  }}>{t}</button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{display:'flex',gap:10,marginTop:28}}>
          <button onClick={onClose} style={{
            flex:1,height:50,borderRadius:13,background:'#F5F6FF',
            color:'#52526E',fontSize:15,fontWeight:600,
          }}>취소</button>
          <button onClick={() => valid && onSave(form)} disabled={!valid} style={{
            flex:2,height:50,borderRadius:13,
            background: valid ? 'linear-gradient(135deg,#5468FF,#7C84FF)' : '#E8EAFA',
            color: valid ? '#fff' : '#9CA3B8',
            fontSize:15,fontWeight:700,
            boxShadow: valid ? '0 4px 16px rgba(84,104,255,0.28)' : 'none',
            transition:'all 0.2s',cursor: valid ? 'pointer' : 'not-allowed',
          }}>저장하기</button>
        </div>
      </div>
    </div>
  );
}

// ── EXPERIENCE SCREEN ─────────────────────────────────────────────────────────
function ExperienceScreen({ experiences, setExperiences }) {
  const [modal, setModal] = useStateExp(null); // null | 'add' | { exp object }

  const handleSave = (form) => {
    if (typeof modal === 'object' && modal?.id) {
      setExperiences(prev => prev.map(e => e.id === modal.id ? {...form, id: modal.id} : e));
    } else {
      setExperiences(prev => [...prev, { ...form, id: Date.now() }]);
    }
    setModal(null);
  };

  const handleDelete = (id) => {
    setExperiences(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div style={{flex:1,overflowY:'auto',padding:'36px 36px'}}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:32}}>
        <div>
          <h2 style={{fontSize:22,fontWeight:800,letterSpacing:'-0.5px',marginBottom:6}}>내 경험 관리</h2>
          <p style={{fontSize:13,color:'#52526E'}}>등록된 경험 {experiences.length}개 · 자소서 작성 시 자동으로 활용돼요</p>
        </div>
        <button
          onClick={() => setModal('add')}
          style={{
            height:44,padding:'0 20px',borderRadius:12,
            background:'linear-gradient(135deg,#5468FF,#7C84FF)',
            color:'#fff',fontSize:14,fontWeight:700,
            boxShadow:'0 4px 16px rgba(84,104,255,0.28)',
            display:'flex',alignItems:'center',gap:8,flexShrink:0,
          }}
        >
          <span style={{fontSize:18}}>+</span> 경험 추가
        </button>
      </div>

      {experiences.length === 0 ? (
        <div style={{
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
          padding:'60px 0',color:'#9CA3B8',
        }}>
          <div style={{fontSize:52,marginBottom:16}}>📂</div>
          <p style={{fontSize:16,fontWeight:600,marginBottom:8,color:'#52526E'}}>아직 등록된 경험이 없어요</p>
          <p style={{fontSize:13,marginBottom:24}}>경험을 추가하면 자소서 작성에 활용할 수 있어요</p>
          <button onClick={() => setModal('add')} style={{
            padding:'12px 28px',borderRadius:12,
            background:'linear-gradient(135deg,#5468FF,#7C84FF)',
            color:'#fff',fontSize:14,fontWeight:700,
          }}>첫 경험 추가하기</button>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:16}}>
          {experiences.map((exp, i) => (
            <div key={exp.id} className="anim-fadeUp" style={{animationDelay: `${i*0.05}s`}}>
              <ExpCard exp={exp} onEdit={setModal} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <ExpModal
          exp={typeof modal === 'object' ? modal : null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

Object.assign(window, { ExperienceScreen });
