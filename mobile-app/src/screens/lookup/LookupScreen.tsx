import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { contractApi } from '../../api/contractApi';
import { LookupResponseData } from '../../types';
import { Button, Header, Loading, Badge } from '../../components';
import { COLORS } from '../../constants/colors';
import { RADIUS, SHADOWS, SPACING } from '../../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const LookupScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [contractId, setContractId] = useState('');
  const [phone, setPhone] = useState('');
  const [cccd, setCccd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResponseData | null>(null);

  const handleLookup = async () => {
    if (!contractId.trim() && !phone.trim() && !cccd.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập ít nhất một thông tin: Mã HĐ, Số điện thoại hoặc CCCD.');
      return;
    }

    setLoading(true);
    try {
      const response = await contractApi.lookupContract({
        contractId: contractId.trim().toUpperCase() || undefined,
        phone: phone.trim() || undefined,
        cccd: cccd.trim() || undefined,
      });

      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setResult(null);
        Alert.alert('Không tìm thấy', 'Không tìm thấy đơn thuê xe phù hợp với thông tin đã nhập.');
      }
    } catch (err: any) {
      setResult(null);
      Alert.alert('Tra cứu thất bại', err.message || 'Không tìm thấy thông tin đơn thuê.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setContractId('');
    setPhone('');
    setCccd('');
    setResult(null);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val || 0);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    return dateStr.slice(0, 10);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <Header
        title="Tra Cứu Hợp Đồng"
        subtitle="Dành cho khách hàng tra cứu nhanh không cần đăng nhập"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Lookup Inputs Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔍 Nhập Thông Tin Tra Cứu</Text>
          <Text style={styles.cardSub}>
            Bạn có thể nhập 1 trong 3 thông tin dưới đây để tìm hợp đồng thuê xe của mình:
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mã hợp đồng (HD...):</Text>
            <TextInput
              placeholder="Ví dụ: HD000001"
              placeholderTextColor={COLORS.placeholder}
              value={contractId}
              onChangeText={setContractId}
              style={styles.input}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Số điện thoại đặt xe:</Text>
            <TextInput
              placeholder="Ví dụ: 0912345678"
              placeholderTextColor={COLORS.placeholder}
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Số CCCD / CMND:</Text>
            <TextInput
              placeholder="Ví dụ: 001201012345"
              placeholderTextColor={COLORS.placeholder}
              value={cccd}
              onChangeText={setCccd}
              style={styles.input}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.btnRow}>
            <Button
              title="Tra Cứu Ngay 🔍"
              onPress={handleLookup}
              loading={loading}
              size="md"
              style={styles.lookupBtn}
            />
            {result ? (
              <Button
                title="Làm Mới"
                variant="outline"
                onPress={handleReset}
                size="md"
                style={styles.resetBtn}
              />
            ) : null}
          </View>
        </View>

        {/* Lookup Results Card */}
        {loading ? (
          <Loading message="Đang tra cứu cơ sở dữ liệu..." />
        ) : result ? (
          <View style={[styles.card, styles.resultCard]}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.resultTag}>KẾT QUẢ TRA CỨU</Text>
                <Text style={styles.resultContractCode}>{result.contract.id}</Text>
                <Text style={styles.resultCarName}>{result.contract.carName || `Mã xe: ${result.contract.carId}`}</Text>
              </View>
              <Badge label={result.contract.status} />
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Khách hàng:</Text>
              <Text style={styles.infoVal}>{result.customer.fullName} ({result.customer.phone})</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Biển số xe:</Text>
              <Text style={styles.infoVal}>{result.contract.carPlate || result.contract.carLicensePlate || 'Chờ phân xe'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Thời gian thuê:</Text>
              <Text style={styles.infoVal}>
                {formatDate(result.contract.startDate)} ➔ {formatDate(result.contract.expectedReturnDate)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Điểm nhận xe:</Text>
              <Text style={styles.infoVal} numberOfLines={1}>{result.contract.pickupPoint}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tiền cọc:</Text>
              <Text style={styles.depositVal}>{formatCurrency(result.contract.deposit)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabelBold}>Tổng tiền thuê:</Text>
              <Text style={styles.totalValBold}>{formatCurrency(result.contract.totalAmount)}</Text>
            </View>

            {/* Return status */}
            {result.returnRecord ? (
              <View style={styles.returnedBox}>
                <Text style={styles.returnedText}>
                  ✅ Xe đã hoàn tất trả vào ngày {formatDate(result.returnRecord.actualReturnDate)} • Tình trạng: {result.returnRecord.carCondition}
                </Text>
              </View>
            ) : null}

            <Button
              title="Xem Toàn Bộ Chi Tiết Đơn Thuê ›"
              onPress={() =>
                navigation.navigate('RentalDetail', {
                  contractId: result.contract.id,
                  contract: result.contract,
                  lookupData: result,
                })
              }
              size="md"
              style={{ marginTop: SPACING.md }}
            />
          </View>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.md,
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: SPACING.sm,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    height: 42,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  lookupBtn: {
    flex: 2,
  },
  resetBtn: {
    flex: 1,
  },
  resultCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#93C5FD',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resultTag: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  resultContractCode: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  resultCarName: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    maxWidth: '65%',
    textAlign: 'right',
  },
  infoLabelBold: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  totalValBold: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  depositVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.warning,
  },
  returnedBox: {
    backgroundColor: '#DCFCE7',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  returnedText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
  },
});
