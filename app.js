const API = "https://script.google.com/macros/s/AKfycbwTZgjljUvoG6D6zQMezpPnuL8alfMab74x_5pzACvBxfwR8FA0CgE-suK1Um-gb1NZ/exec";

const BOSSES = ["카스파","데스나이트","거대여왕개미","드레이크","흑장로","안타라스","바이아키스","발라카스","자켄","코어","오르펜","퀸앤트","기타(직접입력)"];

const C = {
  primary:"#4f46e5", danger:"#dc2626", success:"#16a34a", warn:"#d97706",
  muted:"#888", border:"#e5e7eb", bg:"#f9fafb", card:"#fff",
};

const { useState, useEffect, useRef } = React;

async function api(params) {
  const r = await fetch("/api/sheets?" + new URLSearchParams(params));
  return r.json();
}
async function apiPost(body) {
  const params = { action: body.action, data: JSON.stringify(body.data || {}), id: body.id || "" };
  const r = await fetch("/api/sheets?" + new URLSearchParams(params));
  return r.json();
}
function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(sessionStorage.getItem("botam_user")); } catch { return null; } });
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [favorites, setFavorites] = useState(() => { try { return JSON.parse(localStorage.getItem("botam_favorites")) || []; } catch { return []; } });

  useEffect(() => { if (user) fetchSessions(); }, [user]);

  const saveFavorites = (list) => {
    setFavorites(list);
    localStorage.setItem("botam_favorites", JSON.stringify(list));
  };

  const fetchSessions = async () => {
    setLoading(true);
    const data = await api({ action: "getSessions" });
    setSessions(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleLogin = (u) => { sessionStorage.setItem("botam_user", JSON.stringify(u)); setUser(u); };
  const handleLogout = () => { sessionStorage.removeItem("botam_user"); setUser(null); setSessions([]); setView("list"); };
  const goList = () => { setView("list"); setSelectedId(null); fetchSessions(); };
  const session = sessions.find(s => String(s.id) === String(selectedId));

  if (!user) return React.createElement(Login, { onLogin: handleLogin });

  return React.createElement("div", { style:{maxWidth:800,margin:"0 auto",padding:"1rem 1rem 3rem"} },
    React.createElement(Header, { user, view, goList, onLogout: handleLogout, onFav: ()=>setView("favorites") }),
    loading && React.createElement("p", { style:{textAlign:"center",color:C.muted,padding:"2rem"} }, "불러오는 중..."),
    !loading && view==="list" && React.createElement(SessionList, { sessions, onSelect: id=>{setSelectedId(id);setView("detail");}, onNew:()=>setView("new") }),
    !loading && view==="new" && React.createElement(NewSession, { onDone: goList, favorites }),
    !loading && view==="detail" && session && React.createElement(SessionDetail, { session, onBack: goList, onUpdate: fetchSessions }),
    !loading && view==="favorites" && React.createElement(FavoritesManager, { favorites, save: saveFavorites, onBack: goList }),
  );
}

function Login({ onLogin }) {
  const [id, setId] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    const r = await api({ action:"login", id, pw });
    if (r.ok) { setErr(""); onLogin(r.user); }
    else { setErr("아이디 또는 비밀번호가 틀렸습니다."); }
    setLoading(false);
  };
  return React.createElement("div", { style:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"} },
    React.createElement("div", { style:{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"2rem",width:320,boxShadow:"0 4px 24px #0001"} },
      React.createElement("p", { style:{fontWeight:600,fontSize:20,textAlign:"center",marginBottom:4} }, "⚔️ 하이네 서버 삼국"),
      React.createElement("p", { style:{fontWeight:500,fontSize:15,textAlign:"center",color:C.primary,marginBottom:6} }, "보탐 정산기"),
      React.createElement("p", { style:{fontSize:12,color:C.muted,textAlign:"center",marginBottom:24} }, "리니지 클래식"),
      React.createElement("label", { style:{fontSize:13,color:C.muted} }, "캐릭터 ID"),
      React.createElement("input", { value:id, onChange:e=>setId(e.target.value), placeholder:"아이디", style:{width:"100%",marginBottom:10,marginTop:4} }),
      React.createElement("label", { style:{fontSize:13,color:C.muted} }, "비밀번호"),
      React.createElement("input", { type:"password", value:pw, onChange:e=>setPw(e.target.value), placeholder:"비밀번호", style:{width:"100%",marginBottom:16,marginTop:4}, onKeyDown:e=>e.key==="Enter"&&handle() }),
      err && React.createElement("p", { style:{color:C.danger,fontSize:12,marginBottom:8} }, err),
      React.createElement("button", { onClick:handle, disabled:loading, style:{width:"100%",background:C.primary,color:"#fff",border:"none",borderRadius:8,padding:"10px 0",fontSize:14} }, loading?"확인 중...":"로그인"),
    )
  );
}

function Header({ user, view, goList, onLogout, onFav }) {
  return React.createElement("div", { style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,borderBottom:`1px solid ${C.border}`,paddingBottom:12} },
    React.createElement("div", { style:{display:"flex",alignItems:"center",gap:10} },
      view!=="list" && React.createElement("button", { onClick:goList, style:{fontSize:13,color:C.muted,background:"none",border:"none",padding:0} }, "← 목록"),
      React.createElement("span", { style:{fontWeight:600,fontSize:15} }, "⚔️ 하이네 서버 삼국 보탐 정산기"),
      React.createElement("span", { style:{fontSize:11,background:C.bg,padding:"2px 8px",borderRadius:6,color:C.muted,border:`1px solid ${C.border}`} }, `${user.role}: ${user.id}`),
    ),
    React.createElement("div", { style:{display:"flex",gap:6} },
      view==="list" && React.createElement("button", { onClick:onFav, style:{fontSize:12,color:C.muted,border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 10px"} }, "⭐ 멤버관리"),
      React.createElement("button", { onClick:onLogout, style:{fontSize:12,color:C.muted,border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 10px"} }, "로그아웃"),
    ),
  );
}

function FavoritesManager({ favorites, save, onBack }) {
  const [input, setInput] = useState("");
  const add = () => {
    const names = input.split(/[\n,，\s]+/).map(s=>s.trim()).filter(Boolean);
    save([...new Set([...favorites, ...names])]);
    setInput("");
  };
  const remove = (name) => save(favorites.filter(f=>f!==name));
  const moveUp = (i) => { if(i===0) return; const l=[...favorites]; [l[i-1],l[i]]=[l[i],l[i-1]]; save(l); };
  const moveDown = (i) => { if(i===favorites.length-1) return; const l=[...favorites]; [l[i],l[i+1]]=[l[i+1],l[i]]; save(l); };

  return React.createElement("div", null,
    React.createElement("p", { style:{fontWeight:500,fontSize:15,marginBottom:14} }, "⭐ 혈맹 멤버 관리"),
    React.createElement("div", { style:{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"1.25rem",marginBottom:12} },
      React.createElement("p", { style:{fontSize:13,color:C.muted,marginBottom:8} }, "멤버 추가 (쉼표 또는 줄바꿈으로 여러 명 한번에)"),
      React.createElement("div", { style:{display:"flex",gap:8,marginBottom:16} },
        React.createElement("textarea", { value:input, onChange:e=>setInput(e.target.value), placeholder:"예) 둘리, 용회, DD", rows:2, style:{flex:1,resize:"none"} }),
        React.createElement("button", { onClick:add, style:{padding:"0 16px",background:C.primary,color:"#fff",border:"none",borderRadius:8,fontSize:13} }, "추가"),
      ),
      React.createElement("p", { style:{fontSize:13,fontWeight:500,marginBottom:8} }, `등록된 멤버 ${favorites.length}명`),
      favorites.length===0 && React.createElement("p", { style:{fontSize:13,color:C.muted,textAlign:"center",padding:"1rem"} }, "등록된 멤버가 없습니다."),
      ...favorites.map((name,i)=>
        React.createElement("div", { key:name, style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`} },
          React.createElement("span", { style:{fontSize:13} }, name),
          React.createElement("div", { style:{display:"flex",gap:6} },
            React.createElement("button", { onClick:()=>moveUp(i), style:{fontSize:11,padding:"2px 6px",borderRadius:4,border:`1px solid ${C.border}`} }, "↑"),
            React.createElement("button", { onClick:()=>moveDown(i), style:{fontSize:11,padding:"2px 6px",borderRadius:4,border:`1px solid ${C.border}`} }, "↓"),
            React.createElement("button", { onClick:()=>remove(name), style:{fontSize:11,padding:"2px 6px",borderRadius:4,border:`1px solid ${C.danger}`,color:C.danger,background:"none"} }, "삭제"),
          ),
        )
      ),
    ),
  );
}

function SessionList({ sessions, onSelect, onNew }) {
  const totalAde = sessions.reduce((a,s)=>a+(Number(s.totalAde)||0),0);
  const allMembers = [...new Set(sessions.flatMap(s=>s.members||[]))];
  return React.createElement("div", null,
    React.createElement("div", { style:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20} },
      ...[["총 정산 회차",sessions.length+"회"],["누적 아데나",totalAde.toLocaleString()+" A"],["총 참여자",allMembers.length+"명"]].map(([l,v])=>
        React.createElement("div", { key:l, style:{background:C.bg,borderRadius:8,padding:"10px 14px",border:`1px solid ${C.border}`} },
          React.createElement("p", { style:{fontSize:12,color:C.muted,margin:0} }, l),
          React.createElement("p", { style:{fontSize:17,fontWeight:600,margin:"4px 0 0"} }, v),
        )
      )
    ),
    React.createElement("div", { style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10} },
      React.createElement("span", { style:{fontSize:14,fontWeight:500} }, "정산 내역"),
      React.createElement("button", { onClick:onNew, style:{background:C.primary,color:"#fff",border:"none",borderRadius:8,padding:"6px 14px",fontSize:13} }, "+ 새 정산"),
    ),
    sessions.length===0 && React.createElement("p", { style:{color:C.muted,textAlign:"center",padding:"2rem"} }, "아직 정산 내역이 없습니다."),
    ...[...sessions].reverse().map(s=>
      React.createElement("div", { key:s.id, onClick:()=>onSelect(s.id), style:{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 16px",marginBottom:8,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"} },
        React.createElement("div", null,
          React.createElement("p", { style:{margin:0,fontWeight:500,fontSize:14} }, `#${s.id} ${s.boss}`),
          React.createElement("p", { style:{margin:"2px 0 0",fontSize:12,color:C.muted} }, `${s.date} · ${(s.members||[]).length}명`),
        ),
        React.createElement("div", { style:{textAlign:"right"} },
          React.createElement("p", { style:{margin:0,fontWeight:600,color:C.primary} }, `${Number(s.totalAde||0).toLocaleString()} A`),
          React.createElement("p", { style:{margin:"2px 0 0",fontSize:11,color:s.allPaid?C.success:C.warn} }, s.allPaid?"정산완료":"정산중"),
        ),
      )
    ),
  );
}

function NewSession({ onDone, favorites }) {
  const [boss, setBoss] = useState(BOSSES[0]);
  const [bossCustom, setBossCustom] = useState("");
  const today = new Date(); const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
  const fmt = d => d.toISOString().slice(0,10);
  const [dateVal, setDateVal] = useState(fmt(today));
  const [ampm, setAmpm] = useState("오후"); const [hour, setHour] = useState("10"); const [minute, setMinute] = useState("00");
  const [memberInput, setMemberInput] = useState(""); const [members, setMembers] = useState([]);
  const [items, setItems] = useState([{name:"",price:""}]); const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);

  const addMembers = (raw) => { const names=raw.split(/[\n,，、\s]+/).map(s=>s.trim()).filter(Boolean); setMembers(p=>[...new Set([...p,...names])]); };
  const toggleFav = (name) => {
    if (members.includes(name)) setMembers(p=>p.filter(x=>x!==name));
    else setMembers(p=>[...new Set([...p, name])]);
  };

  const totalAde = items.reduce((a,i)=>a+(parseInt(i.price)||0),0);
  const perAde = members.length>0 ? Math.floor(totalAde/members.length) : 0;

  const submit = async () => {
    if (!members.length) return alert("참여자를 추가해주세요.");
    const bossName = boss==="기타(직접입력)" ? (bossCustom||"기타") : boss;
    const h24 = ampm==="오전" ? (hour==="12"?"00":hour.padStart(2,"0")) : (hour==="12"?"12":(parseInt(hour)+12)+"");
    const dateStr = `${dateVal} ${h24}:${minute}`;
    setSaving(true);
    await apiPost({ action:"addSession", data:{ date:dateStr, boss:bossName, members, items:items.filter(i=>i.name), totalAde, perAde, memo, payments:members.map(m=>({name:m,paid:false})) } });
    setSaving(false); onDone();
  };

  const sl={fontSize:13,color:C.muted,marginBottom:4,display:"block"};
  const row={marginBottom:14};

  return React.createElement("div", null,
    React.createElement("p", { style:{fontWeight:500,fontSize:15,marginBottom:14} }, "새 보탐 정산 등록"),
    React.createElement("div", { style:{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"1.25rem"} },
      React.createElement("div", { style:row },
        React.createElement("label", { style:sl }, "보스명"),
        React.createElement("select", { value:boss, onChange:e=>setBoss(e.target.value), style:{width:"100%"} }, BOSSES.map(b=>React.createElement("option",{key:b},b))),
        boss==="기타(직접입력)" && React.createElement("input", { value:bossCustom, onChange:e=>setBossCustom(e.target.value), placeholder:"보스명 직접 입력", style:{width:"100%",marginTop:6} }),
      ),
      React.createElement("div", { style:row },
        React.createElement("label", { style:sl }, "일시"),
        React.createElement("div", { style:{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"} },
          React.createElement("div", { style:{display:"flex",gap:6} },
            ...[["오늘",fmt(today)],["내일",fmt(tomorrow)]].map(([l,v])=>React.createElement("button",{key:l,onClick:()=>setDateVal(v),style:{fontSize:12,padding:"5px 10px",borderRadius:6,border:`1px solid ${dateVal===v?C.primary:C.border}`,background:dateVal===v?"#ede9fe":"#fff",color:dateVal===v?C.primary:"#111"}},l)),
            React.createElement("input", { type:"date", value:dateVal, onChange:e=>setDateVal(e.target.value), style:{fontSize:12,padding:"5px 8px",borderRadius:6,border:`1px solid ${C.border}`} }),
          ),
          React.createElement("div", { style:{display:"flex",gap:6,alignItems:"center"} },
            React.createElement("select", { value:ampm, onChange:e=>setAmpm(e.target.value) }, React.createElement("option",null,"오전"), React.createElement("option",null,"오후")),
            React.createElement("select", { value:hour, onChange:e=>setHour(e.target.value) }, ["12","1","2","3","4","5","6","7","8","9","10","11"].map(h=>React.createElement("option",{key:h},h))),
            React.createElement("span", { style:{color:C.muted} }, ":"),
            React.createElement("select", { value:minute, onChange:e=>setMinute(e.target.value) }, ["00","10","15","20","30","40","45","50"].map(m=>React.createElement("option",{key:m},m))),
          ),
        ),
      ),
      React.createElement("div", { style:row },
        React.createElement("label", { style:sl }, "참여자"),
        favorites.length>0 && React.createElement("div", { style:{marginBottom:10} },
          React.createElement("p", { style:{fontSize:12,color:C.muted,marginBottom:6} }, "⭐ 혈맹 멤버 — 클릭으로 추가/제거"),
          React.createElement("div", { style:{display:"flex",flexWrap:"wrap",gap:6} },
            ...favorites.map(name=>
              React.createElement("button", { key:name, onClick:()=>toggleFav(name), style:{fontSize:12,padding:"4px 10px",borderRadius:6,border:`1px solid ${members.includes(name)?C.primary:C.border}`,background:members.includes(name)?"#ede9fe":"#fff",color:members.includes(name)?C.primary:"#111",fontWeight:members.includes(name)?500:400} }, members.includes(name)?"✓ "+name:name)
            ),
          ),
        ),
        React.createElement("div", { style:{display:"flex",gap:8,marginTop:8} },
          React.createElement("input", { value:memberInput, onChange:e=>setMemberInput(e.target.value), placeholder:"기타 닉네임 직접 입력 (쉼표/엔터 구분)", style:{flex:1}, onKeyDown:e=>{if(e.key==="Enter"){addMembers(memberInput);setMemberInput("");}} }),
          React.createElement("button", { onClick:()=>{addMembers(memberInput);setMemberInput("");} }, "추가"),
        ),
        React.createElement("div", { style:{display:"flex",flexWrap:"wrap",gap:6,marginTop:8,minHeight:28} },
          ...members.filter(m=>!favorites.includes(m)).map(m=>
            React.createElement("span",{key:m,style:{background:C.bg,borderRadius:6,padding:"3px 9px",fontSize:12,display:"flex",alignItems:"center",gap:4,border:`1px solid ${C.border}`}},
              m, React.createElement("span",{onClick:()=>setMembers(p=>p.filter(x=>x!==m)),style:{cursor:"pointer",color:C.danger,fontSize:10}}, "✕")
            )
          ),
          members.length>0 && React.createElement("span",{style:{fontSize:12,color:C.muted,alignSelf:"center"}}, `총 ${members.length}명`),
        ),
      ),
      React.createElement("div", { style:row },
        React.createElement("label", { style:sl }, "판매 아이템 및 가격 (아데나)"),
        ...items.map((item,i)=>React.createElement("div",{key:i,style:{display:"flex",gap:8,marginBottom:6}},
          React.createElement("input",{value:item.name,onChange:e=>{const n=[...items];n[i].name=e.target.value;setItems(n);},placeholder:"아이템명",style:{flex:2}}),
          React.createElement("input",{value:item.price,onChange:e=>{const n=[...items];n[i].price=e.target.value.replace(/\D/g,"");setItems(n);},placeholder:"가격(A)",style:{flex:1}}),
          items.length>1 && React.createElement("button",{onClick:()=>setItems(items.filter((_,j)=>j!==i)),style:{fontSize:11,color:C.danger,border:"none",background:"none"}},"삭제"),
        )),
        React.createElement("button",{onClick:()=>setItems([...items,{name:"",price:""}]),style:{fontSize:12,color:C.primary,background:"none",border:"none",padding:0}},"+  아이템 추가"),
        totalAde>0 && React.createElement("div",{style:{marginTop:8,padding:"8px 12px",background:C.bg,borderRadius:8,fontSize:13,border:`1px solid ${C.border}`}},
          "합계 ", React.createElement("b",null,totalAde.toLocaleString()," A"), " → 1인당 ", React.createElement("b",{style:{color:C.primary}},perAde.toLocaleString()," A"), ` (${members.length}명 기준)`
        ),
      ),
      React.createElement("div", { style:row },
        React.createElement("label", { style:sl }, "메모"),
        React.createElement("textarea",{value:memo,onChange:e=>setMemo(e.target.value),rows:2,placeholder:"특이사항, 누락자 등",style:{width:"100%",resize:"vertical"}}),
      ),
      React.createElement("div",{style:{display:"flex",gap:8,justifyContent:"flex-end"}},
        React.createElement("button",{onClick:onDone,style:{padding:"7px 16px",borderRadius:8}},"취소"),
        React.createElement("button",{onClick:submit,disabled:saving,style:{padding:"7px 16px",borderRadius:8,background:C.primary,color:"#fff",border:"none"}},saving?"저장 중...":"정산 등록"),
      ),
    ),
  );
}

function SessionDetail({ session, onBack, onUpdate }) {
  const [s, setS] = useState(session);
  const save = async (updated) => { setS(updated); await apiPost({ action:"updateSession", data:updated }); onUpdate(); };
  const togglePaid = (name) => { const payments=s.payments.map(p=>p.name===name?{...p,paid:!p.paid}:p); save({...s,payments,allPaid:payments.every(p=>p.paid)}); };
  const markAll = (paid) => { const payments=s.payments.map(p=>({...p,paid})); save({...s,payments,allPaid:paid}); };
  const del = async () => { if(!confirm("이 정산을 삭제할까요?"))return; await apiPost({action:"deleteSession",id:s.id}); onBack(); };
  const exportCSV = () => {
    const rows=[["캐릭터","배분금액(A)","지급완료"],...s.payments.map(p=>[p.name,s.perAde,p.paid?"Y":"N"])];
    const a=document.createElement("a"); a.href="data:text/csv;charset=utf-8,\uFEFF"+encodeURIComponent(rows.map(r=>r.join(",")).join("\n")); a.download=`보탐정산_${s.id}_${s.boss}.csv`; a.click();
  };
  const paid=s.payments.filter(p=>p.paid).length; const total=s.payments.length; const pct=total?Math.round(paid/total*100):0;

  return React.createElement("div", null,
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}},
      React.createElement("div",null,
        React.createElement("p",{style:{margin:0,fontWeight:600,fontSize:16}},`#${s.id} ${s.boss}`),
        React.createElement("p",{style:{margin:"3px 0 0",fontSize:12,color:C.muted}},s.date),
      ),
      React.createElement("div",{style:{display:"flex",gap:6}},
        React.createElement("span",{style:{fontSize:12,padding:"3px 10px",borderRadius:6,background:s.allPaid?"#dcfce7":"#fef9c3",color:s.allPaid?C.success:C.warn}},s.allPaid?"정산완료":"정산중"),
        React.createElement("button",{onClick:exportCSV,style:{fontSize:11,padding:"4px 10px",borderRadius:6,border:`1px solid ${C.border}`}},"CSV"),
        React.createElement("button",{onClick:del,style:{fontSize:11,padding:"4px 10px",borderRadius:6,border:`1px solid ${C.danger}`,color:C.danger,background:"none"}},"삭제"),
      ),
    ),
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}},
      ...[["참여인원",total+"명"],["총 아데나",Number(s.totalAde||0).toLocaleString()+" A"],["1인 배분",Number(s.perAde||0).toLocaleString()+" A"]].map(([l,v])=>
        React.createElement("div",{key:l,style:{background:C.bg,borderRadius:8,padding:"10px 14px",border:`1px solid ${C.border}`}},
          React.createElement("p",{style:{fontSize:12,color:C.muted,margin:0}},l),
          React.createElement("p",{style:{fontSize:16,fontWeight:600,margin:"4px 0 0"}},v),
        )
      )
    ),
    s.items?.filter(i=>i.name).length>0 && React.createElement("div",{style:{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 16px",marginBottom:12}},
      React.createElement("p",{style:{margin:"0 0 8px",fontSize:13,fontWeight:500}},"판매 아이템"),
      ...s.items.filter(i=>i.name).map((item,i)=>React.createElement("div",{key:i,style:{display:"flex",justifyContent:"space-between",fontSize:13,padding:"4px 0",borderBottom:`1px solid ${C.border}`}},
        React.createElement("span",null,item.name), React.createElement("span",{style:{fontWeight:500}},parseInt(item.price||0).toLocaleString()+" A"),
      )),
    ),
    React.createElement("div",{style:{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 16px",marginBottom:12}},
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}},
        React.createElement("p",{style:{margin:0,fontSize:13,fontWeight:500}},`배분 체크리스트 `,React.createElement("span",{style:{color:C.muted,fontWeight:400}},`(${paid}/${total} · ${pct}%)`)),
        React.createElement("div",{style:{display:"flex",gap:6}},
          React.createElement("button",{onClick:()=>markAll(true),style:{fontSize:11,padding:"3px 8px",borderRadius:5,border:`1px solid ${C.border}`}},"전체완료"),
          React.createElement("button",{onClick:()=>markAll(false),style:{fontSize:11,padding:"3px 8px",borderRadius:5,border:`1px solid ${C.border}`}},"전체취소"),
        ),
      ),
      React.createElement("div",{style:{height:5,background:C.bg,borderRadius:4,marginBottom:12}},
        React.createElement("div",{style:{height:5,background:C.primary,borderRadius:4,width:`${pct}%`,transition:"width .3s"}}),
      ),
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:6}},
        ...s.payments.map(p=>React.createElement("div",{key:p.name,onClick:()=>togglePaid(p.name),style:{display:"flex",alignItems:"center",gap:6,padding:"6px 10px",borderRadius:7,border:`1px solid ${p.paid?"#16a34a":C.border}`,background:p.paid?"#f0fdf4":C.bg,cursor:"pointer"}},
          React.createElement("span",{style:{fontSize:13}},p.paid?"✅":"⬜"),
          React.createElement("span",{style:{fontSize:12,fontWeight:p.paid?500:400,color:p.paid?C.success:"#111"}},p.name),
        ))
      ),
    ),
    s.memo && React.createElement("div",{style:{background:C.bg,borderRadius:10,padding:"10px 14px",border:`1px solid ${C.border}`}},
      React.createElement("p",{style:{margin:"0 0 4px",fontSize:12,color:C.muted}},"메모"),
      React.createElement("p",{style:{margin:0,fontSize:13,whiteSpace:"pre-wrap"}},s.memo),
    ),
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
