/**
 * Owner Profile Modal
 *
 * Kişisel bilgiler (readonly) + işletme bilgileri (editable) + banka hesabı.
 * Frontend OwnerProfilePage.jsx ile birebir aynı yapı.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/hooks/useAuth';
import { businessService } from '../../src/services/businessService';

const BUSINESS_TYPES = ['Cafe', 'Restaurant', 'Hotel', 'Shop', 'Gas Station', 'Other'];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <View style={styles.sectionLabelRow}>
      <View style={styles.sectionLabelLine} />
      <Text style={styles.sectionLabelText}>{text}</Text>
      <View style={styles.sectionLabelLine} />
    </View>
  );
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconBox}>
        <MaterialCommunityIcons name={icon as any} size={18} color="#0891b2" />
      </View>
      <Text style={styles.sectionHeaderTitle}>{title}</Text>
    </View>
  );
}

function ReadField({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.readInput}>
        <Text style={styles.readInputText}>{value || '—'}</Text>
      </View>
    </View>
  );
}

function EditField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: any;
  autoCapitalize?: any;
}) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.editInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType || 'default'}
        autoCapitalize={autoCapitalize || 'sentences'}
      />
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function OwnerProfileModal() {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackVisible, setSnackVisible] = useState(false);
  const [typePickerVisible, setTypePickerVisible] = useState(false);

  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Germany',
    openingHours: '',
    phone: '',
    ustIdNr: '',
    accountHolder: '',
    iban: '',
    bic: '',
    bankName: '',
  });

  useEffect(() => {
    loadBusiness();
  }, []);

  const loadBusiness = async () => {
    setLoading(true);
    setError(null);
    try {
      const b = await businessService.getMyBusiness();
      if (b) {
        const addr = typeof b.address === 'object' ? b.address : {};
        setForm({
          businessName: (b as any).businessName || '',
          businessType: (b as any).businessType || '',
          street: (addr as any).street || '',
          city: (addr as any).city || '',
          postalCode: (addr as any).postalCode || '',
          country: (addr as any).country || 'Germany',
          openingHours: (b as any).openingHours || '',
          phone: b.phone || '',
          ustIdNr: (b as any).ustIdNr || '',
          accountHolder: (b as any).bankAccount?.accountHolder || '',
          iban: (b as any).bankAccount?.iban || '',
          bic: (b as any).bankAccount?.bic || '',
          bankName: (b as any).bankAccount?.bankName || '',
        });
      }
    } catch {
      setError('Geschäftsdaten konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await businessService.updateMyBusiness({
        businessName: form.businessName,
        businessType: form.businessType,
        address: {
          street: form.street,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
        },
        openingHours: form.openingHours,
        phone: form.phone,
        ustIdNr: form.ustIdNr,
        bankAccount: {
          accountHolder: form.accountHolder,
          iban: form.iban,
          bic: form.bic,
          bankName: form.bankName,
        },
      });
      setSnackVisible(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Änderungen konnten nicht gespeichert werden.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#0891b2', '#0e7490']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Mein Profil</Text>
            <Text style={styles.headerSubtitle}>Persönliche und Geschäftsinformationen</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={22} color="#fff" />
            <Text style={styles.backButtonText}>Zurück</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#dc2626" style={{ marginRight: 6 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0891b2" />
          </View>
        ) : (
          <>
            {/* ── Kişisel Bilgiler (Readonly) ── */}
            <View style={styles.card}>
              <SectionHeader icon="account-outline" title="Persönliche Informationen" />
              <View style={styles.fieldRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <ReadField label="Benutzername" value={currentUser?.username} />
                </View>
                <View style={{ flex: 1 }}>
                  <ReadField label="E-Mail" value={currentUser?.email} />
                </View>
              </View>
              <View style={styles.fieldRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <ReadField label="Vorname" value={currentUser?.firstName} />
                </View>
                <View style={{ flex: 1 }}>
                  <ReadField label="Nachname" value={currentUser?.lastName} />
                </View>
              </View>
              <Text style={styles.readonlyNote}>
                Persönliche Daten können im Einstellungsbereich geändert werden.
              </Text>
            </View>

            {/* ── Geschäftsinformationen (Editable) ── */}
            <View style={styles.card}>
              <SectionHeader icon="store-outline" title="Geschäftsinformationen" />

              <View style={styles.fieldRow}>
                <View style={{ flex: 7, marginRight: 8 }}>
                  <EditField
                    label="Unternehmensname"
                    value={form.businessName}
                    onChangeText={set('businessName')}
                    placeholder="Mein Unternehmen"
                  />
                </View>
                <View style={{ flex: 5 }}>
                  {/* Business Type Dropdown */}
                  <View style={styles.fieldWrapper}>
                    <Text style={styles.fieldLabel}>Unternehmenstyp</Text>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setTypePickerVisible(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.dropdownButtonText, !form.businessType && { color: '#94a3b8' }]}>
                        {form.businessType || 'Auswählen'}
                      </Text>
                      <MaterialCommunityIcons name="chevron-down" size={18} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Adresse */}
              <SectionLabel text="ADRESSE" />
              <EditField
                label="Straße & Hausnummer"
                value={form.street}
                onChangeText={set('street')}
                placeholder="Musterstraße 1"
              />
              <View style={styles.fieldRow}>
                <View style={{ flex: 4, marginRight: 8 }}>
                  <EditField
                    label="PLZ"
                    value={form.postalCode}
                    onChangeText={set('postalCode')}
                    placeholder="10115"
                    keyboardType="numeric"
                    autoCapitalize="none"
                  />
                </View>
                <View style={{ flex: 5, marginRight: 8 }}>
                  <EditField
                    label="Stadt"
                    value={form.city}
                    onChangeText={set('city')}
                    placeholder="Berlin"
                  />
                </View>
                <View style={{ flex: 3 }}>
                  <EditField
                    label="Land"
                    value={form.country}
                    onChangeText={set('country')}
                    placeholder="Germany"
                  />
                </View>
              </View>

              {/* Weitere Angaben */}
              <SectionLabel text="WEITERE ANGABEN" />
              <View style={styles.fieldRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <EditField
                    label="Telefon"
                    value={form.phone}
                    onChangeText={set('phone')}
                    placeholder="+49 123 456789"
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <EditField
                    label="USt-IdNr."
                    value={form.ustIdNr}
                    onChangeText={set('ustIdNr')}
                    placeholder="DE123456789"
                    autoCapitalize="characters"
                  />
                </View>
              </View>
              <EditField
                label="Öffnungszeiten"
                value={form.openingHours}
                onChangeText={set('openingHours')}
                placeholder="Mo–Fr 08:00–20:00; Sa 09:00–18:00"
              />

              {/* Bankverbindung */}
              <SectionLabel text="BANKVERBINDUNG" />
              <View style={styles.fieldRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <EditField
                    label="Kontoinhaber"
                    value={form.accountHolder}
                    onChangeText={set('accountHolder')}
                    placeholder="Max Mustermann"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <EditField
                    label="Bankname"
                    value={form.bankName}
                    onChangeText={set('bankName')}
                    placeholder="Deutsche Bank"
                  />
                </View>
              </View>
              <View style={styles.fieldRow}>
                <View style={{ flex: 2, marginRight: 8 }}>
                  <EditField
                    label="IBAN"
                    value={form.iban}
                    onChangeText={set('iban')}
                    placeholder="DE89 3704 0044 0532 0130 00"
                    autoCapitalize="characters"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <EditField
                    label="BIC"
                    value={form.bic}
                    onChangeText={set('bic')}
                    placeholder="COBADEFFXXX"
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
                style={styles.saveButtonWrapper}
              >
                <LinearGradient
                  colors={['#0891b2', '#0e7490']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButton}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                  ) : (
                    <MaterialCommunityIcons name="content-save-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                  )}
                  <Text style={styles.saveButtonText}>
                    {saving ? 'Wird gespeichert...' : 'Änderungen speichern'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Business Type Picker Modal */}
      <Modal
        visible={typePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTypePickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTypePickerVisible(false)}
        >
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Unternehmenstyp</Text>
            <FlatList
              data={BUSINESS_TYPES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    form.businessType === item && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    set('businessType')(item);
                    setTypePickerVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      form.businessType === item && styles.pickerItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {form.businessType === item && (
                    <MaterialCommunityIcons name="check" size={18} color="#0891b2" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Success Snackbar */}
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        Änderungen erfolgreich gespeichert.
      </Snackbar>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0891b2',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 2,
  },
  scroll: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingBox: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#dc2626',
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
  },
  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#0891b2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  // Section header inside card
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: 'rgba(8,145,178,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  // Section label (ADRESSE, BANKVERBINDUNG)
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  sectionLabelLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  sectionLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    marginHorizontal: 8,
    letterSpacing: 0.5,
  },
  // Field layout
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  fieldWrapper: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 5,
  },
  // Readonly input
  readInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  readInputText: {
    fontSize: 14,
    color: '#64748b',
  },
  // Editable input
  editInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  readonlyNote: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  // Dropdown
  dropdownButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#0f172a',
    flex: 1,
  },
  // Save button
  saveButtonWrapper: {
    marginTop: 8,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#0891b2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  // Type picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 16,
    maxHeight: '60%',
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 12,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  pickerItemSelected: {
    backgroundColor: '#f0f9ff',
  },
  pickerItemText: {
    fontSize: 15,
    color: '#0f172a',
  },
  pickerItemTextSelected: {
    color: '#0891b2',
    fontWeight: '700',
  },
  // Snackbar
  snackbar: {
    backgroundColor: '#0891b2',
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 16,
  },
});
