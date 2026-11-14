import { useState } from 'react';
import { View, Text, Image, ScrollView, KeyboardAvoidingView, Platform, Pressable, StyleSheet } from 'react-native';
import { Screen, AppInput, AppButton } from '../components';
import { useAuth } from '../context/AuthContext';
import { authErrorMessage } from '../services/authService';
import { validateLogin } from '../utils/validators';
import { colors, spacing, typography } from '../theme';

const RATE_COLOR = '#FFC83D';

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
    } catch (e) {
      setFormError(authErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Image
              source={require('../../assets/framerate-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>
              <Text style={styles.frame}>Frame</Text>
              <Text style={styles.rate}>Rate</Text>
              <Text style={styles.dot}>.</Text>
            </Text>
          </View>

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
            <Text style={styles.registerText}>
              Não tem conta? <Text style={styles.registerLink}>Cadastre-se</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoImage: {
    width: 93,
    height: 76,
    marginBottom: spacing.sm,
  },
  logoText: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
  },
  frame: {
    color: colors.primary,
  },
  rate: {
    color: RATE_COLOR,
  },
  dot: {
    color: colors.primary,
  },
  registerText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    textAlign: 'center',
  },
  registerLink: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});