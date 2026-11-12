import { useState } from 'react';
import { Text, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, AppInput, AppButton } from '../components';
import { useAuth } from '../context/AuthContext';
import { authErrorMessage } from '../services/authService';
import { validateLogin } from '../utils/validators';
import { colors, spacing, typography } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const found = validateLogin({ email, password });
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      // o AuthContext detecta o usuário e o RootNavigator troca de tela sozinho
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
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <Ionicons
            name="film"
            size={56}
            color={colors.primary}
            style={{ alignSelf: 'center' }}
          />
          <Text style={[typography.title, { textAlign: 'center', marginBottom: spacing.lg }]}>
            FrameRate
          </Text>

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
            placeholder="Sua senha"
          />

          {formError ? (
            <Text style={{ color: colors.error, marginBottom: spacing.md }}>{formError}</Text>
          ) : null}

          <AppButton title="Entrar" onPress={handleLogin} loading={loading} />

          <Pressable onPress={() => navigation.navigate('Register')} style={{ marginTop: spacing.lg }}>
            <Text style={[typography.caption, { textAlign: 'center' }]}>
              Não tem conta? <Text style={{ color: colors.primary }}>Cadastre-se</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}