import React, { useState, useEffect } from 'react';
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
  Modal,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../../navigation/types';
import { contractApi } from '../../api/contractApi';
import { useAuth } from '../../context/AuthContext';
import { Input, Button, Header } from '../../components';
import { COLORS } from '../../constants/colors';
import { RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { CONFIG } from '../../constants/config';

type Props = NativeStackScreenProps<RootStackParamList, 'Booking'>;

export const BookingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { car } = route.params;
  const { user } = useAuth();

  // Helper date format YYYY-MM-DD
  const formatDateToYMD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const defaultEnd = new Date(today);
  defaultEnd.setDate(defaultEnd.getDate() + 2);

  // Form State
  const [startDate, setStartDate] = useState(formatDateToYMD(today));
  const [expectedReturnDate, setExpectedReturnDate] = useState(formatDateToYMD(defaultEnd));
  const [pickupPoint, setPickupPoint] = useState('Số 10 Phạm Hùng, Cầu Giấy, Hà Nội');
  const [notes, setNotes] = useState('');

  // Customer Profile Information Form
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [cccd, setCccd] = useState(user?.cccd || '');
  const [driverLicense, setDriverLicense] = useState(user?.driverLicense || '');
  const [address, setAddress] = useState(user?.address || 'Hà Nội');

  // Images state
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Quick Date Picker Modal State
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [targetDateField, setTargetDateField] = useState<'start' | 'end'>('start');

  // Update user profile fields if context changed
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.fullName || '');
      if (!phone) setPhone(user.phone || '');
      if (!email) setEmail(user.email || '');
      if (!cccd && user.cccd) setCccd(user.cccd);
      if (!driverLicense && user.driverLicense) setDriverLicense(user.driverLicense);
      if (!address && user.address) setAddress(user.address);
    }
  }, [user]);

  // Rental duration calculation
  const calculateDays = () => {
    const s = new Date(startDate);
    const e = new Date(expectedReturnDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
    const diff = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const days = calculateDays();
  const dailyPrice = Number(car.price) || 0;
  const totalAmount = days * dailyPrice;
  const deposit = Math.round(totalAmount * 0.3); // 30% tiền đặt cọc giữ xe

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val || 0);
  };

  // Image Picker Handler: Chụp ảnh hoặc chọn từ thư viện
  const handleSelectImageSource = () => {
    Alert.alert('Tải ảnh hồ sơ', 'Chọn nguồn tải ảnh giấy tờ / bằng lái xe (Tối đa 6 ảnh)', [
      {
        text: '📸 Chụp ảnh ngay',
        onPress: takePhoto,
      },
      {
        text: '🖼️ Chọn từ Album',
        onPress: pickImagesFromLibrary,
      },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  const takePhoto = async () => {
    const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPerm.granted) {
      Alert.alert('Cấp quyền máy ảnh', 'Vui lòng cấp quyền truy cập Camera để chụp ảnh giấy tờ.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages((prev) => [...prev, ...result.assets].slice(0, 6));
    }
  };

  const pickImagesFromLibrary = async () => {
    const mediaPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!mediaPerm.granted) {
      Alert.alert('Cấp quyền thư viện', 'Vui lòng cấp quyền truy cập thư viện ảnh để tải ảnh lên.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 6 - images.length,
    });

    if (!result.canceled && result.assets) {
      setImages((prev) => [...prev, ...result.assets].slice(0, 6));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Validation
  const validate = () => {
    const errs: Record<string, string> = {};

    if (!startDate.trim()) errs.startDate = 'Vui lòng chọn ngày nhận xe';
    if (!expectedReturnDate.trim()) errs.expectedReturnDate = 'Vui lòng chọn ngày trả xe dự kiến';

    const s = new Date(startDate);
    const e = new Date(expectedReturnDate);
    if (isNaN(s.getTime())) errs.startDate = 'Định dạng ngày nhận không hợp lệ (YYYY-MM-DD)';
    if (isNaN(e.getTime())) errs.expectedReturnDate = 'Định dạng ngày trả không hợp lệ (YYYY-MM-DD)';
    if (s > e) {
      errs.expectedReturnDate = 'Ngày trả xe dự kiến phải sau hoặc cùng ngày nhận xe';
    }

    if (!pickupPoint.trim()) {
      errs.pickupPoint = 'Vui lòng nhập điểm đón / nhận xe trong khu vực Hà Nội';
    }

    if (!fullName.trim()) errs.fullName = 'Vui lòng nhập họ và tên khách hàng';
    if (!phone.trim()) {
      errs.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(phone.trim())) {
      errs.phone = 'Số điện thoại Việt Nam không đúng định dạng';
    }

    if (!driverLicense.trim()) {
      errs.driverLicense = 'Vui lòng cung cấp số Giấy phép lái xe (GPLX)';
    }

    if (!address.trim()) {
      errs.address = 'Vui lòng nhập địa chỉ cư trú';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Booking Request
  const handleBookingSubmit = async () => {
    if (!validate()) {
      Alert.alert('Thông tin chưa hoàn tất', 'Vui lòng kiểm tra lại các trường thông tin có đánh dấu đỏ.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('carId', car.id);
      formData.append('startDate', startDate);
      formData.append('expectedReturnDate', expectedReturnDate);
      formData.append('pickupPoint', pickupPoint.trim());
      formData.append('deposit', String(deposit));
      formData.append('totalAmount', String(totalAmount));

      // Customer payload
      formData.append('fullName', fullName.trim());
      formData.append('phone', phone.trim());
      formData.append('email', email.trim() || (user?.email ?? ''));
      formData.append('cccd', cccd.trim() || 'Chưa cập nhật');
      formData.append('driverLicense', driverLicense.trim());
      formData.append('address', address.trim());

      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }

      // Attach images to FormData
      images.forEach((img, idx) => {
        const uriParts = img.uri.split('.');
        const fileType = uriParts[uriParts.length - 1]?.toLowerCase() || 'jpg';

        const fileObj: any = {
          uri: Platform.OS === 'ios' ? img.uri.replace('file://', '') : img.uri,
          name: `booking_doc_${idx + 1}_${Date.now()}.${fileType === 'png' ? 'png' : 'jpg'}`,
          type: fileType === 'png' ? 'image/png' : 'image/jpeg',
        };
        formData.append('pickupImages', fileObj);
      });

      const response = await contractApi.createBooking(formData);

      if (response.success && response.data) {
        // Chuyển hướng sang màn hình BookingSuccess
        navigation.replace('BookingSuccess', { contract: response.data });
      } else {
        throw new Error(response.message || 'Không thể gửi yêu cầu đặt xe.');
      }
    } catch (err: any) {
      Alert.alert('Đặt xe thất bại', err.message || 'Đã có lỗi xảy ra khi tạo yêu cầu thuê xe.');
    } finally {
      setSubmitting(false);
    }
  };

  // Preset Date Selection Generator
  const generatePresetDates = () => {
    const list: string[] = [];
    const base = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      list.push(formatDateToYMD(d));
    }
    return list;
  };

  const presetDates = generatePresetDates();

  const carImageUrl = car.image
    ? car.image.startsWith('http')
      ? car.image
      : `${CONFIG.IMAGE_BASE_URL}${car.image}`
    : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <Header
        title="Đặt Thuê Xe Trực Tuyến"
        subtitle={car.name}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Car Brief Header Card */}
        <View style={styles.carCard}>
          <Image source={{ uri: carImageUrl }} style={styles.carThumb} resizeMode="cover" />
          <View style={styles.carInfoCol}>
            <Text style={styles.carBrandText}>{car.brand} • Đời {car.year}</Text>
            <Text style={styles.carTitle} numberOfLines={1}>{car.name}</Text>
            <Text style={styles.carPlateText}>Biển số: <Text style={styles.boldDark}>{car.licensePlate}</Text></Text>
            <Text style={styles.carPriceText}>
              Đơn giá: <Text style={styles.priceHighlight}>{formatCurrency(dailyPrice)}</Text> / ngày
            </Text>
          </View>
        </View>

        {/* Rental Time Selection */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>📅 1. Thời Gian & Lịch Trình</Text>

          <View style={styles.datePickerRow}>
            <View style={styles.dateCol}>
              <Text style={styles.dateFieldLabel}>Ngày nhận xe *</Text>
              <TouchableOpacity
                style={[styles.datePickerBtn, errors.startDate ? styles.datePickerError : null]}
                onPress={() => {
                  setTargetDateField('start');
                  setDateModalVisible(true);
                }}
              >
                <Text style={styles.datePickerBtnText}>🗓️ {startDate}</Text>
              </TouchableOpacity>
              {errors.startDate ? <Text style={styles.errorText}>{errors.startDate}</Text> : null}
            </View>

            <View style={styles.dateCol}>
              <Text style={styles.dateFieldLabel}>Ngày trả dự kiến *</Text>
              <TouchableOpacity
                style={[styles.datePickerBtn, errors.expectedReturnDate ? styles.datePickerError : null]}
                onPress={() => {
                  setTargetDateField('end');
                  setDateModalVisible(true);
                }}
              >
                <Text style={styles.datePickerBtnText}>🗓️ {expectedReturnDate}</Text>
              </TouchableOpacity>
              {errors.expectedReturnDate ? (
                <Text style={styles.errorText}>{errors.expectedReturnDate}</Text>
              ) : null}
            </View>
          </View>

          <Input
            label="Địa điểm nhận / giao xe tại Hà Nội *"
            placeholder="Ví dụ: Tòa Keangnam, Mễ Trì, Nam Từ Liêm, Hà Nội"
            value={pickupPoint}
            onChangeText={(v) => {
              setPickupPoint(v);
              if (errors.pickupPoint) setErrors((p) => ({ ...p, pickupPoint: '' }));
            }}
            error={errors.pickupPoint}
          />

          <Input
            label="Ghi chú thêm cho điều phối viên"
            placeholder="Ví dụ: Nhận xe lúc 8h sáng, cần thêm ghế trẻ em, rửa xe sạch..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Customer Profile Autofill */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionHeaderTitle}>👤 2. Thông Tin Khách Hàng</Text>
            <Text style={styles.autoFilledBadge}>Tự động điền</Text>
          </View>

          <Input
            label="Họ và Tên *"
            placeholder="Nguyễn Văn A"
            value={fullName}
            onChangeText={(v) => {
              setFullName(v);
              if (errors.fullName) setErrors((p) => ({ ...p, fullName: '' }));
            }}
            error={errors.fullName}
          />

          <Input
            label="Số Điện Thoại Nhận Xe *"
            placeholder="0912345678"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(v) => {
              setPhone(v);
              if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
            }}
            error={errors.phone}
          />

          <Input
            label="Số Giấy Phép Lái Xe (GPLX) *"
            placeholder="B2 - 0123456789"
            value={driverLicense}
            onChangeText={(v) => {
              setDriverLicense(v);
              if (errors.driverLicense) setErrors((p) => ({ ...p, driverLicense: '' }));
            }}
            error={errors.driverLicense}
          />

          <Input
            label="Số CCCD / CMND"
            placeholder="001201012345"
            keyboardType="number-pad"
            value={cccd}
            onChangeText={setCccd}
          />

          <Input
            label="Địa chỉ thường trú *"
            placeholder="Số nhà, đường, quận, Hà Nội"
            value={address}
            onChangeText={(v) => {
              setAddress(v);
              if (errors.address) setErrors((p) => ({ ...p, address: '' }));
            }}
            error={errors.address}
          />
        </View>

        {/* Document Uploads */}
        <View style={styles.sectionCard}>
          <View style={styles.imageSectionHeader}>
            <View>
              <Text style={styles.sectionHeaderTitle}>📸 3. Ảnh Giấy Tờ & Hồ Sơ</Text>
              <Text style={styles.sectionHeaderSub}>
                Ảnh chụp mặt trước/sau CCCD, GPLX (Tối đa 6 ảnh)
              </Text>
            </View>
            <TouchableOpacity onPress={handleSelectImageSource} style={styles.uploadBtn}>
              <Text style={styles.uploadBtnText}>+ Thêm ảnh</Text>
            </TouchableOpacity>
          </View>

          {images.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
              {images.map((img, idx) => (
                <View key={`img-${idx}`} style={styles.imageItemWrap}>
                  <Image source={{ uri: img.uri }} style={styles.imageThumb} />
                  <TouchableOpacity
                    style={styles.removeImageBadge}
                    onPress={() => removeImage(idx)}
                  >
                    <Text style={styles.removeImageBadgeText}>✕</Text>
                  </TouchableOpacity>
                  <Text style={styles.imageIdxText}>Ảnh {idx + 1}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <TouchableOpacity style={styles.emptyUploadBox} onPress={handleSelectImageSource}>
              <Text style={styles.emptyUploadIcon}>📷</Text>
              <Text style={styles.emptyUploadText}>
                Bấm vào đây để chụp hoặc chọn ảnh CCCD / GPLX
              </Text>
              <Text style={styles.emptyUploadSubtext}>Giúp quá trình duyệt hợp đồng diễn ra nhanh hơn</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Price Calculation Summary */}
        <View style={[styles.sectionCard, styles.priceCard]}>
          <Text style={styles.sectionHeaderTitle}>💰 4. Bảng Kê Chi Phí Tạm Tính</Text>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Thời gian thuê:</Text>
            <Text style={styles.calcVal}>{days} ngày ({startDate} ➔ {expectedReturnDate})</Text>
          </View>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Đơn giá thuê xe:</Text>
            <Text style={styles.calcVal}>{formatCurrency(dailyPrice)} / ngày</Text>
          </View>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Tổng tiền thuê dự kiến:</Text>
            <Text style={styles.calcValBold}>{formatCurrency(totalAmount)}</Text>
          </View>

          <View style={styles.calcDivider} />

          <View style={styles.calcRow}>
            <View>
              <Text style={styles.depositLabel}>Tiền cọc giữ xe (30%):</Text>
              <Text style={styles.depositSub}>Thanh toán khi xác nhận đặt xe</Text>
            </View>
            <Text style={styles.depositHighlight}>{formatCurrency(deposit)}</Text>
          </View>

          <View style={styles.calcRow}>
            <View>
              <Text style={styles.remainingLabel}>Số tiền còn lại (70%):</Text>
              <Text style={styles.remainingSub}>Thanh toán khi bàn giao xe</Text>
            </View>
            <Text style={styles.remainingVal}>{formatCurrency(totalAmount - deposit)}</Text>
          </View>
        </View>

        {/* Submit Button */}
        <Button
          title="Xác Nhận & Gửi Yêu Cầu Thuê Xe ➔"
          onPress={handleBookingSubmit}
          loading={submitting}
          size="lg"
          style={styles.submitBtn}
        />

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={dateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dateModalCard}>
            <Text style={styles.dateModalTitle}>
              Chọn {targetDateField === 'start' ? 'Ngày Nhận Xe' : 'Ngày Trả Dự Kiến'}
            </Text>
            <Text style={styles.dateModalSub}>Lựa chọn nhanh trong 30 ngày tới</Text>

            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              <View style={styles.presetDateGrid}>
                {presetDates.map((item) => {
                  const isCurrent = targetDateField === 'start' ? startDate === item : expectedReturnDate === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[styles.presetDateChip, isCurrent && styles.presetDateChipActive]}
                      onPress={() => {
                        if (targetDateField === 'start') {
                          setStartDate(item);
                        } else {
                          setExpectedReturnDate(item);
                        }
                        setDateModalVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.presetDateChipText,
                          isCurrent && styles.presetDateChipTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <Button
              title="Đóng"
              variant="outline"
              size="sm"
              onPress={() => setDateModalVisible(false)}
              style={{ marginTop: SPACING.md }}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
  carCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.card,
  },
  carThumb: {
    width: 100,
    height: 80,
    borderRadius: RADIUS.md,
    backgroundColor: '#F1F5F9',
  },
  carInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  carBrandText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  carTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  carPlateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  boldDark: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  carPriceText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  priceHighlight: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sectionHeaderSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  autoFilledBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  datePickerRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  dateCol: {
    flex: 1,
  },
  dateFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  datePickerBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  datePickerError: {
    borderColor: COLORS.error,
  },
  datePickerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 10,
    marginTop: 2,
  },
  imageSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  uploadBtn: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  uploadBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  imagesScroll: {
    paddingVertical: 4,
  },
  imageItemWrap: {
    position: 'relative',
    marginRight: SPACING.sm,
    alignItems: 'center',
  },
  imageThumb: {
    width: 76,
    height: 76,
    borderRadius: RADIUS.md,
    backgroundColor: '#F1F5F9',
  },
  removeImageBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  imageIdxText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyUploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  emptyUploadIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  emptyUploadText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptyUploadSubtext: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  priceCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  calcLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  calcVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  calcValBold: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  calcDivider: {
    height: 1,
    backgroundColor: '#BBF7D0',
    marginVertical: SPACING.sm,
  },
  depositLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  depositSub: {
    fontSize: 10,
    color: '#15803D',
  },
  depositHighlight: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.warning,
  },
  remainingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  remainingSub: {
    fontSize: 10,
    color: COLORS.placeholder,
  },
  remainingVal: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  submitBtn: {
    marginTop: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  dateModalCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.elevated,
  },
  dateModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  dateModalSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    marginTop: 2,
  },
  presetDateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  presetDateChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetDateChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  presetDateChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  presetDateChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
});
