import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../../navigation/types';
import { contractApi } from '../../api/contractApi';
import { useAuth } from '../../context/AuthContext';
import { Input, Button, Header } from '../../components';
import { COLORS } from '../../constants/colors';
import { RADIUS, SPACING } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Booking'>;

export const BookingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { car } = route.params;
  const { user } = useAuth();

  // Helper to get formatted default dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 2);

  const formatDateString = (d: Date) => {
    return d.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(formatDateString(today));
  const [expectedReturnDate, setExpectedReturnDate] = useState(formatDateString(tomorrow));
  const [pickupPoint, setPickupPoint] = useState('Số 10 Phạm Hùng, Cầu Giấy, Hà Nội');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculation of rental duration and estimated costs
  const calculateDays = () => {
    const s = new Date(startDate);
    const e = new Date(expectedReturnDate);
    const diff = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const days = calculateDays();
  const totalAmount = days * Number(car.price);
  const deposit = Math.round(totalAmount * 0.3); // 30% cọc

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val);
  };

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để tải ảnh lên.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });

    if (!result.canceled && result.assets) {
      setImages((prev) => [...prev, ...result.assets].slice(0, 6));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!startDate.trim()) errs.startDate = 'Vui lòng nhập ngày bắt đầu thuê';
    if (!expectedReturnDate.trim()) errs.expectedReturnDate = 'Vui lòng nhập ngày trả xe dự kiến';

    if (new Date(startDate) > new Date(expectedReturnDate)) {
      errs.expectedReturnDate = 'Ngày trả xe phải sau hoặc cùng ngày bắt đầu';
    }

    if (!pickupPoint.trim()) {
      errs.pickupPoint = 'Vui lòng nhập điểm đón xe';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBookingSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('carId', car.id);
      formData.append('startDate', startDate);
      formData.append('expectedReturnDate', expectedReturnDate);
      formData.append('pickupPoint', pickupPoint.trim());
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }

      // Add attached images
      images.forEach((img, idx) => {
        const uriParts = img.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        const fileObj: any = {
          uri: img.uri,
          name: `pickup_photo_${idx + 1}.${fileType || 'jpg'}`,
          type: `image/${fileType === 'png' ? 'png' : 'jpeg'}`,
        };
        formData.append('pickupImages', fileObj);
      });

      const response = await contractApi.createBooking(formData);

      if (response.success) {
        Alert.alert(
          'Đặt xe thành công! 🎉',
          'Yêu cầu thuê xe của bạn đã được ghi nhận. Nhân viên điều phối sẽ liên hệ xác nhận trong ít phút.',
          [
            {
              text: 'Xem hợp đồng của tôi',
              onPress: () => {
                navigation.navigate('Main', { screen: 'HistoryTab' } as any);
              },
            },
          ]
        );
      } else {
        throw new Error(response.message || 'Không thể tạo đơn đặt xe.');
      }
    } catch (err: any) {
      Alert.alert('Đặt xe thất bại', err.message || 'Đã xảy ra lỗi khi tạo hợp đồng.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}
    >
      <Header
        title="Xác Nhận Đặt Xe"
        subtitle={car.name}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Car Brief */}
        <View style={styles.carBrief}>
          <View style={styles.carBriefInfo}>
            <Text style={styles.carName}>{car.name}</Text>
            <Text style={styles.carMeta}>
              {car.brand} • {car.seatCount} chỗ • {car.fuelType}
            </Text>
            <Text style={styles.carPriceDay}>
              Đơn giá: <Text style={styles.boldPrimary}>{formatCurrency(car.price)}</Text> / ngày
            </Text>
          </View>
        </View>

        {/* Customer Information Preview */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông Tin Khách Hàng</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Họ và tên:</Text>
            <Text style={styles.infoVal}>{user?.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số điện thoại:</Text>
            <Text style={styles.infoVal}>{user?.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoVal}>{user?.email}</Text>
          </View>
        </View>

        {/* Booking Form Dates & Location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thời Gian & Điểm Nhận Xe</Text>

          <Input
            label="Ngày Bắt Đầu Thuê (YYYY-MM-DD) *"
            placeholder="2026-09-15"
            value={startDate}
            onChangeText={(v) => {
              setStartDate(v);
              if (errors.startDate) setErrors((p) => ({ ...p, startDate: '' }));
            }}
            error={errors.startDate}
          />

          <Input
            label="Ngày Trả Xe Dự Kiến (YYYY-MM-DD) *"
            placeholder="2026-09-17"
            value={expectedReturnDate}
            onChangeText={(v) => {
              setExpectedReturnDate(v);
              if (errors.expectedReturnDate) setErrors((p) => ({ ...p, expectedReturnDate: '' }));
            }}
            error={errors.expectedReturnDate}
          />

          <Input
            label="Điểm Đón / Nhận Xe Tại Hà Nội *"
            placeholder="Ví dụ: Tòa Keangnam, Mễ Trì, Nam Từ Liêm, Hà Nội"
            value={pickupPoint}
            onChangeText={(v) => {
              setPickupPoint(v);
              if (errors.pickupPoint) setErrors((p) => ({ ...p, pickupPoint: '' }));
            }}
            error={errors.pickupPoint}
          />

          <Input
            label="Ghi Chú Yêu Cầu Thêm"
            placeholder="Ví dụ: Cần thêm ghế trẻ em, nhận xe sáng sớm..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Image Attachment Section */}
        <View style={styles.card}>
          <View style={styles.imageSectionHeader}>
            <Text style={styles.cardTitle}>Ảnh Giấy Tờ / Nhận Xe (Tùy chọn)</Text>
            <TouchableOpacity onPress={pickImages} style={styles.addImageBtn}>
              <Text style={styles.addImageBtnText}>+ Thêm ảnh</Text>
            </TouchableOpacity>
          </View>

          {images.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {images.map((img, idx) => (
                <View key={idx} style={styles.imageWrapper}>
                  <Image source={{ uri: img.uri }} style={styles.uploadedThumb} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => removeImage(idx)}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyImageNotice}>
              Có thể tải ảnh GPLX hoặc ảnh tình trạng hiện trường nếu có.
            </Text>
          )}
        </View>

        {/* Financial Summary */}
        <View style={[styles.card, styles.priceSummaryCard]}>
          <Text style={styles.cardTitle}>Chi Phí Tạm Tính</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Số ngày thuê:</Text>
            <Text style={styles.summaryVal}>{days} ngày</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tổng tiền thuê:</Text>
            <Text style={styles.summaryVal}>{formatCurrency(totalAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tiền cọc giữ xe (30%):</Text>
            <Text style={styles.summaryValDeposit}>{formatCurrency(deposit)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Tổng thanh toán ước tính:</Text>
            <Text style={styles.summaryTotalVal}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>

        <Button
          title="Xác Nhận & Gửi Yêu Cầu Thuê Xe"
          onPress={handleBookingSubmit}
          loading={submitting}
          size="lg"
          style={styles.submitBtn}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  carBrief: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  carBriefInfo: {
    gap: 4,
  },
  carName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  carMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  carPriceDay: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  boldPrimary: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
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
  },
  imageSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addImageBtn: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  addImageBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  imageScroll: {
    marginTop: SPACING.sm,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: SPACING.sm,
  },
  uploadedThumb: {
    width: 70,
    height: 70,
    borderRadius: RADIUS.sm,
    backgroundColor: '#F1F5F9',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  emptyImageNotice: {
    fontSize: 12,
    color: COLORS.placeholder,
    marginTop: 4,
  },
  priceSummaryCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  summaryValDeposit: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.warning,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  summaryTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  summaryTotalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  submitBtn: {
    marginTop: SPACING.xs,
  },
});
