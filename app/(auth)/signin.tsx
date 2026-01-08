import { AuthTabs } from '@/components/auth-tabs';
import { styles } from '@/styles/register.styles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export default function SignInScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Blue Background Section */}
      <View style={styles.blueSection} />
      
      {/* Back Button */}
      <Pressable
        onPress={handleBack}
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={20} color="#FAFAFA" />
      </Pressable>

      {/* Welcome Text */}
      <Text style={styles.welcomeText}>
        Welcome to{'\n'}Rhapsody TV
      </Text>

      {/* Auth Tabs */}
      <View style={styles.tabsContainer}>
        <AuthTabs activeTab="signin" />
      </View>

      {/* Form Container */}
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* Email Address or Username */}
        <Text style={styles.label}>Email Address or Username</Text>
        <TextInput
          style={[styles.input, focusedField === 'email' && styles.inputFocused]}
          placeholder="Email Address or Username"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          onFocus={() => setFocusedField('email')}
          onBlur={() => setFocusedField(null)}
        />

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View style={[styles.passwordContainer, focusedField === 'password' && styles.passwordContainerFocused]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={24}
              color="#999"
            />
          </Pressable>
        </View>

        {/* Forgot Password Link */}
        <Pressable style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot Password</Text>
        </Pressable>

        {/* Sign In Button */}
        <Pressable style={[styles.registerButton, { marginTop: 100 }]}>
          <Text style={styles.registerButtonText}>Sign In</Text>
        </Pressable>

        {/* OR Divider */}
        <Text style={styles.orText}>OR</Text>

        {/* KingsChat Button */}
        <Pressable style={styles.kingschatButton}>
          <Text style={styles.kingschatButtonText}>Sign In with KingsChat</Text>
          <Image
            source={require('@/assets/Icons/KC.png')}
            style={styles.kingschatIcon}
            resizeMode="contain"
          />
        </Pressable>
      </ScrollView>
    </View>
  );
}
