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

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cccd, setCccd] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = 'Vui lòng nhập họ và tên';
    }

    if (!phone.trim()) {
      errs.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(phone.trim())) {
      errs.phone = 'Số điện thoại Việt Nam không hợp lệ (ví dụ: 0912345678)';
    }

    if (!email.trim()) {
      errs.email = 'Vui lòng nhập địa chỉ email';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = 'Email không đúng định dạng';
    }

    if (!password) {
      errs.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      errs.password = 'Mật khẩu phải từ 6 ký tự trở lên';
    }

    if (confirmPassword !== password) {
      errs.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }

    if (cccd.trim() && !/^[0-9]{9,12}$/.test(cccd.trim())) {
      errs.cccd = 'Số CCCD/CMND phải gồm 9 đến 12 chữ số';
    }

    if (!driverLicense.trim()) {
      errs.driverLicense = 'Vui lòng nhập số Giấy phép lái xe (GPLX)';
    }

    if (!address.trim()) {
      errs.address = 'Vui lòng nhập địa chỉ thường trú / tạm trú';
    }

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
      Alert.alert(
        'Đăng ký thành công',
        'Chào mừng bạn đến với hệ thống Thuê Xe Tự Lái & Có Tài!',
        [{ text: 'Bắt đầu ngay' }]
      );
    } catch (err: any) {
      Alert.alert(
        'Đăng ký thất bại',
        err.message || 'Không thể tạo tài khoản. Vui lòng thử lại.'
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
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>‹ Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Tạo Tài Khoản Mới</Text>
          <Text style={styles.subtitle}>
            Điền đầy đủ thông tin để hoàn tất hồ sơ đăng ký thuê xe
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.groupTitle}>Thông tin cá nhân</Text>

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

          <Text style={styles.groupTitle}>Bảo mật & Giấy tờ</Text>

          <Input
            label="Mật Khẩu *"
            placeholder="Tối thiểu 6 ký tự"
            isPassword
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (errors.password) setErrors((p) => ({ ...p, password: '' }));
            }}
            error={errors.password}
          />

          <Input
            label="Xác Nhận Mật Khẩu *"
            placeholder="Nhập lại mật khẩu"
            isPassword
            value={confirmPassword}
            onChangeText={(v) => {
              setConfirmPassword(v);
              if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: '' }));
            }}
            error={errors.confirmPassword}
          />

          <Input
            label="Số CCCD / CMND"
            placeholder="001201012345 (9 - 12 chữ số)"
            keyboardType="number-pad"
            value={cccd}
            onChangeText={(v) => {
              setCccd(v);
              if (errors.cccd) setErrors((p) => ({ ...p, cccd: '' }));
            }}
            error={errors.cccd}
          />

          <Input
            label="Số Giấy phép lái xe (GPLX) *"
            placeholder="B2 - 0123456789"
            value={driverLicense}
            onChangeText={(v) => {
              setDriverLicense(v);
              if (errors.driverLicense) setErrors((p) => ({ ...p, driverLicense: '' }));
            }}
            error={errors.driverLicense}
          />

          <Input
            label="Địa chỉ cư trú *"
            placeholder="Số nhà, đường, phường, quận, Hà Nội"
            value={address}
            onChangeText={(v) => {
              setAddress(v);
              if (errors.address) setErrors((p) => ({ ...p, address: '' }));
            }}
            error={errors.address}
          />

          <Button
            title="Đăng Ký Tài Khoản"
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
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    marginBottom: SPACING.md,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 2,
    marginBottom: SPACING.sm,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
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
  groupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  registerBtn: {
    marginTop: SPACING.md,
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
