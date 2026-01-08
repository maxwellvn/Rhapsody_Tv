import { styles } from '@/styles/verify-email.styles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleBack = () => {
    router.back();
  };

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const verificationCode = code.join('');
    console.log('Verification code:', verificationCode);
    // Handle verification logic here
    router.push('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Blue Background Section */}
      <View style={styles.blueSection} />
      
      {/* Back Button */}
      <Pressable onPress={handleBack} style={styles.backButton}>
        <Ionicons name="chevron-back" size={20} color="#FAFAFA" />
      </Pressable>

      {/* Header Text */}
      <Text style={styles.headerText}>
        Verify Your{'\n'}Email Address
      </Text>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        {/* Instructions */}
        <Text style={styles.instructionText}>
          Enter the 6 digit code sent to
        </Text>
        <Text style={styles.emailText}>ko************@gmail.com</Text>

        {/* Code Input Boxes */}
        <View style={styles.codeContainer}>
          <View style={styles.codeGroup}>
            {[0, 1, 2].map((index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={styles.codeInput}
                value={code[index]}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>
          
          <View style={styles.codeSeparator} />
          
          <View style={styles.codeGroup}>
            {[3, 4, 5].map((index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={styles.codeInput}
                value={code[index]}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>
        </View>

        {/* Verify Button */}
        <Pressable style={styles.verifyButton} onPress={handleVerify}>
          <Text style={styles.verifyButtonText}>Verify Email Address</Text>
        </Pressable>
      </View>
    </View>
  );
}
