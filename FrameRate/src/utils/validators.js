export const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email.trim());

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Informe o e-mail.';
  else if (!isValidEmail(email)) errors.email = 'E-mail inválido.';
  if (!password) errors.password = 'Informe a senha.';
  return errors;
}

export function validateRegister({ name, email, password, confirm }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Informe seu nome.';
  if (!email.trim()) errors.email = 'Informe o e-mail.';
  else if (!isValidEmail(email)) errors.email = 'E-mail inválido.';
  if (password.length < 6) errors.password = 'A senha deve ter pelo menos 6 caracteres.';
  if (confirm !== password) errors.confirm = 'As senhas não coincidem.';
  return errors;
}