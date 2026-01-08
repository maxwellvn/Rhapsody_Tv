import { AuthTabs } from '@/components/auth-tabs';
import { styles } from '@/styles/register.styles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        <AuthTabs activeTab="register" />
      </View>

      {/* Form Container */}
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* Full Name */}
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={[styles.input, focusedField === 'fullName' && styles.inputFocused]}
          placeholder="Full Name"
          placeholderTextColor="#999"
          onFocus={() => setFocusedField('fullName')}
          onBlur={() => setFocusedField(null)}
        />

        {/* Username */}
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={[styles.input, focusedField === 'username' && styles.inputFocused]}
          placeholder="Username"
          placeholderTextColor="#999"
          onFocus={() => setFocusedField('username')}
          onBlur={() => setFocusedField(null)}
        />

        {/* Email Address */}
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={[styles.input, focusedField === 'email' && styles.inputFocused]}
          placeholder="Email Address"
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

        {/* Confirm Password */}
        <Text style={styles.label}>Confirm Password</Text>
        <View style={[styles.passwordContainer, focusedField === 'confirmPassword' && styles.passwordContainerFocused]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            secureTextEntry={!showConfirmPassword}
            onFocus={() => setFocusedField('confirmPassword')}
            onBlur={() => setFocusedField(null)}
          />
          <Pressable
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
              size={24}
              color="#999"
            />
          </Pressable>
        </View>

        {/* Register Button */}
        <Pressable 
          style={styles.registerButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.registerButtonText}>Register</Text>
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
