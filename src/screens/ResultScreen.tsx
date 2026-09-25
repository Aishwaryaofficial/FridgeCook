import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types';
import {Colors, Radius, Spacing} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

const ResultScreen = ({navigation, route}: Props) => {
  const insets = useSafeAreaInsets();
  const {result} = route.params;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.content,
        {paddingTop: insets.top + 16, paddingBottom: insets.bottom + 28},
      ]}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>
      <Text style={styles.title}>Tonight’s three</Text>
      {result.seen.length ? (
        <Text style={styles.seen}>Spotted: {result.seen.join(' · ')}</Text>
      ) : (
        <Text style={styles.seen}>Cooked from what you shared.</Text>
      )}

      {result.recipes.map((recipe, index) => (
        <View key={`${recipe.title}-${index}`} style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.emoji}>{recipe.emoji}</Text>
            <View style={styles.cardHead}>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              <Text style={styles.meta}>
                {recipe.minutes} min · {recipe.difficulty}
              </Text>
            </View>
          </View>
          {recipe.why ? <Text style={styles.why}>{recipe.why}</Text> : null}

          <Text style={styles.section}>Use</Text>
          {recipe.ingredients.map(item => (
            <Text key={item} style={styles.line}>
              • {item}
            </Text>
          ))}

          <Text style={[styles.section, styles.stepHead]}>Do</Text>
          {recipe.steps.map((step, stepIndex) => (
            <Text key={`${stepIndex}-${step}`} style={styles.line}>
              {stepIndex + 1}. {step}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: Colors.background},
  content: {paddingHorizontal: Spacing.xl},
  back: {color: Colors.primary, fontWeight: '800', fontSize: 16},
  title: {
    marginTop: Spacing.md,
    fontSize: 30,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.6,
  },
  seen: {marginTop: 8, color: Colors.muted, fontSize: 15, lineHeight: 21},
  card: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  cardTop: {flexDirection: 'row', gap: 12, alignItems: 'center'},
  emoji: {fontSize: 34},
  cardHead: {flex: 1},
  recipeTitle: {fontSize: 20, fontWeight: '800', color: Colors.ink},
  meta: {marginTop: 2, color: Colors.sage, fontWeight: '700'},
  why: {marginTop: Spacing.md, color: Colors.muted, lineHeight: 21},
  section: {
    marginTop: Spacing.base,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 6,
  },
  stepHead: {marginTop: Spacing.md},
  line: {color: Colors.muted, lineHeight: 22, fontSize: 15},
});

export default ResultScreen;
