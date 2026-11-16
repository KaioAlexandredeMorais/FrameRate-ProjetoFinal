// codigo-pedro 
// Datas do Firestore chegam como Timestamp; as criadas localmente são Date.
export const toDate = (value) => value?.toDate?.() ?? (value instanceof Date ? value : null);

export function formatDate(value) {
  const date = toDate(value);
  if (!date) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()}`;
}

// Converte "dd/mm/aaaa" em Date (ou null se for inválida/futura).
export function parseDate(text) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim());
  if (!match) return null;
  const [, dd, mm, yyyy] = match.map(Number);
  const date = new Date(yyyy, mm - 1, dd);
  const valid = date.getFullYear() === yyyy && date.getMonth() === mm - 1 && date.getDate() === dd;
  return valid ? date : null;
}
