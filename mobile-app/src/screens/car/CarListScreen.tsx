import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { carApi } from '../../api/carApi';
import { Car } from '../../types';
import { CarCard, Loading, EmptyState, Header } from '../../components';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CarListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Tất cả');
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  const brands = ['Tất cả', 'Toyota', 'Mazda', 'Hyundai', 'Honda', 'Kia', 'VinFast', 'Ford'];
  const seatOptions = [
    { label: 'Tất cả chỗ', value: null },
    { label: '4-5 chỗ', value: 5 },
    { label: '7 chỗ', value: 7 },
  ];

  const fetchCars = async () => {
    try {
      const response = await carApi.getCars();
      if (response.success && response.data) {
        setCars(response.data);
      }
    } catch (error) {
      console.warn('Lỗi khi tải danh sách xe:', error);
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

  const filteredCars = cars.filter((car) => {
    // Search text filter
    if (search.trim()) {
      const query = search.toLowerCase();
      const matchName = car.name.toLowerCase().includes(query);
      const matchBrand = car.brand.toLowerCase().includes(query);
      const matchPlate = car.licensePlate.toLowerCase().includes(query);
      if (!matchName && !matchBrand && !matchPlate) return false;
    }

    // Brand filter
    if (selectedBrand !== 'Tất cả') {
      if (car.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
    }

    // Seat count filter
    if (selectedSeat !== null) {
      if (selectedSeat === 5 && car.seatCount > 5) return false;
      if (selectedSeat === 7 && car.seatCount < 7) return false;
    }

    return true;
  });

  return (
    <View style={styles.container}>
      <Header title="Danh Sách Xe Cho Thuê" />

      {/* Search and Filters Header */}
      <View style={styles.filterSection}>
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

        {/* Brand Scroll */}
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

        {/* Seat Count Row */}
        <View style={styles.seatRow}>
          {seatOptions.map((opt) => {
            const isSelected = selectedSeat === opt.value;
            return (
              <TouchableOpacity
                key={opt.label}
                style={[styles.seatBtn, isSelected && styles.seatBtnActive]}
                onPress={() => setSelectedSeat(opt.value)}
              >
                <Text
                  style={[
                    styles.seatBtnText,
                    isSelected && styles.seatBtnTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Car List */}
      {loading ? (
        <Loading message="Đang tải danh sách xe..." />
      ) : (
        <FlatList
          data={filteredCars}
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
              title="Không tìm thấy xe phù hợp"
              description="Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm."
              actionTitle="Đặt lại bộ lọc"
              onAction={() => {
                setSearch('');
                setSelectedBrand('Tất cả');
                setSelectedSeat(null);
              }}
            />
          }
          renderItem={({ item }) => (
            <CarCard
              car={item}
              onPress={() =>
                navigation.navigate('CarDetail', { carId: item.id, car: item })
              }
            />
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
  filterSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SPACING.sm,
    height: 42,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  clearBtn: {
    color: COLORS.placeholder,
    fontSize: 14,
    padding: 4,
  },
  brandRow: {
    gap: SPACING.xs,
    paddingVertical: 2,
  },
  brandChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
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
  seatRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  seatBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  seatBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  seatBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  seatBtnTextActive: {
    color: COLORS.primary,
  },
  listContent: {
    padding: SPACING.md,
  },
});
