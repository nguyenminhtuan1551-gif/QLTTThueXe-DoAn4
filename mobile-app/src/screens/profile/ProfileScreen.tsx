import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { contactApi } from '../../api/contactApi';
import { Button, Header, Input } from '../../components';
import { COLORS } from '../../constants/colors';
import { CONFIG } from '../../constants/config';
import { RADIUS, SPACING } from '../../constants/theme';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactContent, setContactContent] = useState('');
  const [sendingContact, setSendingContact] = useState(false);

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?', [
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
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung cần hỗ trợ.');
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
      Alert.alert('Thành công', 'Ý kiến của bạn đã được gửi. Chúng tôi sẽ phản hồi sớm nhất!');
      setContactContent('');
      setShowContactModal(false);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể gửi phản hồi.');
    } finally {
      setSendingContact(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Tài Khoản & Cá Nhân" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.fullName || 'Khách hàng'}</Text>
            <Text style={styles.userRole}>Khách hàng thành viên</Text>
            <Text style={styles.userPhone}>{user?.phone}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Identification & Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Thông Tin Định Danh</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã khách hàng:</Text>
            <Text style={styles.infoVal}>{user?.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số CCCD / CMND:</Text>
            <Text style={styles.infoVal}>{user?.cccd || 'Chưa cập nhật'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số GPLX:</Text>
            <Text style={styles.infoVal}>{user?.driverLicense || 'Chưa cập nhật'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Địa chỉ thường trú:</Text>
            <Text style={styles.infoVal}>{user?.address || 'Hà Nội'}</Text>
          </View>
        </View>

        {/* Support & Contacts */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Hỗ Trợ & Liên Hệ</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowContactModal(true)}
          >
            <Text style={styles.menuIcon}>💬</Text>
            <Text style={styles.menuText}>Gửi yêu cầu hỗ trợ / Góp ý</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <Text style={styles.menuIcon}>📞</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Hotline 24/7</Text>
              <Text style={styles.menuSubText}>{CONFIG.SUPPORT_PHONE}</Text>
            </View>
          </View>

          <View style={styles.menuItem}>
            <Text style={styles.menuIcon}>✉️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Email hỗ trợ</Text>
              <Text style={styles.menuSubText}>{CONFIG.SUPPORT_EMAIL}</Text>
            </View>
          </View>
        </View>

        {/* App Version & Logout */}
        <View style={styles.sectionCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phiên bản ứng dụng:</Text>
            <Text style={styles.infoVal}>v{CONFIG.VERSION}</Text>
          </View>

          <Button
            title="Đăng Xuất Tài Khoản"
            onPress={handleLogout}
            variant="danger"
            style={styles.logoutBtn}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Support Contact Modal */}
      <Modal
        visible={showContactModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Gửi Liên Hệ / Hỗ Trợ</Text>
            <Text style={styles.modalSub}>
              Vui lòng để lại nội dung thắc mắc hoặc phản hồi về chất lượng dịch vụ.
            </Text>

            <TextInput
              style={styles.modalTextArea}
              placeholder="Nhập nội dung cần giải đáp..."
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
                style={styles.modalBtn}
              />
              <Button
                title="Gửi Đi"
                onPress={handleSendContact}
                loading={sendingContact}
                style={styles.modalBtn}
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
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  userRole: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  userPhone: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
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
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  menuIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  menuSubText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  menuChevron: {
    fontSize: 20,
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
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  modalTextArea: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    marginBottom: SPACING.md,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  modalBtn: {
    flex: 1,
  },
});
