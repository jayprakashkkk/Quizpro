import { supabase } from '../supabaseClient.js';

// Har user ke attempts uske account (Supabase table "quiz_attempts") me save hote hain.
// Table na ho ya internet na ho to is device par user-wise backup use hota hai.
const lsKey = uid => 'quizpro-attempts-' + uid;
const readLocal = uid => { try { return JSON.parse(localStorage.getItem(lsKey(uid)) || '[]'); } catch { return []; } };
const writeLocal = (uid, list) => { try { localStorage.setItem(lsKey(uid), JSON.stringify(list.slice(0, 200))); } catch {} };

export async function loadAttempts(uid) {
  const local = readLocal(uid);
  try {
    const { data, error } = await supabase
      .from('quiz_attempts').select('id,data').eq('user_id', uid)
      .order('id', { ascending: false }).limit(200);
    if (error) throw error;
    const remote = data.map(r => r.data);
    const remoteIds = new Set(remote.map(a => a.id));
    const missing = local.filter(a => !remoteIds.has(a.id));
    if (missing.length) {
      supabase.from('quiz_attempts')
        .upsert(missing.map(a => ({ id: a.id, user_id: uid, data: a })), { onConflict: 'user_id,id', ignoreDuplicates: true })
        .then(() => {}, () => {});
    }
    const merged = [...remote, ...missing].sort((a, b) => b.id - a.id).slice(0, 200);
    writeLocal(uid, merged);
    return { list: merged, synced: true };
  } catch {
    return { list: local, synced: false };
  }
}

export async function saveAttempt(uid, attempt) {
  writeLocal(uid, [attempt, ...readLocal(uid)]);
  try {
    const { error } = await supabase.from('quiz_attempts').insert({ id: attempt.id, user_id: uid, data: attempt });
    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}
