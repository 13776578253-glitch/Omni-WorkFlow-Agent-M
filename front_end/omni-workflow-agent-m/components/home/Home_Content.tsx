import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';

import { HomeContentMessage } from '@/components/home/Home_Content_bin/Home_Content_Message';
import { useThemeContext } from '@/constants/Theme-Context';
import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width, height } = Dimensions.get('window');
const BUTTON_CENTER_OFFSET = 319;    // 录音按钮 高度
const WEEKDAY_LABEL = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const USERNAME_CHIP_BLUE = '#007bff';

const userName = "绝望的cpp";

interface HomeContentProps {
  translateY: SharedValue<number>;
}

export function HomeContent({ translateY }: HomeContentProps) {
  // Keep prop for upcoming gesture-linked animation work.
  void translateY;

  const { effectiveColorScheme } = useThemeContext();
  const isDark = effectiveColorScheme === 'dark';
  const appColors = Colors[effectiveColorScheme];

  const cardBg = useThemeColor({}, 'background');
  const titleColor = useThemeColor({}, 'text');

  const ringColor = isDark ? '#9EA3B0' : '#7C7C84';
  const ringPressedColor = isDark ? '#8B90A0' : '#6C6C74';
  const heroDotBg = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.55)';
  const subtitleColor = isDark ? '#A3A8B3' : '#7A7A82';
  const footerTextColor = isDark ? '#8F96A3' : '#8C8C94';
  const statusTextColor = isDark ? '#AEB4C0' : '#7A7A82';

  const now = new Date();
  const weekdayText = WEEKDAY_LABEL[now.getDay()];
  const weatherText = '晴 24°C';

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.shadowContainer,
          {
            backgroundColor: cardBg,
            shadowColor: isDark ? '#C8CCD6' : '#000',
            shadowOpacity: isDark ? 0.14 : 0.08,
            shadowRadius: isDark ? 12 : 8,
            elevation: isDark ? 10 : 7,
          },
        ]}>
        <View style={styles.innerContent}>
          <View style={styles.heroWrap}>
            {/* <View style={[styles.heroDot, { backgroundColor: heroDotBg }]} /> */}
            {/* <Text style={[styles.heroTitle, { color: titleColor }]}>用户，欢迎回来_</Text> */}
            <View style={styles.heroTitleRow}>
              <View style={styles.usernameChip}>
                <Text style={styles.usernameChipText}>{userName}</Text>
              </View>
              <Text style={[styles.heroTitleSuffix, { color: titleColor }]}>，欢迎回来_</Text>
            </View>
            <Text style={[styles.heroSubtitle, { color: subtitleColor }]}> ↓ 长按悬钮告诉 AI 需要做什么</Text>
            <HomeContentMessage />
          </View>

          <View style={[styles.ringAnchor, { transform: [{ translateY: BUTTON_CENTER_OFFSET }] }]}>
            <Pressable
              accessibilityRole="button"
              android_ripple={{ color: 'rgba(124,124,132,0.18)', radius: 30 }}
              onPress={() => {}}
              style={({ pressed }) => [
                styles.ringButtonOuter,
                { backgroundColor: pressed ? ringPressedColor : ringColor },
              ]}>
              <View style={[styles.ringButtonInner, { backgroundColor: cardBg }]} />
            </Pressable>

            <View style={styles.pullHint} pointerEvents="none">
              <View style={[styles.chevronStroke, styles.chevronLeft, { backgroundColor: subtitleColor }]} />
              <View style={[styles.chevronStroke, styles.chevronRight, { backgroundColor: subtitleColor }]} />
            </View>
          </View>
        </View>
      </Animated.View>

      <View style={styles.belowMaskArea} pointerEvents="none">
        <Text style={[styles.belowMaskText, { color: footerTextColor }]}>© 2026 React native / Expo</Text>
      </View>

      <View style={styles.topRightStatus} pointerEvents="none">
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : cardBg,
              shadowColor: isDark ? '#000' : '#7C7C84',
              shadowOpacity: isDark ? 0.18 : 0.1,
            },
          ]}>
          <Text style={[styles.statusMeta, { color: statusTextColor }]}>{weekdayText} · {weatherText}</Text>
        </View>
      </View>

      <View style={[styles.themeLine, { backgroundColor: appColors.border }]} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
    position: 'relative',
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  shadowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: height * 0.05,     // 遮罩高度
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    shadowOffset: { width: 0, height: 5 },
  },
  innerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    marginBottom: -2,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  heroWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: height * 0.0001,     // 欢迎标语 + 能力列表
  },
  heroDot: {
    width: 92,
    height: 92,
    borderRadius: 46,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 6,
  },
  usernameChip: {
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: USERNAME_CHIP_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  usernameChipText: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '800',
    transform: [{ translateY: -1.2 }],   // 文字偏移
  },
  heroTitleSuffix: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  ringAnchor: {
    position: 'absolute',
    left: '50%',
    marginLeft: -26,
    top: '50%',
    alignItems: 'center',
  },
  ringButtonOuter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  pullHint: {
    marginTop: 17,
    width: 20,
    height: 12,
    position: 'relative',
  },
  chevronStroke: {
    position: 'absolute',
    top: 5,
    width: 11,
    height: 3,
    borderRadius: 1,
  },
  chevronLeft: {
    left: 0,
    transform: [{ rotate: '34deg' }],
  },
  chevronRight: {
    right: 0,
    transform: [{ rotate: '-34deg' }],
  },
  belowMaskArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: height * 0.05,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  belowMaskText: {
    fontSize: 13,
    fontWeight: '500',
  },
  topRightStatus: {
    position: 'absolute',
    top: 120,
    right: 18,
    alignItems: 'flex-end',
    maxWidth: '62%',
  },
  statusCard: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  statusMeta: {
    marginTop: 0,
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '500',
  },
  themeLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 98,
    height: StyleSheet.hairlineWidth,
    opacity: 0.4,
  },
});
