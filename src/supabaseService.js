import { supabase } from './supabaseClient';

export async function saveScore(username, score, attempt, duration) {
  if (!username || username.trim() === '') {
    console.error('Username is empty, not saving score.');
    return;
  }

  const { data, error } = await supabase
    .from('leaderboard')
    .insert([{ username, score, attempt, duration }]);

  if (error) {
    console.error('Error saving score:', error);
  } else {
    console.log('Score saved:', data);
  }
}
