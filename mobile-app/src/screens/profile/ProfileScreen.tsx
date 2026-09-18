import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { contactApi } from '../../api/contactApi';
import { Button, Header, Input } from '../../components';
import { COLORS } from '../../constants/colors';
import { CONFIG } from '../../constants/config';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { AuthUser } from '../../types';

export const ProfileScreen: React.FC = () => {
  const { user, logout, refreshProfile } = useAuth();

  // Support contact state
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactContent, setContactContent] = useState('');
  const [sendingContact, setSendingContact] = useState(false);

  // Edit documents modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [cccd, setCccd] = useState(user?.cccd || '');
  const [driverLicense, setDriverLicense] = useState(user?.driverLicense || '');
  const [address, setAddress] = useState(user?.address || '');
  const [savingDocs, setSavingDocs] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setCccd(user.cccd || '');
      setDriverLicense(user.driverLicense || '');
      setAddress(user.address || '');
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert('Đăng xuất tài khoản', 'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleSendContact = async () => {
    if (!contactContent.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung cần giải đáp hoặc hỗ trợ.');
      return;
    }

    setSendingContact(true);
    try {
      await contactApi.sendContact({
        fullName: user?.fullName || 'Khách hàng',
        phone: user?.phone || '',
        email: user?.email || '',
        content: contactContent.trim(),
      });
      Alert.alert('Gửi thành công! 🎉', 'Ý kiến của bạn đã được tiếp nhận. Đội ngũ CSKH sẽ phản hồi sớm nhất.');
      setContactContent('');
      setShowContactModal(false);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể gửi phản hồi.');
    } finally {
      setSendingContact(false);
    }
  };

  const handleSaveDocs = async () => {
    if (!fullName.trim() || !phone.trim() || !driverLicense.trim() || !address.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ họ tên, SĐT, GPLX và địa chỉ.');
      return;
    }

    setSavingDocs(true);
    try {
      const updatedUser: AuthUser = {
        ...(user as AuthUser),
        fullName: fullName.trim(),
        phone: phone.trim(),
        cccd: cccd.trim() || undefined,
        driverLicense: driverLicense.trim(),
        address: address.trim(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      await refreshProfile().catch(() => {});
      Alert.alert('Thành công', 'Thông tin giấy tờ và hồ sơ cá nhân đã được cập nhật thành công!');
      setShowEditModal(false);
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể lưu thông tin hồ sơ.');
    } finally {
      setSavingDocs(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <Header title="Tài Khoản & Hồ Sơ" subtitle="Quản lý thông tin giấy tờ khách hàng" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.userInfoCol}>
            <Text style={styles.userName}>{user?.fullName || 'Khách hàng'}</Text>
            <View style={styles.memberTag}>
              <Text style={styles.memberTagText}>⭐ Khách hàng thành viên</Text>
            </View>
            <Text style={styles.userPhone}>📱 {user?.phone || 'Chưa có SĐT'}</Text>
            <Text style={styles.userEmail}>✉️ {user?.email || 'Chưa có email'}</Text>
          </View>
        </View>

        {/* Identification & Documents */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>📋 Hồ Sơ & Giấy Tờ Đã Lưu</Text>
            <TouchableOpacity onPress={() => setShowEditModal(true)} style={styles.editBtn}>
              <Text style={styles.editBtnText}>Cập nhật ✎</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã định danh KH:</Text>
            <Text style={styles.infoValHighlight}>{user?.id || 'KH---'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số CCCD / CMND:</Text>
            <Text style={styles.infoVal}>{user?.cccd || 'Chưa cập nhật'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số Giấy phép lái xe:</Text>
            <Text style={styles.infoVal}>{user?.driverLicense || 'Chưa cập nhật'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Địa chỉ thường trú:</Text>
            <Text style={styles.infoVal} numberOfLines={2}>{user?.address || 'Hà Nội'}</Text>
          </View>
        </View>

        {/* Customer Support & Policies */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🎧 Hỗ Trợ & Liên Hệ</Text>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => setShowContactModal(true)}
          >
            <View style={styles.menuIconBox}>
              <Text style={styles.menuIcon}>💬</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Gửi yêu cầu hỗ trợ / Góp ý</Text>
              <Text style={styles.menuSubText}>Phản hồi chất lượng xe & dịch vụ</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <View style={styles.menuIconBox}>
              <Text style={styles.menuIcon}>📞</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Hotline hỗ trợ 24/7</Text>
              <Text style={styles.menuSubHighlight}>{CONFIG.SUPPORT_PHONE}</Text>
            </View>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuIconBox}>
              <Text style={styles.menuIcon}>✉️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Email tiếp nhận thông tin</Text>
              <Text style={styles.menuSubText}>{CONFIG.SUPPORT_EMAIL}</Text>
            </View>
          </View>
        </View>

        {/* System & Logout */}
        <View style={styles.sectionCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phiên bản hệ thống:</Text>
            <Text style={styles.infoVal}>v{CONFIG.VERSION} (React Native Mobile)</Text>
          </View>

          <Button
            title="Đăng Xuất Khỏi Thiết Bị"
            onPress={handleLogout}
            variant="danger"
            style={styles.logoutBtn}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Profile / Documents Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cập Nhật Giấy Tờ & Hồ Sơ</Text>
            <Text style={styles.modalSub}>
              Thông tin sẽ được tự động điền trong các lần thuê xe tiếp theo
            </Text>

            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              <Input
                label="Họ và Tên *"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nguyễn Văn A"
              />

              <Input
                label="Số Điện Thoại *"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="0912345678"
              />

              <Input
                label="Số CCCD / CMND"
                value={cccd}
                onChangeText={setCccd}
                keyboardType="number-pad"
                placeholder="001201012345"
              />

              <Input
                label="Số GPLX (Bằng lái xe) *"
                value={driverLicense}
                onChangeText={setDriverLicense}
                placeholder="B2 - 0123456789"
              />

              <Input
                label="Địa chỉ thường trú *"
                value={address}
                onChangeText={setAddress}
                placeholder="Số nhà, đường, quận, Hà Nội"
              />
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <Button
                title="Hủy"
                variant="outline"
                onPress={() => setShowEditModal(false)}
                style={styles.modalActionBtn}
              />
              <Button
                title="Lưu Thay Đổi"
                onPress={handleSaveDocs}
                loading={savingDocs}
                style={styles.modalActionBtn}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Contact & Support Modal */}
      <Modal
        visible={showContactModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Gửi Yêu Cầu Hỗ Trợ</Text>
            <Text style={styles.modalSub}>
              Để lại phản hồi hoặc thắc mắc của bạn, điều phối viên sẽ liên hệ lại ngay
            </Text>

            <TextInput
              style={styles.modalTextArea}
              placeholder="Nhập nội dung cần hỗ trợ hoặc góp ý dịch vụ..."
              placeholderTextColor={COLORS.placeholder}
              value={contactContent}
              onChangeText={setContactContent}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Đóng"
                variant="outline"
                onPress={() => setShowContactModal(false)}
                style={styles.modalActionBtn}
              />
              <Button
                title="Gửi Đi"
                onPress={handleSendContact}
                loading={sendingContact}
                style={styles.modalActionBtn}
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.card,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '800',
  },
  userInfoCol: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  memberTag: {
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginTop: 2,
    marginBottom: 4,
  },
  memberTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#854D0E',
  },
  userPhone: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
    ...SHADOWS.card,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  editBtn: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    maxWidth: '65%',
    textAlign: 'right',
  },
  infoValHighlight: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    gap: SPACING.sm,
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 16,
  },
  menuText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  menuSubText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  menuSubHighlight: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 1,
  },
  menuChevron: {
    fontSize: 18,
    color: COLORS.placeholder,
  },
  logoutBtn: {
    marginTop: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.elevated,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  modalTextArea: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 13,
    backgroundColor: '#F8FAFC',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  modalActionBtn: {
    flex: 1,
  },
});
