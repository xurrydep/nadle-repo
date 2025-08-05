import { supabase } from './supabaseClient';

/**
 * Skoru Supabase veritabanına kaydeder.
 * @param {string} name - Oyuncunun adı
 * @param {number} score - Oyuncunun skoru
 */
export async function saveScoreToDatabase(name, score) {
  if (!name || typeof score !== 'number') {
    console.warn("Geçersiz isim veya skor verisi:", { name, score });
    return;
  }

  const { data, error } = await supabase
    .from('leaderboard')
    .insert([{ name, score }]);

  if (error) {
    console.error('Skor kaydedilirken hata oluştu:', error.message);
  } else {
    console.log('Skor başarıyla kaydedildi:', data);
  }
}
