// 应用的全局颜色和字体配置
// [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app)
import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F2F2F7',
    card: '#FFFFFF',         // 内容卡片
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    tabBorder: '#e5e5e5',    // 边框
    border: '#D1D1D6',       //  分割线
  },
  dark: {
    text: '#ECEDEE',
    background: '#000000',
    card: '#1C1C1E',         // 内容卡片
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    tabBorder: '#252525',    // 边框
    border: '#38383A',       // 暗色分割线
  },
};

// 全局字体配置
export const Fonts = Platform.select({
  // ios: {
  //   /** iOS `UIFontDescriptorSystemDesignDefault` */
  //   sans: 'system-ui',
  //   /** iOS `UIFontDescriptorSystemDesignSerif` */
  //   serif: 'ui-serif',
  //   /** iOS `UIFontDescriptorSystemDesignRounded` */
  //   rounded: 'ui-rounded',
  //   /** iOS `UIFontDescriptorSystemDesignMonospaced` */
  //   mono: 'ui-monospace',
  // },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
