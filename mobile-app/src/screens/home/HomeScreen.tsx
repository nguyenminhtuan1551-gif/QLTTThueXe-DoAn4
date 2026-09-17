import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { carApi } from '../../api/carApi';
import { Car } from '../../types';
import { CarCard, Loading, EmptyState } from '../../components';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();

  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const categories = ['Tất cả', '4-5 chỗ', '7 chỗ', 'Sedan', 'SUV', 'Xe điện'];

  const fetchFeatured = async () => {
    try {
      const response = await carApi.getFeaturedCars();
      if (response.success && response.data) {
        setFeaturedCars(response.data);
      }
    } catch (error) {
      console.warn('Lỗi khi tải danh sách xe nổi bật:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeatured();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeatured();
  };

  const filteredCars = featuredCars.filter((car) => {
    if (selectedCategory === 'Tất cả') return true;
    if (selectedCategory === '4-5 chỗ') return car.seatCount <= 5;
    if (selectedCategory === '7 chỗ') return car.seatCount >= 7;
    if (selectedCategory === 'Sedan') return car.type?.toLowerCase().includes('sedan');
    if (selectedCategory === 'SUV') return car.type?.toLowerCase().includes('suv');
    if (selectedCategory === 'Xe điện') return car.fuelType?.toLowerCase().includes('điện');
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greetingText}>Xin chào,</Text>
          <Text style={styles.userName}>{user?.fullName || 'Quý khách'}</Text>
        </View>
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => navigation.navigate('Main', { screen: 'ProfileTab' } as any)}
        >
          <Text style={styles.avatarText}>
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Banner Hero */}
        <View style={styles.heroBanner}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTag}>DỊCH VỤ CHUYÊN NGHIỆP</Text>
            <Text style={styles.heroTitle}>Thuê Xe Tự Lái Tại Hà Nội</Text>
            <Text style={styles.heroSubtitle}>
              Giao xe tận nơi • Thủ tục 5 phút • Bảo hiểm 100%
            </Text>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => navigation.navigate('Main', { screen: 'CarListTab' } as any)}
            >
              <Text style={styles.heroBtnText}>Khám Phá Toàn Bộ Xe</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Search Shortcut */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Main', { screen: 'CarListTab' } as any)}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Tìm xe theo tên, hãng (Toyota, Mazda, VinFast...)</Text>
        </TouchableOpacity>

        {/* Category Chips */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Phân Loại Xe</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Featured Cars List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Xe Nổi Bật & Sẵn Sàng</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Main', { screen: 'CarListTab' } as any)}
          >
            <Text style={styles.viewAllText}>Xem tất cả ›</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Loading message="Đang tải danh sách xe..." />
        ) : filteredCars.length === 0 ? (
          <EmptyState
            title="Chưa có xe nào trong danh mục này"
            description="Hãy thử chọn danh mục khác hoặc xem toàn bộ danh sách xe."
          />
        ) : (
          <View style={styles.carsList}>
            {filteredCars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                onPress={() =>
                  navigation.navigate('CarDetail', { carId: car.id, car })
                }
              />
            ))}
          </View>
        )}

        {/* Service Highlights */}
        <View style={styles.highlightsCard}>
          <Text style={styles.highlightsTitle}>Cam Kết Dịch Vụ</Text>
          <View style={styles.highlightItem}>
            <Text style={styles.highlightEmoji}>🛡️</Text>
            <View style={styles.highlightTextCol}>
              <Text style={styles.highlightHeading}>Xe Đăng Kiểm Đầy Đủ</Text>
              <Text style={styles.highlightDesc}>100% xe được kiểm định định kỳ và bảo hiểm đầy đủ</Text>
            </View>
          </View>
          <View style={styles.highlightItem}>
            <Text style={styles.highlightEmoji}>📍</Text>
            <View style={styles.highlightTextCol}>
              <Text style={styles.highlightHeading}>Giao Xe Trong Khu Vực Hà Nội</Text>
              <Text style={styles.highlightDesc}>Hỗ trợ bàn giao tận nơi tại tất cả các quận huyện Hà Nội</Text>
            </View>
          </View>
          <View style={styles.highlightItem}>
            <Text style={styles.highlightEmoji}>⚡</Text>
            <View style={styles.highlightTextCol}>
              <Text style={styles.highlightHeading}>Thủ Tục Đơn Giản</Text>
              <Text style={styles.highlightDesc}>Chỉ cần CCCD và GPLX hợp lệ là có thể nhận xe ngay</Text>
            </View>
          </View>
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greetingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  heroBanner: {
    margin: SPACING.md,
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    overflow: 'hidden',
  },
  heroTextContainer: {
    gap: 6,
  },
  heroTag: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: '#E0E7FF',
    fontSize: 13,
    marginBottom: SPACING.sm,
  },
  heroBtn: {
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
  },
  heroBtnText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  searchPlaceholder: {
    color: COLORS.placeholder,
    fontSize: 14,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  carsList: {
    paddingHorizontal: SPACING.md,
  },
  highlightsCard: {
    margin: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  highlightsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  highlightEmoji: {
    fontSize: 20,
  },
  highlightTextCol: {
    flex: 1,
  },
  highlightHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  highlightDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
