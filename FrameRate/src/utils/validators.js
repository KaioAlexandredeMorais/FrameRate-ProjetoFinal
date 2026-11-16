export const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email.trim());

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Informe o e-mail.';
  else if (!isValidEmail(email)) errors.email = 'E-mail inválido.';
  if (!password) errors.password = 'Informe a senha.';
  return errors;
}

// mudou-pedro: início (validação do formulário de avaliação)
export const REVIEW_TEXT_MAX = 500;

// `watchedAt` é o texto digitado (dd/mm/aaaa); `parsedDate` é o Date já convertido (ou null).
export function validateReview({ rating, text, watchedAt, parsedDate }) {
  const errors = {};
  if (!rating) errors.rating = 'Toque nas estrelas para dar uma nota.';
  if (text.length > REVIEW_TEXT_MAX) errors.text = `O comentário pode ter no máximo ${REVIEW_TEXT_MAX} caracteres.`;
  if (!watchedAt.trim()) errors.watchedAt = 'Informe quando você assistiu.';
  else if (!parsedDate) errors.watchedAt = 'Data inválida. Use o formato dd/mm/aaaa.';
  else if (parsedDate.getTime() > Date.now()) errors.watchedAt = 'A data não pode estar no futuro.';
  return errors;
}
// mudou-pedro: fim

export function validateRegister({ name, email, password, confirm }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Informe seu nome.';
  if (!email.trim()) errors.email = 'Informe o e-mail.';
  else if (!isValidEmail(email)) errors.email = 'E-mail inválido.';
  if (password.length < 6) errors.password = 'A senha deve ter pelo menos 6 caracteres.';
  if (confirm !== password) errors.confirm = 'As senhas não coincidem.';
  return errors;
}