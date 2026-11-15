// codigo-pedro 
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Mostra a notificação mesmo com o app aberto.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensurePermission() {
    if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Lembretes',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    } catch (e) {
      // Alguns aparelhos/versões do Expo Go falham aqui; o Android usa o canal padrão.
      console.warn('Canal de notificação não criado, usando o padrão:', e.message);
    }
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

// Próxima ocorrência das 20h (hoje, se ainda não passou; senão amanhã).
export function nextEvening() {
  const date = new Date();
  date.setHours(20, 0, 0, 0);
  if (date.getTime() <= Date.now()) date.setDate(date.getDate() + 1);
  return date;
}

// Retorna a data agendada, ou null se o usuário negou a permissão.
export async function scheduleMovieReminder(title, date = nextEvening()) {
  const allowed = await ensurePermission();
  if (!allowed) return null;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Hora do cinema 🎬',
      body: `Que tal assistir "${title}" hoje?`,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });
  return date;
}
