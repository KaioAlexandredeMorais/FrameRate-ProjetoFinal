import { useState } from 'react';
import { Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Screen, AppInput, AppButton } from '../components';
import { useAuth } from '../context/AuthContext';
import { authErrorMessage } from '../services/authService';
import { validateRegister } from '../utils/validators';
import { colors, spacing } from '../theme';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    const found = validateRegister({ name, email, password, confirm });
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
    } catch (e) {
      setFormError(authErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingVertical: spacing.lg }}
          keyboardShouldPersistTaps="handled"
        >
          <AppInput label="Nome" value={name} onChangeText={setName} error={errors.name} placeholder="Seu nome" />
          <AppInput
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="voce@email.com"
          />
          <AppInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            placeholder="Mínimo 6 caracteres"
          />
          <AppInput
            label="Confirmar senha"
            value={confirm}
            onChangeText={setConfirm}
            error={errors.confirm}
            secureTextEntry
            placeholder="Repita a senha"
          />

          {formError ? (
            <Text style={{ color: colors.error, marginBottom: spacing.md }}>{formError}</Text>
          ) : null}

          <AppButton title="Criar conta" onPress={handleRegister} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}