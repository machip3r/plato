import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette } from '../../../ui/theme';

export function TableButton({ title, onPress, variant, disabled = false, compact = false, standalone = false }: { title: string; onPress: () => void; variant: 'primary' | 'quiet' | 'danger'; disabled?: boolean; compact?: boolean; standalone?: boolean }) {
  const buttonStyle = variant === 'primary' ? styles.buttonPrimary : variant === 'danger' ? styles.buttonDanger : styles.buttonQuiet;
  const labelStyle = variant === 'quiet' ? styles.buttonQuietText : styles.buttonPrimaryText;
  return (
    <View style={[styles.buttonShell, (compact || standalone) && styles.buttonShellCompact, standalone && { width: '100%', maxWidth: 320, minHeight: 48, flexShrink: 0 }]}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [styles.button, buttonStyle, disabled && styles.buttonDisabled, compact && styles.buttonCompact, pressed && !disabled && styles.buttonPressed]}
      >
        <Text numberOfLines={1} style={[labelStyle, disabled && styles.buttonDisabledText, compact && styles.buttonCompactText]}>{title}</Text>
        {variant === 'primary' && !disabled && <View style={styles.buttonArrow}><Text style={styles.buttonArrowText}>↗</Text></View>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonShell: { flex: 1 },
  buttonShellCompact: { flex: 0 },
  button: { minHeight: 48, borderRadius: 6, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  buttonPressed: { opacity: 0.84, transform: [{ scale: 0.985 }] },
  buttonPrimary: { backgroundColor: palette.red },
  buttonDanger: { backgroundColor: '#73342D' },
  buttonQuiet: { borderWidth: 1, borderColor: '#343B34', backgroundColor: 'rgba(241,234,218,0.03)' },
  buttonDisabled: { backgroundColor: '#354139', borderColor: '#4C5A4F', opacity: 0.63 },
  buttonPrimaryText: { flex: 1, textAlign: 'center', color: '#FFF8E9', fontSize: 13, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 0.25 },
  buttonQuietText: { flex: 1, textAlign: 'center', color: '#20251F', fontSize: 13, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 0.25 },
  buttonDisabledText: { color: '#A7B0A7' },
  buttonArrow: { position: 'absolute', right: 13, top: 13 },
  buttonArrowText: { color: '#FFF2DA', fontSize: 14, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  buttonCompact: { minHeight: 38, paddingHorizontal: 14, minWidth: 90 },
  buttonCompactText: { fontFamily: 'PlusJakartaSans_400Regular', flex: 0, fontSize: 11 },
});
