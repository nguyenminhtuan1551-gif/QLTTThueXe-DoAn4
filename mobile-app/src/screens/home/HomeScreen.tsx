import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  FlatList,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { carApi } from '../../api/carApi';
import { Car } from '../../types';
import { CarCard, Loading, EmptyState, Badge } from '../../components';
import { COLORS } from '../../constants/colors';
import { CONFIG } from '../../constants/config';
import { RADIUS, SHADOWS, SPACING } from '../../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();

  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('Tất cả');

  const brandList = ['Tất cả', 'Toyota', 'Mazda', 'Hyundai', 'Honda', 'Kia', 'VinFast', 'Ford'];

  const fetchData = async () => {
    try {
      const [featuredRes, allRes] = await Promise.allSettled([
        carApi.getFeaturedCars(),
        carApi.getCars(),
      ]);

      if (featuredRes.status === 'fulfilled' && featuredRes.value.success && featuredRes.value.data) {
        setFeaturedCars(featuredRes.value.data);
      }
      if (allRes.status === 'fulfilled' && allRes.value.success && allRes.value.data) {
        setAllCars(allRes.value.data);
      }
    } catch (error) {
      console.warn('Lỗi khi tải dữ liệu trang chủ:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val);
  };

  const filteredCars = allCars.filter((car) => {
    if (selectedBrand === 'Tất cả') return true;
    return car.brand.toLowerCase() === selectedBrand.toLowerCase();
  });

  const renderFeaturedItem = ({ item }: { item: Car }) => {
    const imageUrl = item.image
      ? item.image.startsWith('http')
        ? item.image
        : `${CONFIG.IMAGE_BASE_URL}${item.image}`
      : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80';

    return (
      <TouchableOpacity
        style={styles.featuredCard}
        activeOpacity={0.88}
        onPress={() => navigation.navigate('CarDetail', { carId: item.id, car: item })}
      >
        <View style={styles.featuredImageWrap}>
          <Image source={{ uri: imageUrl }} style={styles.featuredImage} resizeMode="cover" />
          <View style={styles.featuredBadge}>
            <Badge label={item.status} />
          </View>
          <View style={styles.featuredTag}>
            <Text style={styles.featuredTagText}>⭐ Nổi bật</Text>
          </View>
        </View>
        <View style={styles.featuredContent}>
          <Text style={styles.featuredBrand}>{item.brand}</Text>
          <Text style={styles.featuredName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.featuredSpecs}>
            <Text style={styles.featuredSpecText}>💺 {item.seatCount} chỗ</Text>
            <Text style={styles.featuredSpecText}>⛽ {item.fuelType}</Text>
          </View>
          <View style={styles.featuredFooter}>
            <View>
              <Text style={styles.featuredPriceLabel}>Giá theo ngày</Text>
              <Text style={styles.featuredPrice}>{formatCurrency(item.price)}</Text>
            </View>
            <View style={styles.featuredBtn}>
              <Text style={styles.featuredBtnText}>Chi tiết ›</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <View style={styles.userCol}>
          <Text style={styles.greetingText}>Xin chào 👋</Text>
          <Text style={styles.userName}>{user?.fullName || 'Quý khách hàng'}</Text>
          <Text style={styles.userLocation}>📍 Khu vực Hà Nội</Text>
        </View>
        <TouchableOpacity
          style={styles.avatarBtn}
          activeOpacity={0.8}
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
        {/* Quick Search Shortcut Box */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Main', { screen: 'CarListTab' } as any)}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <View style={styles.searchPlaceholderCol}>
            <Text style={styles.searchPlaceholder}>Tìm xe theo tên, hãng hoặc biển số...</Text>
            <Text style={styles.searchSubtext}>Toyota, Mazda, VinFast, SUV 7 chỗ...</Text>
          </View>
          <View style={styles.searchActionBadge}>
            <Text style={styles.searchActionText}>Tìm kiếm</Text>
          </View>
        </TouchableOpacity>

        {/* Promotion Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroGlow} />
          <View style={styles.heroTextContainer}>
            <View style={styles.promoPill}>
              <Text style={styles.promoPillText}>🚗 DỊCH VỤ THUÊ XE UY TÍN HÀ NỘI</Text>
            </View>
            <Text style={styles.heroTitle}>Thuê Xe Tự Lái & Có Tài</Text>
            <Text style={styles.heroSubtitle}>
              Giao xe tận nơi • Thủ tục 5 phút • Đăng kiểm & bảo hiểm 100%
            </Text>
            <TouchableOpacity
              style={styles.heroBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Main', { screen: 'CarListTab' } as any)}
            >
              <Text style={styles.heroBtnText}>Khám Phá Danh Mục Xe ›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Horizontal Featured Cars Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Xe Nổi Bật Được Yêu Thích</Text>
            <Text style={styles.sectionSubtitle}>Các dòng xe có lượt thuê cao và sẵn sàng</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Main', { screen: 'CarListTab' } as any)}
          >
            <Text style={styles.viewAllText}>Xem tất cả ›</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Loading message="Đang tải xe nổi bật..." />
        ) : featuredCars.length === 0 ? (
          <View style={styles.emptyFeatured}>
            <Text style={styles.emptyFeaturedText}>Chưa có xe nổi bật nào.</Text>
          </View>
        ) : (
          <FlatList
            data={featuredCars}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => `feat-${item.id}`}
            contentContainerStyle={styles.featuredList}
            renderItem={renderFeaturedItem}
          />
        )}

        {/* Brand Filter Pills */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Hãng Xe Phổ Biến</Text>
            <Text style={styles.sectionSubtitle}>Lọc nhanh theo thương hiệu bạn muốn</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.brandScroll}
        >
          {brandList.map((brand) => {
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

        {/* All Cars by Category */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedBrand === 'Tất cả' ? 'Tất Cả Xe Cho Thuê' : `Xe Hãng ${selectedBrand}`}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Main', { screen: 'CarListTab' } as any)}
          >
            <Text style={styles.viewAllText}>Toàn bộ danh mục ›</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Loading message="Đang tải danh sách xe..." />
        ) : filteredCars.length === 0 ? (
          <EmptyState
            title="Không có xe thuộc hãng này"
            description="Hãy thử chọn hãng xe khác hoặc xem toàn bộ danh mục xe."
            actionTitle="Xem tất cả xe"
            onAction={() => setSelectedBrand('Tất cả')}
          />
        ) : (
          <View style={styles.carsList}>
            {filteredCars.slice(0, 6).map((car) => (
              <CarCard
                key={car.id}
                car={car}
                onPress={() => navigation.navigate('CarDetail', { carId: car.id, car })}
              />
            ))}
          </View>
        )}

        {/* Quick CTA to Full Catalog */}
        <TouchableOpacity
          style={styles.fullCatalogCta}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Main', { screen: 'CarListTab' } as any)}
        >
          <Text style={styles.fullCatalogCtaText}>
            Xem Thêm {allCars.length > 6 ? `(${allCars.length - 6} xe khác)` : 'Tất Cả Xe'} Trong Danh Mục ›
          </Text>
        </TouchableOpacity>

        {/* Service Highlights */}
        <View style={styles.highlightsCard}>
          <Text style={styles.highlightsTitle}>Cam Kết Dịch Vụ Khách Hàng</Text>
          <View style={styles.highlightItem}>
            <View style={styles.highlightIconBox}>
              <Text style={styles.highlightEmoji}>🛡️</Text>
            </View>
            <View style={styles.highlightTextCol}>
              <Text style={styles.highlightHeading}>Đăng Kiểm & Bảo Hiểm Đầy Đủ</Text>
              <Text style={styles.highlightDesc}>
                100% xe được kiểm định định kỳ, giấy tờ hợp lệ và bảo hiểm thân vỏ đầy đủ.
              </Text>
            </View>
          </View>

          <View style={styles.highlightItem}>
            <View style={styles.highlightIconBox}>
              <Text style={styles.highlightEmoji}>📍</Text>
            </View>
            <View style={styles.highlightTextCol}>
              <Text style={styles.highlightHeading}>Bàn Giao Tận Nơi Tại Hà Nội</Text>
              <Text style={styles.highlightDesc}>
                Hỗ trợ giao xe tận nhà, sân bay Nội Bài, hoặc các điểm nhận xe trung tâm.
              </Text>
            </View>
          </View>

          <View style={styles.highlightItem}>
            <View style={styles.highlightIconBox}>
              <Text style={styles.highlightEmoji}>⚡</Text>
            </View>
            <View style={styles.highlightTextCol}>
              <Text style={styles.highlightHeading}>Thủ Tục Đơn Giản & Minh Bạch</Text>
              <Text style={styles.highlightDesc}>
                Chỉ cần CCCD và GPLX hợp lệ. Ký kết hợp đồng số hóa rõ ràng, không phụ phí ẩn.
              </Text>
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
  userCol: {
    flex: 1,
  },
  greetingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  userLocation: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BFDBFE',
    ...SHADOWS.card,
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    ...SHADOWS.card,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  searchPlaceholderCol: {
    flex: 1,
  },
  searchPlaceholder: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  searchSubtext: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  searchActionBadge: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  searchActionText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  heroBanner: {
    margin: SPACING.md,
    backgroundColor: '#0F172A',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    overflow: 'hidden',
    position: 'relative',
    ...SHADOWS.elevated,
  },
  heroGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#1E40AF',
    opacity: 0.5,
  },
  heroTextContainer: {
    gap: 6,
  },
  promoPill: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginBottom: 4,
  },
  promoPillText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  heroBtn: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    marginTop: 4,
  },
  heroBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  featuredList: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  featuredCard: {
    width: 250,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  featuredImageWrap: {
    width: '100%',
    height: 140,
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  featuredTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  featuredTagText: {
    color: '#FDE047',
    fontSize: 11,
    fontWeight: '700',
  },
  featuredContent: {
    padding: SPACING.sm + 2,
  },
  featuredBrand: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  featuredName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
    marginBottom: 4,
  },
  featuredSpecs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  featuredSpecText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  featuredPriceLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  featuredPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  featuredBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryMuted,
  },
  featuredBtnText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyFeatured: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  emptyFeaturedText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  brandScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
    paddingBottom: SPACING.xs,
  },
  brandChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  brandChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  brandChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  brandChipTextActive: {
    color: COLORS.white,
  },
  carsList: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.xs,
  },
  fullCatalogCta: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  fullCatalogCtaText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  highlightsCard: {
    margin: SPACING.md,
    marginTop: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
    ...SHADOWS.card,
  },
  highlightsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  highlightIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightEmoji: {
    fontSize: 18,
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
    lineHeight: 16,
  },
});
