import { useToast } from '@/context/ToastContext';
import { userService } from '@/services/user.service';
import { storage } from '@/utils/storage';
import { FONTS } from '@/styles/global';
import { fs, hp, spacing, wp } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserProfile {
  fullName: string;
  email: string;
  avatar?: string;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const cachedUser = await storage.getUserData<UserProfile>();
      if (cachedUser) {
        setUserProfile(cachedUser);
        setFullName(cachedUser.fullName || '');
        setEmail(cachedUser.email || '');
        setAvatar(cachedUser.avatar || null);
      }

      const response = await userService.getProfile();
      if (response.success && response.data) {
        const userData = response.data as UserProfile;
        setUserProfile(userData);
        setFullName(userData.fullName || '');
        setEmail(userData.email || '');
        setAvatar(userData.avatar || null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const validateForm = () => {
    if (!fullName.trim()) {
      showError('Please enter your full name');
      return false;
    }

    if (fullName.trim().length < 2) {
      showError('Name must be at least 2 characters');
      return false;
    }

    if (fullName.trim().length > 100) {
      showError('Name must be less than 100 characters');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const updateData: Partial<UserProfile> = {
        fullName: fullName.trim(),
      };

      const response = await userService.updateProfile(updateData);

      if (response.success && response.data) {
        // Update cached user data
        const updatedUser = { ...userProfile, ...response.data } as UserProfile;
        await storage.saveUserData(updatedUser);
        setUserProfile(updatedUser);

        showSuccess('Profile updated successfully!');

        // Go back after a short delay
        setTimeout(() => {
          router.back();
        }, 500);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} hitSlop={8} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000000" />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#9CA3AF" />
                </View>
              )}
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Full Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!saving}
              />
            </View>

            {/* Email (Read-only) */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.readOnlyContainer}>
                <Text style={styles.readOnlyText}>{email}</Text>
                <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
              </View>
              <Text style={styles.hintText}>
                Email cannot be changed. Contact support if needed.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: hp(16),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fs(18),
    fontFamily: FONTS.bold,
    color: '#000000',
    marginLeft: spacing.sm,
  },
  headerSpacer: {
    width: wp(32), // Balance the back button
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(120), // Space for footer
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: hp(32),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: hp(16),
  },
  avatar: {
    width: wp(100),
    height: wp(100),
    borderRadius: wp(50),
  },
  avatarPlaceholder: {
    width: wp(100),
    height: wp(100),
    borderRadius: wp(50),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  fieldContainer: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: fs(14),
    fontFamily: FONTS.medium,
    color: '#374151',
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: wp(8),
    paddingHorizontal: spacing.md,
    paddingVertical: hp(12),
    fontSize: fs(16),
    fontFamily: FONTS.regular,
    color: '#111827',
  },
  readOnlyContainer: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: wp(8),
    paddingHorizontal: spacing.md,
    paddingVertical: hp(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readOnlyText: {
    fontSize: fs(16),
    fontFamily: FONTS.regular,
    color: '#6B7280',
  },
  hintText: {
    fontSize: fs(12),
    fontFamily: FONTS.regular,
    color: '#9CA3AF',
    marginTop: spacing.xs,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#0000FF',
    borderRadius: wp(12),
    paddingVertical: hp(10),
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: hp(52),
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: fs(16),
    fontFamily: FONTS.semibold,
    color: '#FFFFFF',
  },
});
