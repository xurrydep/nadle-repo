import { supabase } from './supabaseClient'

export async function saveScore(username, score) {
  const { data, error } = await supabase
    .from('leaderboard')
    .insert([
      { username, score }
    ])

  if (error) {
    console.error('Error saving score:', error)
  } else {
    console.log('Score saved:', data)
  }
}
