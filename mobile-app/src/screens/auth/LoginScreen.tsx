import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { Input, Button } from '../../components';
import { COLORS } from '../../constants/colors';
import { RADIUS, SHADOWS, SPACING } from '../../constants/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Vui lòng nhập địa chỉ email';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = 'Email không đúng định dạng (ví dụ: khachhang@gmail.com)';
    }

    if (!password) {
      errs.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      errs.password = 'Mật khẩu phải từ 6 ký tự trở lên';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err: any) {
      Alert.alert(
        'Đăng nhập thất bại',
        err.message || 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🚗</Text>
          </View>
          <Text style={styles.appName}>HỆ THỐNG THUÊ XE HÀ NỘI</Text>
          <Text style={styles.title}>Đăng Nhập Tài Khoản</Text>
          <Text style={styles.subtitle}>
            Trải nghiệm dịch vụ thuê xe tự lái và có tài xế uy tín hàng đầu
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Input
            label="Địa chỉ Email"
            placeholder="nguyenvana@gmail.com"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Mật khẩu"
            placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            isPassword
            error={errors.password}
          />

          <Button
            title="Đăng Nhập"
            onPress={handleLogin}
            loading={loading}
            size="lg"
            style={styles.loginBtn}
          />

          <View style={styles.registerPrompt}>
            <Text style={styles.registerPromptText}>Chưa có tài khoản khách hàng? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feature quick badges */}
        <View style={styles.featureRow}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureText}>Giao xe nhanh</Text>
          </View>
          <View style={styles.featureDivider} />
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🛡️</Text>
            <Text style={styles.featureText}>Bảo hiểm 100%</Text>
          </View>
          <View style={styles.featureDivider} />
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📋</Text>
            <Text style={styles.featureText}>Hợp đồng minh bạch</Text>
          </View>
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            Dành cho Quản trị viên / Nhân viên: vui lòng sử dụng Cổng Quản Trị Web Admin
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  logoIcon: {
    fontSize: 36,
  },
  appName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
    lineHeight: 18,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  loginBtn: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerPromptText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  registerLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureIcon: {
    fontSize: 14,
  },
  featureText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  featureDivider: {
    width: 1,
    height: 14,
    backgroundColor: COLORS.border,
  },
  footerNote: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  footerNoteText: {
    fontSize: 11,
    color: COLORS.placeholder,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
});
