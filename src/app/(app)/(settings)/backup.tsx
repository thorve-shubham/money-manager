import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { formatDate } from '@/utils/date-utils';

// Placeholder — will be replaced by an actual backup service import.
// import { backupService } from '@/services/backup-service';

export default function BackupRestoreScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [lastBackupDate, setLastBackupDate] = useState<number | null>(null);

  async function handleExport() {
    setIsExporting(true);
    try {
      // TODO: Replace with real backup service call
      // const result = await backupService.exportData();
      await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate

      const now = Date.now();
      setLastBackupDate(now);
      Alert.alert(
        'Backup Successful',
        'Your data has been exported successfully. The file has been saved to your device.',
      );
    } catch {
      Alert.alert('Export Failed', 'Something went wrong while exporting your data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }

  async function handleImport() {
    Alert.alert(
      'Import Backup',
      'Importing a backup will replace your current data. This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: async () => {
            setIsImporting(true);
            try {
              // TODO: Replace with real backup service call
              // await backupService.importData();
              await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate
              Alert.alert('Import Successful', 'Your data has been restored from the backup file.');
            } catch {
              Alert.alert('Import Failed', 'Something went wrong while importing. Please check your backup file.');
            } finally {
              setIsImporting(false);
            }
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.headerRow, { borderBottomColor: theme.backgroundElement }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={[styles.backButton, { color: '#208AEF' }]}>‹ Back</Text>
        </TouchableOpacity>
        <ThemedText type="smallBold" style={styles.headerTitle}>
          Backup & Restore
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <ThemedView type="backgroundElement" style={styles.infoBanner}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <ThemedText type="small" themeColor="textSecondary" style={styles.infoText}>
            Backups include all your transactions, accounts, credit cards, loans, and categories.
            They are exported as a JSON file that you can save to your device or cloud storage.
          </ThemedText>
        </ThemedView>

        {/* Export Card */}
        <Card style={styles.actionCard}>
          <View style={styles.cardContent}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>☁️</Text>
            </View>
            <View style={styles.cardInfo}>
              <ThemedText type="smallBold" style={styles.cardTitle}>
                Export Backup
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Save a copy of all your financial data to a file.
              </ThemedText>
              {lastBackupDate && (
                <ThemedText type="small" themeColor="textSecondary" style={styles.lastBackup}>
                  Last backup: {formatDate(lastBackupDate, 'long')}
                </ThemedText>
              )}
            </View>
          </View>
          <Button
            label={isExporting ? 'Exporting...' : 'Export Now'}
            onPress={handleExport}
            variant="primary"
            size="md"
            fullWidth
            loading={isExporting}
            accessibilityLabel="Export backup"
          />
        </Card>

        {/* Import Card */}
        <Card style={styles.actionCard}>
          <View style={styles.cardContent}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📥</Text>
            </View>
            <View style={styles.cardInfo}>
              <ThemedText type="smallBold" style={styles.cardTitle}>
                Import Backup
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Restore your data from a previously exported backup file.
              </ThemedText>
            </View>
          </View>

          {/* Warning */}
          <ThemedView
            style={[styles.warningBox, { backgroundColor: '#F59E0B18', borderColor: '#F59E0B' }]}
          >
            <Text style={styles.warningIcon}>⚠️</Text>
            <ThemedText type="small" style={styles.warningText}>
              Importing will permanently replace all your current data. Make sure to export a backup
              first.
            </ThemedText>
          </ThemedView>

          <Button
            label={isImporting ? 'Importing...' : 'Import Backup'}
            onPress={handleImport}
            variant="secondary"
            size="md"
            fullWidth
            loading={isImporting}
            accessibilityLabel="Import backup"
          />
        </Card>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    fontSize: 17,
    fontWeight: '500',
    paddingVertical: 4,
    paddingRight: 8,
  },
  headerSpacer: {
    width: 60,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  infoIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    lineHeight: 19,
    fontSize: 13,
  },
  actionCard: {
    gap: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#208AEF18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconText: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  lastBackup: {
    fontSize: 12,
    marginTop: 2,
    color: '#22C55E',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  warningIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#F59E0B',
  },
  bottomPad: {
    height: 24,
  },
});
