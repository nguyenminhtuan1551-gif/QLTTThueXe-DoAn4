import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Modal,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { carApi } from '../../api/carApi';
import { Car } from '../../types';
import { CarCard, Loading, EmptyState, Header, Button } from '../../components';
import { COLORS } from '../../constants/colors';
import { RADIUS, SHADOWS, SPACING } from '../../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface FilterState {
  type: string;
  seatCount: number | null;
  fuelType: string;
  priceRange: string; // 'all' | '<800k' | '800k-1.2m' | '1.2m-2m' | '>2m'
  status: string;
}

const initialFilterState: FilterState = {
  type: 'Tất cả',
  seatCount: null,
  fuelType: 'Tất cả',
  priceRange: 'all',
  status: 'Tất cả',
};

export const CarListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Tất cả');

  // Advanced Filter Modal State
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [draftFilters, setDraftFilters] = useState<FilterState>(initialFilterState);

  const brands = [
    'Tất cả',
    'Toyota',
    'Mazda',
    'Hyundai',
    'Honda',
    'Kia',
    'VinFast',
    'Ford',
    'Mitsubishi',
  ];

  const carTypes = ['Tất cả', 'Sedan', 'SUV', 'Crossover', 'Hatchback', 'MPV', 'Bán tải'];
  const seatOptions = [
    { label: 'Tất cả', value: null },
    { label: '4 - 5 chỗ', value: 5 },
    { label: '7 chỗ', value: 7 },
    { label: '9+ chỗ', value: 9 },
  ];
  const fuelTypes = ['Tất cả', 'Xăng', 'Dầu', 'Điện', 'Hybrid'];
  const priceRanges = [
    { id: 'all', label: 'Tất cả mức giá' },
    { id: '<800k', label: '< 800.000 đ' },
    { id: '800k-1.2m', label: '800k - 1.2M đ' },
    { id: '1.2m-2m', label: '1.2M - 2.0M đ' },
    { id: '>2m', label: '> 2.000.000 đ' },
  ];
  const statuses = ['Tất cả', 'Sẵn sàng', 'Đang thuê', 'Đặt thuê', 'Bảo trì'];

  const fetchCars = async () => {
    try {
      const response = await carApi.getCars();
      if (response.success && response.data) {
        setCars(response.data);
      }
    } catch (error) {
      console.warn('Lỗi khi tải danh mục xe:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCars();
  };

  // Active filter count calculation
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.type !== 'Tất cả') count++;
    if (filters.seatCount !== null) count++;
    if (filters.fuelType !== 'Tất cả') count++;
    if (filters.priceRange !== 'all') count++;
    if (filters.status !== 'Tất cả') count++;
    return count;
  }, [filters]);

  const openFilterModal = () => {
    setDraftFilters({ ...filters });
    setFilterModalVisible(true);
  };

  const applyFilters = () => {
    setFilters({ ...draftFilters });
    setFilterModalVisible(false);
  };

  const resetAllFilters = () => {
    setDraftFilters(initialFilterState);
    setFilters(initialFilterState);
    setSelectedBrand('Tất cả');
    setSearch('');
    setFilterModalVisible(false);
  };

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      // 1. Keyword search (Name, brand, licensePlate)
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchName = car.name.toLowerCase().includes(query);
        const matchBrand = car.brand.toLowerCase().includes(query);
        const matchPlate = car.licensePlate.toLowerCase().includes(query);
        if (!matchName && !matchBrand && !matchPlate) return false;
      }

      // 2. Quick Brand Chip Filter
      if (selectedBrand !== 'Tất cả') {
        if (car.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
      }

      // 3. Car Type
      if (filters.type !== 'Tất cả') {
        if (!car.type.toLowerCase().includes(filters.type.toLowerCase())) return false;
      }

      // 4. Seat Count
      if (filters.seatCount !== null) {
        if (filters.seatCount === 5 && car.seatCount > 5) return false;
        if (filters.seatCount === 7 && (car.seatCount < 7 || car.seatCount > 8)) return false;
        if (filters.seatCount === 9 && car.seatCount < 9) return false;
      }

      // 5. Fuel Type
      if (filters.fuelType !== 'Tất cả') {
        if (!car.fuelType.toLowerCase().includes(filters.fuelType.toLowerCase())) return false;
      }

      // 6. Price Range
      if (filters.priceRange === '<800k' && car.price >= 800000) return false;
      if (
        filters.priceRange === '800k-1.2m' &&
        (car.price < 800000 || car.price > 1200000)
      )
        return false;
      if (
        filters.priceRange === '1.2m-2m' &&
        (car.price < 1200000 || car.price > 2000000)
      )
        return false;
      if (filters.priceRange === '>2m' && car.price <= 2000000) return false;

      // 7. Status Filter
      if (filters.status !== 'Tất cả') {
        if (car.status !== filters.status && car.publicStatus !== filters.status) return false;
      }

      return true;
    });
  }, [cars, search, selectedBrand, filters]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <Header title="Danh Mục Xe Cho Thuê" subtitle="Tự lái & có tài xế tại Hà Nội" />

      {/* Top Search & Filter Bar */}
      <View style={styles.filterSection}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              placeholder="Tìm theo tên xe, hãng, biển số..."
              placeholderTextColor={COLORS.placeholder}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
              clearButtonMode="while-editing"
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={styles.clearBtn}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            style={[
              styles.filterBtn,
              activeFilterCount > 0 && styles.filterBtnActive,
            ]}
            onPress={openFilterModal}
          >
            <Text style={styles.filterBtnIcon}>⚙️</Text>
            <Text
              style={[
                styles.filterBtnText,
                activeFilterCount > 0 && styles.filterBtnTextActive,
              ]}
            >
              Lọc {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Brand Scroll Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.brandRow}
        >
          {brands.map((brand) => {
            const isSelected = selectedBrand === brand;
            return (
              <TouchableOpacity
                key={brand}
                style={[styles.brandChip, isSelected && styles.brandChipActive]}
                onPress={() => setSelectedBrand(brand)}
              >
                <Text
                  style={[
                    styles.brandChipText,
                    isSelected && styles.brandChipTextActive,
                  ]}
                >
                  {brand}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results Count & Reset Bar */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          Tìm thấy <Text style={styles.summaryHighlight}>{filteredCars.length}</Text> xe phù hợp
        </Text>
        {(search || selectedBrand !== 'Tất cả' || activeFilterCount > 0) && (
          <TouchableOpacity onPress={resetAllFilters}>
            <Text style={styles.resetFilterText}>Xóa tất cả lọc ✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Car List */}
      {loading ? (
        <Loading message="Đang tải danh mục xe..." />
      ) : (
        <FlatList
          data={filteredCars}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="Không tìm thấy xe phù hợp"
              description="Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác."
              actionTitle="Đặt lại tất cả bộ lọc"
              onAction={resetAllFilters}
            />
          }
          renderItem={({ item }) => (
            <CarCard
              car={item}
              onPress={() => navigation.navigate('CarDetail', { carId: item.id, car: item })}
            />
          )}
        />
      )}

      {/* Advanced Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bộ Lọc Tìm Kiếm Nâng Cao</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.modalCloseText}>Đóng ✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* 1. Loại xe (Body Type) */}
              <Text style={styles.modalSectionTitle}>Kiểu dáng xe</Text>
              <View style={styles.modalPillsWrap}>
                {carTypes.map((type) => {
                  const isSelected = draftFilters.type === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.modalPill, isSelected && styles.modalPillActive]}
                      onPress={() => setDraftFilters((p) => ({ ...p, type }))}
                    >
                      <Text
                        style={[
                          styles.modalPillText,
                          isSelected && styles.modalPillTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 2. Số chỗ ngồi */}
              <Text style={styles.modalSectionTitle}>Số chỗ ngồi</Text>
              <View style={styles.modalPillsWrap}>
                {seatOptions.map((opt) => {
                  const isSelected = draftFilters.seatCount === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.label}
                      style={[styles.modalPill, isSelected && styles.modalPillActive]}
                      onPress={() => setDraftFilters((p) => ({ ...p, seatCount: opt.value }))}
                    >
                      <Text
                        style={[
                          styles.modalPillText,
                          isSelected && styles.modalPillTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 3. Nhiên liệu */}
              <Text style={styles.modalSectionTitle}>Loại nhiên liệu</Text>
              <View style={styles.modalPillsWrap}>
                {fuelTypes.map((fuel) => {
                  const isSelected = draftFilters.fuelType === fuel;
                  return (
                    <TouchableOpacity
                      key={fuel}
                      style={[styles.modalPill, isSelected && styles.modalPillActive]}
                      onPress={() => setDraftFilters((p) => ({ ...p, fuelType: fuel }))}
                    >
                      <Text
                        style={[
                          styles.modalPillText,
                          isSelected && styles.modalPillTextActive,
                        ]}
                      >
                        {fuel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 4. Khoảng giá thuê */}
              <Text style={styles.modalSectionTitle}>Mức giá thuê theo ngày</Text>
              <View style={styles.modalPillsWrap}>
                {priceRanges.map((range) => {
                  const isSelected = draftFilters.priceRange === range.id;
                  return (
                    <TouchableOpacity
                      key={range.id}
                      style={[styles.modalPill, isSelected && styles.modalPillActive]}
                      onPress={() => setDraftFilters((p) => ({ ...p, priceRange: range.id }))}
                    >
                      <Text
                        style={[
                          styles.modalPillText,
                          isSelected && styles.modalPillTextActive,
                        ]}
                      >
                        {range.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 5. Trạng thái xe */}
              <Text style={styles.modalSectionTitle}>Trạng thái xe</Text>
              <View style={styles.modalPillsWrap}>
                {statuses.map((status) => {
                  const isSelected = draftFilters.status === status;
                  return (
                    <TouchableOpacity
                      key={status}
                      style={[styles.modalPill, isSelected && styles.modalPillActive]}
                      onPress={() => setDraftFilters((p) => ({ ...p, status }))}
                    >
                      <Text
                        style={[
                          styles.modalPillText,
                          isSelected && styles.modalPillTextActive,
                        ]}
                      >
                        {status}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ height: SPACING.lg }} />
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalResetBtn}
                onPress={() => setDraftFilters(initialFilterState)}
              >
                <Text style={styles.modalResetBtnText}>Thiết lập lại</Text>
              </TouchableOpacity>
              <Button
                title="Áp Dụng Bộ Lọc"
                onPress={applyFilters}
                size="md"
                style={styles.modalApplyBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.xs,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SPACING.sm,
    height: 42,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  clearBtn: {
    color: COLORS.placeholder,
    fontSize: 14,
    padding: 4,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primary,
  },
  filterBtnIcon: {
    fontSize: 14,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterBtnTextActive: {
    color: COLORS.primary,
  },
  brandRow: {
    gap: SPACING.xs,
    paddingVertical: 6,
  },
  brandChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#F1F5F9',
  },
  brandChipActive: {
    backgroundColor: COLORS.primary,
  },
  brandChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  brandChipTextActive: {
    color: COLORS.white,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  summaryHighlight: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  resetFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.error,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '82%',
    paddingBottom: SPACING.lg,
    ...SHADOWS.elevated,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modalBody: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  modalPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  modalPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalPillActive: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primary,
  },
  modalPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modalPillTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalResetBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalResetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modalApplyBtn: {
    flex: 1.5,
  },
});
