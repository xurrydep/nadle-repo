import { supabase } from './supabaseClient';

/**
 * Skoru Supabase veritabanına kaydeder.
 * @param {string} name - Oyuncunun adı
 * @param {number} time - Oyuncunun süresi (skoru)
 * @param {number} attempts - Oyuncunun deneme sayısı
 */
export async function saveScoreToDatabase(name, time, attempts) {
  if (!name || typeof time !== 'number' || typeof attempts !== 'number') {
    console.warn("Geçersiz isim, süre veya deneme sayısı:", { name, time, attempts });
    return;
  }

  const { data, error } = await supabase
    .from('leaderboard')
    .insert([{ name, time, attempts }]);

  if (error) {
    console.error('Skor kaydedilirken hata oluştu:', error.message);
  } else {
    console.log('Skor başarıyla kaydedildi:', data);
  }
}
