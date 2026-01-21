import { AuthTabs } from '@/components/auth-tabs';
import Loader from '@/components/loader';
import { useToast } from '@/context/ToastContext';
import { authService } from '@/services/auth.service';
import { styles } from '@/styles/register.styles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storage } from '@/utils/storage';

type AuthTab = 'signin' | 'register';

export default function AuthScreen() {
  const router = useRouter();
  const { showError, showSuccess, showWarning } = useToast();
  const [activeTab, setActiveTab] = useState<AuthTab>('signin');

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sign in form fields
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');

  // Register form fields
  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleBack = () => {
    router.back();
  };

  // Sign in validation
  const validateSignInForm = () => {
    if (!signinEmail.trim()) {
      showError('Please enter your email address');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signinEmail)) {
      showError('Please enter a valid email address');
      return false;
    }

    if (!signinPassword) {
      showError('Please enter your password');
      return false;
    }

    return true;
  };

  // Register validation
  const validateRegisterForm = () => {
    if (!fullName.trim()) {
      showError('Please enter your full name');
      return false;
    }

    if (!registerEmail.trim()) {
      showError('Please enter your email address');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail)) {
      showError('Please enter a valid email address');
      return false;
    }

    if (!registerPassword) {
      showError('Please enter a password');
      return false;
    }

    if (registerPassword.length < 6) {
      showError('Password must be at least 6 characters long');
      return false;
    }

    if (registerPassword !== confirmPassword) {
      showError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSignIn = async () => {
    if (!validateSignInForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({
        email: signinEmail.trim().toLowerCase(),
        password: signinPassword,
      });

      if (response.success) {
        await storage.saveTokens(
          response.data.accessToken,
          response.data.refreshToken
        );

        await storage.saveUserData(response.data.user);

        if (!response.data.user.isEmailVerified) {
          router.push({
            pathname: '/(auth)/verify-email',
            params: { email: signinEmail.trim().toLowerCase() }
          });
          showWarning('Please verify your email address to continue.');
        } else {
          showSuccess('Sign in successful!');
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);

      if (error.statusCode === 401) {
        showError('The email or password you entered is incorrect. Please try again.');
      } else {
        showError(error.message || 'An error occurred during sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateRegisterForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const userEmail = registerEmail.trim().toLowerCase();

      const response = await authService.register({
        fullName: fullName.trim(),
        email: userEmail,
        password: registerPassword,
      });

      if (response.success) {
        await storage.saveTokens(
          response.data.accessToken,
          response.data.refreshToken
        );

        await storage.saveUserData(response.data.user);

        // Check if email verification is required
        if (!response.data.user.isEmailVerified) {
          showSuccess('Registration successful! Please verify your email.');
          router.push({
            pathname: '/(auth)/verify-email',
            params: { email: userEmail }
          });
        } else {
          showSuccess('Registration successful! Welcome to Rhapsody TV!');
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      showError(error.message || 'An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >

      {/* Blue Background Section */}
      <View style={styles.blueSection} />

      {/* Back Button */}
      <Pressable
        onPress={handleBack}
        style={styles.backButton}
        hitSlop={8}
      >
        <Ionicons name="chevron-back" size={20} color="#FAFAFA" />
      </Pressable>

      {/* Welcome Text */}
      <Text style={styles.welcomeText}>
        Welcome to{'\n'}Rhapsody TV
      </Text>

      {/* Auth Tabs */}
      <View style={styles.tabsContainer}>
        <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </View>

      {/* Form Container */}
      <ScrollView
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {activeTab === 'signin' ? (
          <>
            {/* Sign In Form */}
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, focusedField === 'signinEmail' && styles.inputFocused]}
              placeholder="Email Address"
              placeholderTextColor="#999"
              value={signinEmail}
              onChangeText={setSigninEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setFocusedField('signinEmail')}
              onBlur={() => setFocusedField(null)}
              editable={!isLoading}
            />

            <Text style={styles.label}>Password</Text>
            <View style={[styles.passwordContainer, focusedField === 'signinPassword' && styles.passwordContainerFocused]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#999"
                value={signinPassword}
                onChangeText={setSigninPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('signinPassword')}
                onBlur={() => setFocusedField(null)}
                editable={!isLoading}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                hitSlop={8}
                disabled={isLoading}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={24}
                  color="#999"
                />
              </Pressable>
            </View>

            <Pressable style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password</Text>
            </Pressable>

            <Pressable
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              <Text style={styles.registerButtonText}>Sign In</Text>
            </Pressable>
          </>
        ) : (
          <>
            {/* Register Form */}
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, focusedField === 'fullName' && styles.inputFocused]}
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
              onFocus={() => setFocusedField('fullName')}
              onBlur={() => setFocusedField(null)}
              autoCorrect={false}
              editable={!isLoading}
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, focusedField === 'registerEmail' && styles.inputFocused]}
              placeholder="Email Address"
              placeholderTextColor="#999"
              value={registerEmail}
              onChangeText={setRegisterEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setFocusedField('registerEmail')}
              onBlur={() => setFocusedField(null)}
              editable={!isLoading}
            />

            <Text style={styles.label}>Password</Text>
            <View style={[styles.passwordContainer, focusedField === 'registerPassword' && styles.passwordContainerFocused]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#999"
                value={registerPassword}
                onChangeText={setRegisterPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('registerPassword')}
                onBlur={() => setFocusedField(null)}
                editable={!isLoading}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                hitSlop={8}
                disabled={isLoading}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={24}
                  color="#999"
                />
              </Pressable>
            </View>

            <Text style={styles.label}>Confirm Password</Text>
            <View style={[styles.passwordContainer, focusedField === 'confirmPassword' && styles.passwordContainerFocused]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                editable={!isLoading}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
                hitSlop={8}
                disabled={isLoading}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={24}
                  color="#999"
                />
              </Pressable>
            </View>

            <Pressable
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.registerButtonText}>Register</Text>
            </Pressable>
          </>
        )}

        {isLoading && <Loader />}

        <Text style={styles.orText}>OR</Text>

        <Pressable style={styles.kingschatButton}>
          <Text style={styles.kingschatButtonText}>Sign In with KingsChat</Text>
          <Image
            source={require('@/assets/Icons/KC.png')}
            style={styles.kingschatIcon}
            resizeMode="contain"
          />
        </Pressable>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
