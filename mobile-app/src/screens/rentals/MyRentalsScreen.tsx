import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { contractApi } from '../../api/contractApi';
import { Contract, ContractStatus } from '../../types';
import { Badge, Loading, EmptyState, Header } from '../../components';
import { COLORS } from '../../constants/colors';
import { RADIUS, SHADOWS, SPACING } from '../../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabStatus = 'Tất cả' | ContractStatus;

export const MyRentalsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabStatus>('Tất cả');
  const [search, setSearch] = useState('');

  const tabs: TabStatus[] = [
    'Tất cả',
    'Chờ xác nhận',
    'Đang hiệu lực',
    'Đã hoàn thành',
    'Đã hủy',
  ];

  const fetchRentals = async () => {
    try {
      const response = await contractApi.getMyRentals();
      if (response.success && response.data) {
        setContracts(response.data);
      }
    } catch (error: any) {
      console.warn('Lỗi tải danh sách đơn thuê:', error);
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

  // Filter list by Tab and Search keyword
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      // Tab filter
      if (selectedTab !== 'Tất cả' && c.status !== selectedTab) {
        return false;
      }

      // Search keyword filter (MaHD, carName, carPlate, pickupPoint)
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchId = c.id.toLowerCase().includes(query);
        const matchCar = (c.carName || '').toLowerCase().includes(query);
        const matchPlate = (c.carPlate || c.carLicensePlate || '').toLowerCase().includes(query);
        const matchPickup = (c.pickupPoint || '').toLowerCase().includes(query);
        if (!matchId && !matchCar && !matchPlate && !matchPickup) return false;
      }

      return true;
    });
  }, [contracts, selectedTab, search]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <Header
        title="Đơn Thuê Của Tôi"
        subtitle="Quản lý & theo dõi tiến độ hợp đồng"
      />

      {/* Search Input Bar */}
      <View style={styles.searchBarWrap}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Tìm theo mã HĐ (HD...), tên xe, biển số..."
            placeholderTextColor={COLORS.placeholder}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            clearButtonMode="while-editing"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearSearchBtn}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Status Segment Tabs */}
      <View style={styles.tabsWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={tabs}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.tabsList}
          renderItem={({ item }) => {
            const isSelected = selectedTab === item;
            return (
              <TouchableOpacity
                style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
                onPress={() => setSelectedTab(item)}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    isSelected && styles.tabBtnTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Contract List */}
      {loading ? (
        <Loading message="Đang tải danh sách đơn thuê..." />
      ) : (
        <FlatList
          data={filteredContracts}
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
              title={
                selectedTab === 'Tất cả'
                  ? 'Bạn chưa có đơn thuê nào'
                  : `Không có đơn thuê ở trạng thái "${selectedTab}"`
              }
              description="Hãy chọn một mẫu xe yêu thích và trải nghiệm dịch vụ thuê xe tự lái ngay hôm nay."
              actionTitle={selectedTab !== 'Tất cả' ? 'Xem tất cả đơn thuê' : 'Khám phá danh mục xe'}
              onAction={() => {
                if (selectedTab !== 'Tất cả') {
                  setSelectedTab('Tất cả');
                } else {
                  navigation.navigate('Main', { screen: 'CarListTab' } as any);
                }
              }}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.contractCard}
              activeOpacity={0.88}
              onPress={() =>
                navigation.navigate('RentalDetail', {
                  contractId: item.id,
                  contract: item,
                })
              }
            >
              {/* Card Header: Code & Status */}
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.contractCodePill}>{item.id}</Text>
                  <Text style={styles.carNameHeading}>
                    {item.carName || `Mã xe: ${item.carId}`}
                  </Text>
                </View>
                <Badge label={item.status} />
              </View>

              <View style={styles.divider} />

              {/* Card Body Specs */}
              <View style={styles.cardBody}>
                <View style={styles.row}>
                  <Text style={styles.label}>Biển kiểm soát:</Text>
                  <Text style={styles.valPlate}>
                    {item.carPlate || item.carLicensePlate || 'Chờ phân xe'}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Thời gian thuê:</Text>
                  <Text style={styles.valTime}>
                    {formatDate(item.startDate)} ➔ {formatDate(item.expectedReturnDate)}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Điểm nhận xe:</Text>
                  <Text style={styles.valAddress} numberOfLines={1}>
                    {item.pickupPoint}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Tiền đặt cọc:</Text>
                  <Text style={styles.valDeposit}>{formatCurrency(item.deposit)}</Text>
                </View>
              </View>

              {/* Card Footer */}
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.footerTotalLabel}>Tổng giá trị hợp đồng</Text>
                  <Text style={styles.footerTotalVal}>{formatCurrency(item.totalAmount)}</Text>
                </View>
                <View style={styles.detailLinkBtn}>
                  <Text style={styles.detailLinkText}>Chi tiết đơn ›</Text>
                </View>
              </View>
            </TouchableOpacity>
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
  searchBarWrap: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SPACING.sm,
    height: 40,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  clearSearchBtn: {
    fontSize: 13,
    color: COLORS.placeholder,
    padding: 4,
  },
  tabsWrap: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 6,
  },
  tabsList: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#F1F5F9',
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabBtnTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
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
  contractCodePill: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  carNameHeading: {
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
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  valPlate: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  valTime: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  valAddress: {
    fontSize: 12,
    color: COLORS.textSecondary,
    maxWidth: '65%',
    textAlign: 'right',
  },
  valDeposit: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.warning,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  footerTotalLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  footerTotalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  detailLinkBtn: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  detailLinkText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
