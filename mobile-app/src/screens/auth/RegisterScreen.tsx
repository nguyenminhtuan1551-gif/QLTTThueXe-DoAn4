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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { Input, Button } from '../../components';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../constants/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cccd, setCccd] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) errs.fullName = 'Vui lòng nhập họ và tên';
    if (!phone.trim()) {
      errs.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(phone.trim())) {
      errs.phone = 'Số điện thoại không hợp lệ';
    }

    if (!email.trim()) {
      errs.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = 'Email không đúng định dạng';
    }

    if (!password) {
      errs.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      errs.password = 'Mật khẩu phải từ 6 ký tự trở lên';
    }

    if (!address.trim()) errs.address = 'Vui lòng nhập địa chỉ cư trú';
    if (!driverLicense.trim()) errs.driverLicense = 'Vui lòng nhập số GPLX (Bằng lái xe)';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
        cccd: cccd.trim() || undefined,
        driverLicense: driverLicense.trim(),
        address: address.trim(),
      });
      Alert.alert('Thành công', 'Đăng ký tài khoản thành công!');
    } catch (err: any) {
      Alert.alert('Đăng ký thất bại', err.message || 'Không thể đăng ký tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Đăng Ký Tài Khoản</Text>
          <Text style={styles.subtitle}>
            Trở thành thành viên để tận hưởng dịch vụ thuê xe tự lái tiện lợi
          </Text>
        </View>

        <View style={styles.card}>
          <Input
            label="Họ và Tên *"
            placeholder="Nguyễn Văn A"
            value={fullName}
            onChangeText={(v) => {
              setFullName(v);
              if (errors.fullName) setErrors((p) => ({ ...p, fullName: '' }));
            }}
            error={errors.fullName}
          />

          <Input
            label="Số Điện Thoại *"
            placeholder="0912345678"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(v) => {
              setPhone(v);
              if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
            }}
            error={errors.phone}
          />

          <Input
            label="Địa chỉ Email *"
            placeholder="nguyenvana@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (errors.email) setErrors((p) => ({ ...p, email: '' }));
            }}
            error={errors.email}
          />

          <Input
            label="Mật Khẩu *"
            placeholder="••••••••"
            isPassword
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (errors.password) setErrors((p) => ({ ...p, password: '' }));
            }}
            error={errors.password}
          />

          <Input
            label="Số CCCD / CMND"
            placeholder="001201012345 (Tùy chọn)"
            keyboardType="number-pad"
            value={cccd}
            onChangeText={setCccd}
          />

          <Input
            label="Giấy phép lái xe (GPLX) *"
            placeholder="B2 - 0123456789"
            value={driverLicense}
            onChangeText={(v) => {
              setDriverLicense(v);
              if (errors.driverLicense) setErrors((p) => ({ ...p, driverLicense: '' }));
            }}
            error={errors.driverLicense}
          />

          <Input
            label="Địa chỉ thường trú *"
            placeholder="Số nhà, Đường, Quận, Hà Nội"
            value={address}
            onChangeText={(v) => {
              setAddress(v);
              if (errors.address) setErrors((p) => ({ ...p, address: '' }));
            }}
            error={errors.address}
          />

          <Button
            title="Đăng Ký Ngay"
            onPress={handleRegister}
            loading={loading}
            size="lg"
            style={styles.registerBtn}
          />

          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
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
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  registerBtn: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPromptText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
