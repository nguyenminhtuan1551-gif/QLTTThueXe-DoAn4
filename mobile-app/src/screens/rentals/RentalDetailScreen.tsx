import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { contractApi } from '../../api/contractApi';
import { Contract, LookupResponseData } from '../../types';
import { Badge, Loading, Header } from '../../components';
import { COLORS } from '../../constants/colors';
import { RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { CONFIG } from '../../constants/config';

type Props = NativeStackScreenProps<RootStackParamList, 'RentalDetail'>;

export const RentalDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { contractId, contract: initialContract, lookupData: initialLookupData } = route.params;
  const [contract, setContract] = useState<Contract | null>(
    initialContract || initialLookupData?.contract || null
  );
  const [lookupData, setLookupData] = useState<LookupResponseData | null>(initialLookupData || null);
  const [loading, setLoading] = useState(!initialContract && !initialLookupData);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await contractApi.lookupContract({ contractId });
        if (response.success && response.data) {
          setLookupData(response.data);
          setContract(response.data.contract);
        }
      } catch (error: any) {
        Alert.alert('Lỗi', error.message || 'Không thể tải chi tiết đơn thuê.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [contractId]);

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

  if (loading || !contract) {
    return (
      <View style={styles.container}>
        <Header title="Chi Tiết Đơn Thuê" onBack={() => navigation.goBack()} />
        <Loading message="Đang tải thông tin đơn thuê..." fullscreen />
      </View>
    );
  }

  const returnRecord = lookupData?.returnRecord;
  const penalties = lookupData?.penalties || [];

  const carImageUrl = contract.carImage
    ? contract.carImage.startsWith('http')
      ? contract.carImage
      : `${CONFIG.IMAGE_BASE_URL}${contract.carImage}`
    : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80';

  const deposit = Number(contract.deposit) || 0;
  const totalAmount = Number(contract.totalAmount) || 0;
  const remaining = Math.max(0, totalAmount - deposit);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <Header
        title={`Hợp Đồng ${contract.id}`}
        subtitle={contract.status}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Header Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.statusBannerLeft}>
            <Text style={styles.statusBannerCode}>MÃ HỢP ĐỒNG: {contract.id}</Text>
            <Text style={styles.statusBannerDate}>Ngày tạo: {formatDate(contract.createdAt || contract.startDate)}</Text>
          </View>
          <Badge label={contract.status} />
        </View>

        {/* Car Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🚗 Xe Thuê</Text>
          <View style={styles.carRow}>
            <Image source={{ uri: carImageUrl }} style={styles.carThumb} resizeMode="cover" />
            <View style={styles.carTextCol}>
              <Text style={styles.carName}>{contract.carName || `Mã xe: ${contract.carId}`}</Text>
              <Text style={styles.carPlate}>Biển số: {contract.carPlate || contract.carLicensePlate || 'Chờ bàn giao'}</Text>
              <Text style={styles.carPrice}>
                Đơn giá: {formatCurrency(contract.pricePerDay || 0)} / ngày
              </Text>
            </View>
          </View>
        </View>

        {/* Rental Terms & Schedule */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📅 Lịch Trình & Điểm Giao Nhận</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày bắt đầu thuê:</Text>
            <Text style={styles.infoVal}>{formatDate(contract.startDate)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày trả dự kiến:</Text>
            <Text style={styles.infoVal}>{formatDate(contract.expectedReturnDate)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Điểm đón / nhận xe:</Text>
            <Text style={styles.infoVal} numberOfLines={2}>{contract.pickupPoint}</Text>
          </View>

          {contract.notes ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ghi chú khách hàng:</Text>
              <Text style={styles.infoVal}>{contract.notes}</Text>
            </View>
          ) : null}
        </View>

        {/* Financial Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>💰 Quyết Toán & Thanh Toán</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tổng tiền thuê xe:</Text>
            <Text style={styles.infoValBold}>{formatCurrency(totalAmount)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.depositLabel}>Tiền đặt cọc đã ghi nhận:</Text>
            <Text style={styles.depositVal}>{formatCurrency(deposit)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.remainingLabel}>Số tiền còn lại cần thanh toán:</Text>
            <Text style={styles.remainingVal}>{formatCurrency(remaining)}</Text>
          </View>
        </View>

        {/* Return Record Section (If Car Returned) */}
        {returnRecord ? (
          <View style={[styles.card, styles.returnCard]}>
            <Text style={styles.returnSectionTitle}>📋 Biên Bản Trả Xe ({returnRecord.id})</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày trả xe thực tế:</Text>
              <Text style={styles.infoVal}>{formatDate(returnRecord.actualReturnDate)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số ngày thuê thực tế:</Text>
              <Text style={styles.infoVal}>{returnRecord.actualDays} ngày</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tình trạng xe khi nhận lại:</Text>
              <Text style={styles.infoVal}>{returnRecord.carCondition}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Hình thức thanh toán:</Text>
              <Text style={styles.infoVal}>{returnRecord.paymentMethod}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tổng tiền quyết toán:</Text>
              <Text style={styles.infoValBold}>{formatCurrency(returnRecord.totalPayment)}</Text>
            </View>

            {/* Penalty Fees List if any */}
            {penalties.length > 0 ? (
              <View style={styles.penaltiesBox}>
                <Text style={styles.penaltiesHead}>⚠️ Các khoản phụ phí / Phí phạt phát sinh:</Text>
                {penalties.map((pen, idx) => (
                  <View key={`pen-${idx}`} style={styles.penaltyItem}>
                    <Text style={styles.penaltyBullet}>•</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.penaltyType}>{pen.type}: <Text style={styles.penaltyAmount}>{formatCurrency(pen.amount)}</Text></Text>
                      {pen.notes ? <Text style={styles.penaltyNote}>{pen.notes}</Text> : null}
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Attached Photos (If available) */}
        {contract.pickupImages && contract.pickupImages.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>📸 Ảnh Hồ Sơ / Nhận Xe Đính Kèm</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {contract.pickupImages.map((img, idx) => {
                const imgUri = img.path?.startsWith('http')
                  ? img.path
                  : `${CONFIG.IMAGE_BASE_URL}${img.path}`;
                return (
                  <View key={`img-att-${idx}`} style={styles.imageWrap}>
                    <Image source={{ uri: imgUri }} style={styles.attachedImage} resizeMode="cover" />
                    <Text style={styles.imageNameText} numberOfLines={1}>{img.fileName || `Ảnh ${idx + 1}`}</Text>
                  </View>
                );
              })}
            </ScrollView>
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
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  statusBannerLeft: {
    flex: 1,
  },
  statusBannerCode: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statusBannerDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  carRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  carThumb: {
    width: 90,
    height: 70,
    borderRadius: RADIUS.md,
    backgroundColor: '#F1F5F9',
  },
  carTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  carName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  carPlate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  carPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
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
    color: '#166534',
    fontWeight: '600',
  },
  depositVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.warning,
  },
  remainingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  remainingVal: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  returnCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  returnSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: SPACING.sm,
  },
  penaltiesBox: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 4,
  },
  penaltiesHead: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.error,
    marginBottom: 2,
  },
  penaltyItem: {
    flexDirection: 'row',
    gap: 6,
  },
  penaltyBullet: {
    color: COLORS.error,
    fontWeight: '800',
  },
  penaltyType: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  penaltyAmount: {
    fontWeight: '700',
    color: COLORS.error,
  },
  penaltyNote: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  imageScroll: {
    marginTop: 4,
  },
  imageWrap: {
    marginRight: SPACING.sm,
    alignItems: 'center',
    width: 80,
  },
  attachedImage: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    backgroundColor: '#F1F5F9',
  },
  imageNameText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
