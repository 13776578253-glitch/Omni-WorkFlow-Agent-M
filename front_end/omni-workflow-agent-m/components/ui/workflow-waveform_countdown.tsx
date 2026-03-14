// 测试逻辑 / 废弃
// 保留 / 静态样式 / 验证组件样式
// import React from 'react';
// import { Animated, StyleSheet, Text, View } from 'react-native';

// interface WorkflowWaveformCountdownColors {
//   waveColor: string;
//   axisColor: string;
//   cursorColor: string;
// }

// interface WorkflowWaveformCountdownProps {
//   waveHeights: number[];
//   waveOpacity: Animated.AnimatedInterpolation<number>;
//   axisOpacity: Animated.AnimatedInterpolation<number>;
//   colors: WorkflowWaveformCountdownColors;
// }

// export function formatHms(totalSeconds: number): string {
//   const safeSeconds = Math.max(0, Math.floor(totalSeconds));
//   const mm = Math.floor((safeSeconds % 3600) / 60)
//     .toString()
//     .padStart(2, '0');
//   const ss = (safeSeconds % 60).toString().padStart(2, '0');
//   return `${mm}:${ss}`;
// }

// export function formatTimeRange(currentSeconds: number, totalSeconds: number): string {
//   return `${formatHms(currentSeconds)}/${formatHms(totalSeconds)}`;
// }

// export function WorkflowWaveformCountdown({
//   waveHeights,
//   waveOpacity,
//   axisOpacity,
//   colors,
// }: WorkflowWaveformCountdownProps) {
//   return (
//     <>
//       <Animated.View style={[styles.waveCanvas, { opacity: waveOpacity }]}>
//         <View style={styles.waveRow}>
//           {waveHeights.map((h, index) => (
//             <View
//               key={`top-wave-${index}`}
//               style={[
//                 styles.waveBar,
//                 {
//                   backgroundColor: colors.waveColor,
//                   height: h,
//                   opacity: index > 43 ? 0.28 + ((70 - index) / 70) * 0.5 : 0.9,
//                 },
//               ]}
//             />
//           ))}
//         </View>

//         <View style={[styles.cursor, { backgroundColor: colors.cursorColor }]}>
//           <View style={[styles.cursorDot, { backgroundColor: colors.cursorColor, top: -6 }]} />
//           <View style={[styles.cursorDot, { backgroundColor: colors.cursorColor, bottom: -6 }]} />
//         </View>
//       </Animated.View>

//       <Animated.View style={[styles.axisRow, { opacity: axisOpacity }]}>
//         {['00:00', '00:01', '00:02', '00:03', '00:04', '00:05'].map((label) => (
//           <Text key={label} style={[styles.axisText, { color: colors.axisColor }]}>
//             {label}
//           </Text>
//         ))}
//       </Animated.View>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   waveCanvas: {
//     height: 122,
//     justifyContent: 'center',
//     marginBottom: 8,
//   },
//   waveRow: {
//     height: 96,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 2,
//   },
//   waveBar: {
//     width: 3,
//     borderRadius: 2,
//   },
//   cursor: {
//     position: 'absolute',
//     width: 2,
//     height: 96,
//     left: '50%',
//     top: 13,
//     marginLeft: -1,
//   },
//   cursorDot: {
//     position: 'absolute',
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     left: -5,
//   },
//   axisRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 2,
//   },
//   axisText: {
//     fontSize: 11,
//     fontWeight: '500',
//   },
// });
