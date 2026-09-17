import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { contractApi } from '../../api/contractApi';
import { Contract } from '../../types';
import { Badge, Loading, EmptyState, Header } from '../../components';
import { COLORS } from '../../constants/colors';
import { RADIUS, SHADOWS, SPACING } from '../../constants/theme';

export const BookingHistoryScreen: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lookupCode, setLookupCode] = useState('');
  const [lookupMode, setLookupMode] = useState(false);

  const fetchRentals = async () => {
    try {
      const response = await contractApi.getMyRentals();
      if (response.success && response.data) {
        setContracts(response.data);
      }
    } catch (error: any) {
      console.warn('Lỗi tải danh sách hợp đồng:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRentals();
  };

  const handleLookup = async () => {
    if (!lookupCode.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã hợp đồng hoặc số điện thoại.');
      return;
    }

    setLoading(true);
    try {
      const response = await contractApi.lookupContract({
        contractId: lookupCode.trim().toUpperCase(),
        phone: lookupCode.trim(),
      });
      if (response.success && response.data) {
        setContracts(response.data);
        setLookupMode(true);
      }
    } catch (error: any) {
      Alert.alert('Tra cứu thất bại', error.message || 'Không tìm thấy hợp đồng.');
    } finally {
      setLoading(false);
    }
  };

  const resetLookup = () => {
    setLookupCode('');
    setLookupMode(false);
    fetchRentals();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val || 0);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return dateStr.slice(0, 10);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Lịch Sử Hợp Đồng"
        subtitle={lookupMode ? 'Kết quả tra cứu' : 'Danh sách hợp đồng của bạn'}
      />

      {/* Lookup Bar */}
      <View style={styles.lookupBar}>
        <TextInput
          placeholder="Nhập mã hợp đồng (HD...) để tra cứu"
          placeholderTextColor={COLORS.placeholder}
          value={lookupCode}
          onChangeText={setLookupCode}
          style={styles.lookupInput}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.lookupBtn} onPress={handleLookup}>
          <Text style={styles.lookupBtnText}>Tra cứu</Text>
        </TouchableOpacity>
        {lookupMode && (
          <TouchableOpacity style={styles.resetBtn} onPress={resetLookup}>
            <Text style={styles.resetBtnText}>Đặt lại</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <Loading message="Đang tải hợp đồng..." />
      ) : (
        <FlatList
          data={contracts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title={lookupMode ? 'Không tìm thấy hợp đồng' : 'Chưa có hợp đồng nào'}
              description={
                lookupMode
                  ? 'Vui lòng kiểm tra lại mã hợp đồng hoặc số điện thoại.'
                  : 'Hãy chọn một chiếc xe và gửi yêu cầu đặt xe đầu tiên của bạn.'
              }
              actionTitle={lookupMode ? 'Quay lại danh sách' : undefined}
              onAction={lookupMode ? resetLookup : undefined}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.contractCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.contractCode}>Mã HĐ: {item.id}</Text>
                  <Text style={styles.carNameTitle}>
                    {item.carName || `Xe: ${item.carId}`}
                  </Text>
                </View>
                <Badge label={item.status} />
              </View>

              <View style={styles.divider} />

              <View style={styles.cardBody}>
                <View style={styles.row}>
                  <Text style={styles.label}>Biển số xe:</Text>
                  <Text style={styles.value}>{item.carLicensePlate || item.carId}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Ngày thuê:</Text>
                  <Text style={styles.value}>{formatDate(item.startDate)}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Ngày trả dự kiến:</Text>
                  <Text style={styles.value}>{formatDate(item.expectedReturnDate)}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Điểm đón:</Text>
                  <Text style={styles.value} numberOfLines={1}>
                    {item.pickupPoint}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Tiền cọc:</Text>
                  <Text style={styles.depositVal}>{formatCurrency(item.deposit)}</Text>
                </View>

                <View style={[styles.row, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Tổng tiền:</Text>
                  <Text style={styles.totalVal}>{formatCurrency(item.totalAmount)}</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  lookupBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  lookupInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    fontSize: 13,
    backgroundColor: '#F8FAFC',
    color: COLORS.textPrimary,
  },
  lookupBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lookupBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  resetBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  listContent: {
    padding: SPACING.md,
  },
  contractCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contractCode: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  carNameTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: SPACING.sm,
  },
  cardBody: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
    maxWidth: '65%',
  },
  depositVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.warning,
  },
  totalRow: {
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  totalVal: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
