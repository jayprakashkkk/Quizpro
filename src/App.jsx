import React,{useEffect,useMemo,useRef,useState} from 'react';
import {supabase} from './supabaseClient.js';
import {BrainCircuit,BookOpen,Check,ChevronLeft,ChevronRight,Clock3,Moon,Sun,Trophy,RotateCcw,History,Flag,ArrowRight,ChartColumn,Flame,TrendingUp,X} from 'lucide-react';
import bank from './data/questions.json';
import {makeQuiz,computeStats} from './utils/quiz.js';
import {loadAttempts,saveAttempt} from './utils/attempts.js';
const subjects=[...new Set(bank.map(q=>q.subject))], dateFmt=d=>new Date(d).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
function QuizApp({userId}){
 const [dark,setDark]=useState(()=>localStorage.getItem('theme')==='dark'),[subject,setSubject]=useState('All Subjects (Mixed)'),[screen,setScreen]=useState('home'),[quiz,setQuiz]=useState([]),[answers,setAnswers]=useState({}),[index,setIndex]=useState(0),[marked,setMarked]=useState([]),[attempts,setAttempts]=useState([]),[synced,setSynced]=useState(true),[result,setResult]=useState(null),[timerOn,setTimerOn]=useState(false),[seconds,setSeconds]=useState(900),[confirm,setConfirm]=useState(false),[notice,setNotice]=useState('');
 const current=quiz[index],answered=Object.keys(answers).length;
 useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light';localStorage.setItem('theme',dark?'dark':'light')},[dark]);
 useEffect(()=>{if(screen!=='quiz'||!timerOn)return;const id=setInterval(()=>setSeconds(s=>{if(s<=1){clearInterval(id);finish(true);return 0}return s-1}),1000);return()=>clearInterval(id)},[screen,timerOn]);
 useEffect(()=>{const key=e=>{if(screen!=='quiz'||confirm)return;if(e.key==='ArrowRight')setIndex(i=>Math.min(19,i+1));if(e.key==='ArrowLeft')setIndex(i=>Math.max(0,i-1));if('1234'.includes(e.key))pick(Number(e.key)-1)};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)});
 useEffect(()=>{let live=true;loadAttempts(userId).then(r=>{if(live){setAttempts(r.list);setSynced(r.synced)}});return()=>{live=false}},[userId]);
 const stats=useMemo(()=>computeStats(attempts),[attempts]),recent=attempts.slice(0,10);
 const score=useMemo(()=>quiz.reduce((s,q,i)=>s+(answers[i]===q.correctIndex?1:0),0),[quiz,answers]);
 function start(){try{setQuiz(makeQuiz(bank,subject,20,userId));setAnswers({});setMarked([]);setIndex(0);setSeconds(900);setResult(null);setScreen('quiz');setConfirm(false)}catch(e){setNotice(e.message)}}
 function pick(n){setAnswers(a=>({...a,[index]:n}))}
 function finish(auto=false){if(!quiz.length||result)return;const s=quiz.reduce((n,q,i)=>n+(answers[i]===q.correctIndex?1:0),0),bySubject={};quiz.forEach((q,i)=>{bySubject[q.subject]??={correct:0,total:0};bySubject[q.subject].total++;if(answers[i]===q.correctIndex)bySubject[q.subject].correct++});const r={id:Date.now(),date:new Date().toISOString(),subject,score:s,total:20,percentage:Math.round(s/20*100),bySubject,answered:Object.keys(answers).length,auto};setAttempts(a=>[r,...a]);saveAttempt(userId,r).then(ok=>{if(!ok)setSynced(false)});setResult(r);setConfirm(false);setScreen('result')}
 const wrong=quiz.map((q,i)=>({...q,userIndex:answers[i],number:i+1})).filter(q=>q.userIndex!==q.correctIndex);
 return <div className={`app ${dark?'dark':''} ${screen==='quiz'?'quiz-mode':''}`}><header className="topbar"><button className="brand" onClick={()=>setScreen('home')}><span className="logo"><BrainCircuit/></span>Quiz <b>Pro</b></button><div className="right-head"><span>Built for learners</span><button className="icon-btn" onClick={()=>setDark(v=>!v)} aria-label="Toggle dark mode">{dark?<Sun/>:<Moon/>}</button></div></header><main>
 {screen==='home'&&<div className="home"><section className="hero"><div className="eyebrow">● YOUR KNOWLEDGE, YOUR PACE</div><h1>Learn smarter.<br/><em>Score higher.</em></h1><p>Focused practice for your journey. Test your fundamentals, understand every answer, and build confidence one quiz at a time.</p><div className="ticks"><span><Check/> 20 questions per test</span><span><Check/> Instant explanations</span><span><Check/> Progress saved to your account</span></div><div className="hero-art"><div className="orbit"></div><div className="orbital-icon"><BrainCircuit/></div><div className="float f1">Practice <small>with purpose</small></div><div className="float f2">Progress <small>you can track</small></div></div></section>
 <section className="setup card"><small className="kicker">READY WHEN YOU ARE</small><h2>Start a quiz</h2><p className="muted">Choose your focus and let's get started.</p><label htmlFor="subject">Choose subject</label><div className="selectbox"><BookOpen/><select id="subject" value={subject} onChange={e=>setSubject(e.target.value)}><option>All Subjects (Mixed)</option>{subjects.map(s=><option key={s}>{s}</option>)}</select></div><div className="facts"><div><b>20 questions</b><small>Every attempt</small></div><div><b>15 minutes</b><small>Optional timer</small></div></div><label className="toggle"><span><b>Timed mode</b><small>15 minutes for the full quiz</small></span><input type="checkbox" checked={timerOn} onChange={e=>setTimerOn(e.target.checked)}/></label><button className="primary wide" onClick={start}>Start Quiz <ArrowRight/></button><small className="note">Your progress is saved to your account.</small></section>
 <section className="stats"><div className="stat"><Flame/><b>{stats.streak}</b><small>{stats.streak?'Day streak':'Start your streak today'}</small></div><div className="stat"><TrendingUp/><b>{stats.avg===null?'—':stats.avg+'%'}</b><small>Average score</small></div><div className="stat"><Trophy/><b>{stats.best===null?'—':stats.best+'/20'}</b><small>Personal best</small></div><div className="stat"><ChartColumn/><b>{stats.n}</b><small>Attempts saved</small></div></section>
 <section className="history"><div className="section-head"><div><small className="kicker">KEEP THE MOMENTUM</small><h2>Recent attempts</h2></div><span>{synced?`Last ${recent.length} attempts · synced to your account`:'Sirf is device par save hai — account sync nahi ho paa raha'}</span></div>{stats.n>0&&stats.weakest&&<div className="insight"><b>Focus area</b><span>{stats.weakest.subject} — {stats.weakest.pct}% accuracy. Isko next practise karein.{stats.strongest&&stats.strongest.subject!==stats.weakest.subject?` Strongest: ${stats.strongest.subject} (${stats.strongest.pct}%).`:''}</span></div>}{!attempts.length?<div className="empty"><History/><div><b>Your journey starts here</b><p>Your last 10 quiz attempts will show up here.</p></div></div>:recent.map(a=><div className="attempt" key={a.id}><div><b>{a.subject}</b><small>{dateFmt(a.date)}</small></div><strong>{a.score}/20 <small>{a.percentage}%</small></strong><div className="mini"><span style={{width:a.percentage+'%'}}/></div></div>)}</section></div>}
 {screen==='quiz'&&current&&<section className="quiz"><div className="quiz-head"><button className="back" onClick={()=>setScreen('home')}><ChevronLeft/> Exit quiz</button><div className="meta"><span className="pill">{current.subject}</span>{timerOn&&<span className="timer"><Clock3/>{Math.floor(seconds/60).toString().padStart(2,'0')}:{(seconds%60).toString().padStart(2,'0')}</span>}</div></div><div className="progress-label"><b>Question {index+1} <span>/ 20</span></b><span>{Math.round((index+1)/20*100)}% complete</span></div><div className="progress"><span style={{width:(index+1)/20*100+'%'}}/></div><article className="card question"><div className="question-top"><span className={'difficulty '+current.difficulty}>{current.difficulty}</span><button className={'mark '+(marked.includes(index)?'on':'')} onClick={()=>setMarked(m=>m.includes(index)?m.filter(i=>i!==index):[...m,index])}><Flag/>{marked.includes(index)?'Marked for review':'Mark for review'}</button></div><h2>{current.question}</h2><div className="options">{current.options.map((o,i)=><button key={i} className={'option '+(answers[index]===i?'selected':'')} aria-pressed={answers[index]===i} onClick={()=>pick(i)}><span>{String.fromCharCode(65+i)}</span>{o}{answers[index]===i&&<Check className="chosen"/>}</button>)}</div><div className="qfoot"><span>{answers[index]===undefined?'Select one answer':'Answer selected'}</span><b>{answered} of 20 answered</b></div></article><div className="quiz-nav"><button className="secondary" disabled={index===0} onClick={()=>setIndex(i=>i-1)}><ChevronLeft/> Previous</button><div className="dots">{quiz.map((q,i)=><button key={q.id} aria-label={`Go to question ${i+1}`} title={`Question ${i+1}`} className={`${index===i?'active':''} ${answers[i]!==undefined?'done':''} ${marked.includes(i)?'flagged':''}`} onClick={()=>setIndex(i)}/>)}</div>{index<19?<button className="primary" onClick={()=>setIndex(i=>i+1)}>Next <ChevronRight/></button>:<button className="primary" onClick={()=>setConfirm(true)}>Submit quiz <Check/></button>}</div>
 {confirm&&<div className="backdrop"><div className="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><button className="close" onClick={()=>setConfirm(false)} aria-label="Close"><X/></button><h2 id="confirm-title">Ready to submit?</h2><p className="muted">Take one last look at your progress.</p><div className="confirm-stats"><div><b>{answered}</b><small>Answered</small></div><div><b>{20-answered}</b><small>Unanswered</small></div><div><b>{marked.length}</b><small>For review</small></div></div>{answered<20&&<p className="warning">You have {20-answered} unanswered questions.</p>}<button className="primary wide" onClick={()=>finish()}>Submit and see result <ArrowRight/></button><button className="text-btn" onClick={()=>setConfirm(false)}>Keep working</button></div></div>}</section>}
 {screen==='result'&&result&&<section className="results"><button className="back" onClick={()=>setScreen('home')}><ChevronLeft/> Dashboard</button><div className="result-title"><small className="kicker">QUIZ COMPLETED</small><h1>{result.percentage>=85?'Outstanding work.':result.percentage>=60?'Nice work.':'Keep building.'}</h1><p className="muted">Every attempt is progress. Review the details to make the next one even stronger.</p></div><div className="result-grid"><div className="card score-card"><div className="ring" style={{'--deg':result.percentage*3.6+'deg'}}><div><b>{result.percentage}%</b><small>score</small></div></div><h2>{result.score}<span> / 20</span></h2><b className="grade">{result.percentage>=85?'Excellent':result.percentage>=60?'Good':'Needs Improvement'}</b><div className="scoreline"><span>Correct answers</span><b>{result.score}</b></div><div className="scoreline"><span>Incorrect / skipped</span><b>{20-result.score}</b></div></div><div className="card breakdown"><small className="kicker">YOUR PERFORMANCE</small><h2>Subject breakdown</h2>{Object.entries(result.bySubject).map(([s,v])=><div className="barrow" key={s}><div><span>{s}</span><b>{v.correct}/{v.total}</b></div><div className="bar"><span style={{width:v.correct/v.total*100+'%'}}/></div></div>)}</div></div><div className="result-actions"><button className="primary" onClick={start}><RotateCcw/> Retry (New Quiz)</button><button className="secondary" onClick={()=>setScreen('review')}>Review Wrong Answers <ArrowRight/></button></div><p className="note">{dateFmt(result.date)} · {result.subject} · saved to your account</p></section>}
 {screen==='review'&&<section className="review"><button className="back" onClick={()=>setScreen('result')}><ChevronLeft/> Back to result</button><div className="result-title"><small className="kicker">LEARN FROM EVERY QUESTION</small><h1>Review answers</h1><p className="muted">{wrong.length?`${wrong.length} incorrect or unanswered question(s).`:'Perfect score! Every answer was correct.'}</p></div>{wrong.map(q=><article className="card review-card" key={q.id}><div className="review-meta">QUESTION {q.number}<span className="pill">{q.subject}</span></div><h3>{q.question}</h3>{q.userIndex===undefined?<div className="answer skipped"><span>Your answer</span><b>Not answered</b></div>:<div className="answer wrong"><span>Your answer</span><b>{q.options[q.userIndex]}</b><X/></div>}<div className="answer correct"><span>Correct answer</span><b>{q.options[q.correctIndex]}</b><Check/></div><div className="explanation"><BrainCircuit/><div><b>Why this is correct</b><p>{q.explanation}</p></div></div></article>)}<button className="secondary" onClick={()=>setScreen('result')}><ChevronLeft/> Back to result</button></section>}
 {notice&&<div className="toast" role="status">{notice}<button onClick={()=>setNotice('')}><X/></button></div>}</main><footer><span>© {new Date().getFullYear()} Quiz Pro</span><span>Built for curious minds · Learn one question at a time</span></footer></div>
}

function validEmail(value){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()); }
function toUser(u){const m=u?.user_metadata||{};return {id:u?.id||'',firstName:m.firstName||'',lastName:m.lastName||'',email:u?.email||''};}
function friendly(err){
 const m=String(err?.message||'');
 if(/invalid login credentials/i.test(m))return 'Email ya password galat hai. Dobara try karein.';
 if(/already registered|already been registered/i.test(m))return 'Is email se account pehle se bana hua hai. Please log in karein.';
 if(/email not confirmed/i.test(m))return 'Pehle apna email confirm karein (inbox/spam me confirmation mail check karein).';
 if(/rate limit|too many|security purposes/i.test(m))return 'Bahut zyada requests ho gayi. Thodi der baad dobara try karein.';
 if(/token has expired|invalid/i.test(m)&&/token|otp/i.test(m))return 'OTP galat ya expire ho gaya hai. Naya OTP mangwayein.';
 if(/same password|different from the old/i.test(m))return 'Naya password purane password se alag hona chahiye.';
 return m||'Kuch galat ho gaya. Dobara try karein.';
}
function getInitialUser(){
 try {
  const raw = localStorage.getItem('quizpro_auth_session');
  if (raw) {
   const parsed = JSON.parse(raw);
   if (parsed?.user) return toUser(parsed.user);
  }
 } catch {}
 return null;
}
function AuthGate(){
 const [mode,setMode]=useState('login');
 const [user,setUser]=useState(getInitialUser);
 const recovering=useRef(false);
 const [first,setFirst]=useState(''),[last,setLast]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirmPassword,setConfirmPassword]=useState('');
 const [otp,setOtp]=useState(''),[resetEmail,setResetEmail]=useState('');
 const [message,setMessage]=useState(''),[messageType,setMessageType]=useState('error');
 const [resetAccountEmail,setResetAccountEmail]=useState('');
 const [busy,setBusy]=useState(false);
 const signedIn=!!user;
 useEffect(()=>{
  supabase.auth.getSession().then(({data})=>{if(data?.session&&!recovering.current)setUser(toUser(data.session.user));});
  const {data:sub}=supabase.auth.onAuthStateChange((_event,session)=>{
   if(recovering.current)return;
   setUser(session?toUser(session.user):null);
  });
  return()=>sub?.subscription?.unsubscribe?.();
 },[]);
 function notify(text,type='error'){setMessage(text);setMessageType(type)}
 async function signUp(e){
  e.preventDefault();setMessage('');
  const f=first.trim(),l=last.trim(),em=email.trim().toLowerCase();
  if(!f||!l)return notify('Please enter your first name and last name.');
  if(!validEmail(em))return notify('Please enter a valid email format, for example name@example.org.');
  if(password.length<6)return notify('Password must contain at least 6 characters.');
  setBusy(true);
  try {
   const {data,error}=await supabase.auth.signUp({email:em,password,options:{data:{firstName:f,lastName:l},emailRedirectTo:window.location.origin}});
   if(error)throw error;
   // Agar email already registered hai to Supabase fake user bhejta hai jiska identities khali hota hai
   if(data.user&&Array.isArray(data.user.identities)&&data.user.identities.length===0)throw new Error('already registered');
   if(data.session){setUser(toUser(data.user));}
   else{setMode('login');setPassword('');notify('Account ban gaya! Aapke email par confirmation link bheja gaya hai. Link par click karke confirm karein, phir log in karein.','success');}
  } catch(err){notify(friendly(err));}
  finally{setBusy(false);}
 }
 async function logIn(e){
  e.preventDefault();const em=email.trim().toLowerCase();
  if(!validEmail(em))return notify('Please enter an email address.');
  setBusy(true);
  try {
   const {data,error}=await supabase.auth.signInWithPassword({email:em,password});
   if(error)throw error;
   setUser(toUser(data.user));setMessage('');
  } catch(err){notify(friendly(err));}
  finally{setBusy(false);}
 }
 async function requestOtp(e){
  e.preventDefault();const em=resetEmail.trim().toLowerCase();
  if(!validEmail(em))return notify('Please enter a valid email address.');
  setBusy(true);
  try {
   const {error}=await supabase.auth.resetPasswordForEmail(em);
   if(error)throw error;
   setResetAccountEmail(em);setOtp('');setPassword('');setConfirmPassword('');
   notify('Agar is email se account hai to OTP bhej diya gaya hai. Inbox aur spam folder check karein.','success');setMode('verify');
  } catch(err){notify(friendly(err));}
  finally{setBusy(false);}
 }
 async function resetPass(e){
  e.preventDefault();
  if(!/^\d{6,10}$/.test(otp.trim()))return notify('Email me aaya hua OTP enter karein.');
  if(password.length<6)return notify('New password must contain at least 6 characters.');
  if(password!==confirmPassword)return notify('Passwords do not match.');
  setBusy(true);recovering.current=true;
  try {
   const {error:vErr}=await supabase.auth.verifyOtp({email:resetAccountEmail,token:otp.trim(),type:'recovery'});
   if(vErr)throw vErr;
   const {error:uErr}=await supabase.auth.updateUser({password});
   if(uErr)throw uErr;
   await supabase.auth.signOut();
   setUser(null);
   setEmail(resetAccountEmail);setResetEmail('');setOtp('');setPassword('');setConfirmPassword('');
   setMode('login');notify('Password reset ho gaya. Ab naye password se log in karein.','success');
  } catch(err){notify(friendly(err));}
  finally{recovering.current=false;setBusy(false);}
 }
 async function signOut(){await supabase.auth.signOut();setUser(null);setMode('login');setPassword('');}
 if(signedIn)return <><div className="account-strip"><span>Signed in as <b>{user.firstName} {user.lastName}</b></span><button onClick={signOut}>Log out</button></div><QuizApp userId={user.id}/></>;
 return <div className="auth-screen">
  <div className="auth-decoration auth-decoration-one"></div><div className="auth-decoration auth-decoration-two"></div>
  <div className="auth-brand"><span className="auth-logo"><BrainCircuit/></span><span>Quiz <b>Pro</b></span></div>
  <div className="auth-layout">
   <section className="auth-intro"><span className="auth-eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h1>Learn smarter.<br/><em>Score higher.</em></h1><p>Your personal space to practise, track progress, and grow your knowledge—one quiz at a time.</p><div className="auth-perks"><span><Check/> Your own learning space</span><span><Check/> Track your quiz progress</span><span><Check/> Sign in whenever you return</span></div><div className="auth-art"><div className="auth-ring"></div><div className="auth-brain"><BrainCircuit/></div><span className="auth-float auth-float-a">Practice<small>with purpose</small></span><span className="auth-float auth-float-b">Progress<small>at your pace</small></span></div></section>
   <section className="auth-card">
    {mode==='login'||mode==='signup'?<>
      <div className="auth-tabs"><button className={mode==='login'?'active':''} onClick={()=>{setMode('login');setMessage('')}}>Log in</button><button className={mode==='signup'?'active':''} onClick={()=>{setMode('signup');setMessage('')}}>Create account</button></div>
      <span className="auth-label">{mode==='login'?'WELCOME BACK':'GET STARTED FOR FREE'}</span>
      <h2>{mode==='login'?'Log in to your account':'Create your account'}</h2>
      <p className="auth-muted">{mode==='login'?'Continue your learning journey.':'Set up your personal Quiz Pro account.'}</p>
      <form onSubmit={mode==='login'?logIn:signUp}>
       {mode==='signup'&&<div className="auth-name-row"><label>First name<input autoComplete="given-name" value={first} onChange={e=>setFirst(e.target.value)} placeholder="First name" required/></label><label>Last name<input autoComplete="family-name" value={last} onChange={e=>setLast(e.target.value)} placeholder="Last name" required/></label></div>}
       <label>Email address<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.org" required/></label>
       <label>Password<input type="password" autoComplete={mode==='login'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode==='login'?'Enter your password':'At least 6 characters'} minLength={6} required/></label>
       {mode==='login'&&<button className="auth-forgot" type="button" onClick={()=>{setResetEmail(email);setMode('forgot');setMessage('')}}>Forgot password?</button>}
       {message&&mode!=='verify'&&<div className={'auth-message '+messageType} role="alert">{message}</div>}
       <button className="auth-submit" type="submit" disabled={busy}>{mode==='login'?'Log in':'Create account'} <ArrowRight/></button>
      </form>
      <p className="auth-switch">{mode==='login'?"Don't have an account?":"Already have an account?"} <button onClick={()=>{setMode(mode==='login'?'signup':'login');setMessage('')}}>{mode==='login'?'Sign up':'Log in'}</button></p>
      <p className="auth-footnote">Apne email aur password se kabhi bhi wapas log in karein. Password bhul jaye to Forgot password? par click karein.</p>
    </>:mode==='forgot'?<>
      <button className="auth-back" onClick={()=>{setMode('login');setMessage('')}}><ChevronLeft/> Back to login</button>
      <span className="auth-label">ACCOUNT RECOVERY</span><h2>Forgot password?</h2><p className="auth-muted">Enter the email used for your account.</p>
      <form onSubmit={requestOtp}><label>Email address<input type="email" value={resetEmail} onChange={e=>setResetEmail(e.target.value)} placeholder="you@example.org" required/></label>{message&&<div className={'auth-message '+messageType} role="alert">{message}</div>}<button className="auth-submit" type="submit" disabled={busy}>Continue <ArrowRight/></button></form>
    </>:<>
      <button className="auth-back" onClick={()=>{setMode('login');setMessage('')}}><ChevronLeft/> Back to login</button>
      <span className="auth-label">VERIFY & RESET</span><h2>Reset your password</h2><p className="auth-muted">Account: {resetAccountEmail}</p>
      <form onSubmit={resetPass}><label>One-time password (OTP)<input inputMode="numeric" value={otp} onChange={e=>setOtp(e.target.value)} placeholder="Enter 6-digit OTP" maxLength={6} required/></label><div className="auth-demo-otp"><b>Check your email for the OTP</b><small>The code expires after 10 minutes. Check spam/junk if it does not appear.</small></div><label>New password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required/></label><label>Confirm new password<input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Re-enter new password" minLength={6} required/></label>{message&&<div className={'auth-message '+messageType} role="alert">{message}</div>}<button className="auth-submit" type="submit" disabled={busy}>Save new password <Check/></button></form>
    </>}
   </section>
  </div>
  <footer className="auth-footer">© {new Date().getFullYear()} Quiz Pro <span>Built for curious minds</span></footer>
 </div>;
}
export default function App(){return <AuthGate/>;}

