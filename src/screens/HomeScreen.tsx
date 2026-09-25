import React, {useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {DietMode, FridgePhoto, RootStackParamList} from '../types';
import {cookFromFridge, getGeminiApiKey} from '../api/gemini';
import {pickFridgePhoto} from '../api/pickFridge';
import {SAMPLE_INGREDIENTS} from '../constants/sample';
import {Colors, Radius, Spacing} from '../theme';

const MODES: Array<{id: DietMode; label: string; hint: string}> = [
  {id: 'any', label: 'Anything', hint: 'use what you have'},
  {id: 'veg', label: 'Veg', hint: 'no meat'},
  {id: 'quick', label: '15 min', hint: 'weeknight fast'},
];

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>();

  const [photo, setPhoto] = useState<FridgePhoto | null>(null);
  const [useSample, setUseSample] = useState(false);
  const [mode, setMode] = useState<DietMode>('any');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onPick = async (source: 'camera' | 'library') => {
    setError('');
    try {
      const picked = await pickFridgePhoto(source);
      if (!picked) {
        return;
      }
      setUseSample(false);
      setPhoto(picked);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open a photo.');
    }
  };

  const onSample = () => {
    setError('');
    setPhoto(null);
    setUseSample(true);
  };

  const onCook = async () => {
    if (!photo && !useSample) {
      setError('Snap your fridge or try the sample.');
      return;
    }
    if (!getGeminiApiKey()) {
      setError(
        'Add GEMINI_API_KEY to .env, then restart Metro.',
      );
      return;
    }

    setError('');
    setLoading(true);
    try {
      const result = await cookFromFridge({
        mode,
        imageBase64: photo?.base64,
        mimeType: photo?.mimeType,
        ingredientText: useSample ? SAMPLE_INGREDIENTS : undefined,
      });
      navigation.navigate('Result', {result});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not cook this fridge.');
    } finally {
      setLoading(false);
    }
  };

  const sampleImage = require('../assets/sample-fridge.png');

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.content,
        {paddingTop: insets.top + 20, paddingBottom: insets.bottom + 28},
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.brand}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.kicker}>FridgeCook</Text>
      </View>
      <Text style={styles.title}>What’s in your fridge?</Text>
      <Text style={styles.sub}>
        One photo. Three easy recipes. No extra grocery run.
      </Text>

      <Pressable
        onPress={() => onPick('library')}
        disabled={loading}
        style={({pressed}) => [styles.hero, pressed && styles.pressed]}>
        {photo || useSample ? (
          <Image
            source={photo ? {uri: photo.uri} : sampleImage}
            style={styles.heroImage}
          />
        ) : (
          <View style={styles.heroEmpty}>
            <Text style={styles.heroEmoji}>🥬</Text>
            <Text style={styles.heroTitle}>Drop a fridge pic</Text>
            <Text style={styles.heroHint}>Gallery · under 4 MB</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.row}>
        <Pressable
          onPress={() => onPick('camera')}
          disabled={loading}
          style={({pressed}) => [styles.ghost, pressed && styles.pressed]}>
          <Text style={styles.ghostText}>📷 Camera</Text>
        </Pressable>
        <Pressable
          onPress={onSample}
          disabled={loading}
          style={({pressed}) => [
            styles.ghost,
            useSample && styles.ghostOn,
            pressed && styles.pressed,
          ]}>
          <Text style={[styles.ghostText, useSample && styles.ghostOnText]}>
            ✨ Try a sample
          </Text>
        </Pressable>
      </View>

      <Text style={styles.modeLabel}>Tonight’s vibe</Text>
      <View style={styles.pills}>
        {MODES.map(item => {
          const on = mode === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setMode(item.id)}
              disabled={loading}
              style={[styles.pill, on && styles.pillOn]}>
              <Text style={[styles.pillText, on && styles.pillTextOn]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={onCook}
        disabled={loading}
        style={({pressed}) => [
          styles.cta,
          pressed && styles.pressed,
          loading && styles.ctaOff,
        ]}>
        {loading ? (
          <ActivityIndicator color={Colors.textOnPrimary} />
        ) : (
          <Text style={styles.ctaText}>Cook these 3</Text>
        )}
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: Colors.background},
  content: {paddingHorizontal: Spacing.xl},
  brand: {flexDirection: 'row', alignItems: 'center', gap: 10},
  logo: {width: 36, height: 36, borderRadius: 10},
  kicker: {fontWeight: '800', color: Colors.primary, letterSpacing: 0.4},
  title: {
    marginTop: Spacing.lg,
    fontSize: 32,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.8,
  },
  sub: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.muted,
  },
  hero: {
    marginTop: Spacing.xxl,
    height: 240,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.dashed,
    borderStyle: 'dashed',
  },
  heroImage: {width: '100%', height: '100%'},
  heroEmpty: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  heroEmoji: {fontSize: 40, marginBottom: 8},
  heroTitle: {fontSize: 18, fontWeight: '700', color: Colors.ink},
  heroHint: {marginTop: 4, color: Colors.faint},
  row: {flexDirection: 'row', gap: 10, marginTop: Spacing.base},
  ghost: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
  },
  ghostOn: {backgroundColor: Colors.primarySoft, borderColor: Colors.primary},
  ghostText: {fontWeight: '700', color: Colors.ink},
  ghostOnText: {color: Colors.primaryDark},
  modeLabel: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    fontWeight: '700',
    color: Colors.muted,
  },
  pills: {flexDirection: 'row', gap: 8},
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  pillOn: {backgroundColor: Colors.ink, borderColor: Colors.ink},
  pillText: {fontWeight: '700', color: Colors.ink},
  pillTextOn: {color: Colors.textOnPrimary},
  errorBox: {
    marginTop: Spacing.base,
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.md,
    padding: Spacing.base,
  },
  errorText: {color: Colors.primaryDark, fontWeight: '600'},
  cta: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaOff: {opacity: 0.7},
  ctaText: {color: Colors.textOnPrimary, fontSize: 17, fontWeight: '800'},
  pressed: {opacity: 0.85},
});

export default HomeScreen;
