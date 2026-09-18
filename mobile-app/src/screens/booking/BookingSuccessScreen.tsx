import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Clipboard,
  Alert,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Button, Header } from '../../components';
import { COLORS } from '../../constants/colors';
import { RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { CONFIG } from '../../constants/config';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingSuccess'>;

export const BookingSuccessScreen: React.FC<Props> = ({ route, navigation }) => {
  const { contract } = route.params;

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

  const bankAccount = {
    bankName: 'Ngân hàng Quân Đội (MB Bank)',
    accountNumber: '09123456789',
    accountHolder: 'CONG TY CHO THUE XE TU LAI HN',
    amount: contract.deposit || Math.round((contract.totalAmount || 0) * 0.3),
    content: `COC ${contract.id}`,
  };

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Đã sao chép', `Đã sao chép ${label}: ${text}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <Header
        title="Đặt Xe Thành Công"
        onBack={() => navigation.navigate('Main', { screen: 'HistoryTab' } as any)}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Celebration Icon & Title */}
        <View style={styles.celebrationCard}>
          <View style={styles.checkIconBadge}>
            <Text style={styles.checkIcon}>🎉</Text>
          </View>
          <Text style={styles.successTitle}>Yêu Cầu Đặt Xe Thành Công!</Text>
          <Text style={styles.successSub}>
            Hệ thống đã ghi nhận hợp đồng của bạn. Điều phối viên sẽ liên hệ trong 5-10 phút để xác nhận điểm giao nhận xe.
          </Text>
          <View style={styles.contractIdPill}>
            <Text style={styles.contractIdLabel}>Mã hợp đồng:</Text>
            <Text style={styles.contractIdValue}>{contract.id}</Text>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Tóm Tắt Chuyến Đi</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Xe thuê:</Text>
            <Text style={styles.infoVal}>{contract.carName || contract.carId}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Biển số xe:</Text>
            <Text style={styles.infoVal}>{contract.carPlate || contract.carLicensePlate || 'Sẽ điều phối'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thời gian:</Text>
            <Text style={styles.infoVal}>
              {formatDate(contract.startDate)} ➔ {formatDate(contract.expectedReturnDate)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Điểm đón nhận xe:</Text>
            <Text style={styles.infoVal} numberOfLines={2}>{contract.pickupPoint}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tổng tiền thuê:</Text>
            <Text style={styles.infoValBold}>{formatCurrency(contract.totalAmount)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.depositLabel}>Tiền cọc cần thanh toán (30%):</Text>
            <Text style={styles.depositValue}>{formatCurrency(bankAccount.amount)}</Text>
          </View>
        </View>

        {/* Bank Transfer Payment Info */}
        <View style={[styles.card, styles.bankCard]}>
          <View style={styles.bankHeaderRow}>
            <Text style={styles.bankCardTitle}>💳 Thông Tin Chuyển Khoản Đặt Cọc</Text>
            <View style={styles.qrBadge}>
              <Text style={styles.qrBadgeText}>QR Code</Text>
            </View>
          </View>

          <Text style={styles.bankNotice}>
            Vui lòng chuyển khoản đúng số tiền cọc và nội dung dưới đây để hệ thống tự động khóa lịch giữ xe:
          </Text>

          <View style={styles.bankInfoBox}>
            <View style={styles.bankItem}>
              <Text style={styles.bankItemLabel}>Ngân hàng:</Text>
              <Text style={styles.bankItemVal}>{bankAccount.bankName}</Text>
            </View>

            <View style={styles.bankItemWithCopy}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bankItemLabel}>Số tài khoản:</Text>
                <Text style={styles.bankNumberVal}>{bankAccount.accountNumber}</Text>
              </View>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => copyToClipboard(bankAccount.accountNumber, 'Số tài khoản')}
              >
                <Text style={styles.copyBtnText}>Sao chép</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bankItem}>
              <Text style={styles.bankItemLabel}>Chủ tài khoản:</Text>
              <Text style={styles.bankItemVal}>{bankAccount.accountHolder}</Text>
            </View>

            <View style={styles.bankItemWithCopy}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bankItemLabel}>Số tiền cọc:</Text>
                <Text style={styles.bankAmountVal}>{formatCurrency(bankAccount.amount)}</Text>
              </View>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => copyToClipboard(String(bankAccount.amount), 'Số tiền')}
              >
                <Text style={styles.copyBtnText}>Sao chép</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bankItemWithCopy}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bankItemLabel}>Nội dung chuyển khoản:</Text>
                <Text style={styles.bankContentVal}>{bankAccount.content}</Text>
              </View>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => copyToClipboard(bankAccount.content, 'Nội dung')}
              >
                <Text style={styles.copyBtnText}>Sao chép</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Hot Support & Actions */}
        <View style={styles.actionsWrap}>
          <Button
            title="Xem Danh Sách Đơn Thuê Của Tôi"
            onPress={() => navigation.navigate('Main', { screen: 'HistoryTab' } as any)}
            size="lg"
            style={styles.historyBtn}
          />

          <Button
            title="Về Trang Chủ"
            variant="outline"
            onPress={() => navigation.navigate('Main', { screen: 'HomeTab' } as any)}
            size="md"
          />
        </View>

        <View style={styles.supportNote}>
          <Text style={styles.supportNoteText}>
            Cần hỗ trợ gấp? Gọi ngay hotline 24/7: <Text style={styles.supportPhone}>{CONFIG.SUPPORT_PHONE}</Text>
          </Text>
        </View>

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
  celebrationCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  checkIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  checkIcon: {
    fontSize: 32,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#166534',
    textAlign: 'center',
    marginBottom: 4,
  },
  successSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  contractIdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  contractIdLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  contractIdValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
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
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    maxWidth: '65%',
    textAlign: 'right',
  },
  infoValBold: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: SPACING.sm,
  },
  depositLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  depositValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.warning,
  },
  bankCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  bankHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bankCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  qrBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  qrBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  bankNotice: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 16,
  },
  bankInfoBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  bankItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankItemWithCopy: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  bankItemLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  bankItemVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  bankNumberVal: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  bankAmountVal: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.error,
  },
  bankContentVal: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  copyBtn: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionsWrap: {
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  historyBtn: {
    backgroundColor: COLORS.primary,
  },
  supportNote: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  supportNoteText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  supportPhone: {
    fontWeight: '800',
    color: COLORS.primary,
  },
});
