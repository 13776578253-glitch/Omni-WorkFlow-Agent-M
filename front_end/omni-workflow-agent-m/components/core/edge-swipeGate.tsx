// 弃用逻辑

// import React, { useMemo } from 'react';
// import { PanResponder, StyleSheet, type ViewStyle, View } from 'react-native';

// interface EdgeSwipeGateProps {
//   children: React.ReactNode;
//   onSwipeLeft?: () => void;
//   onSwipeRight?: () => void;
//   edgeWidth?: number;
//   swipeThreshold?: number;
//   enabled?: boolean;
//   style?: ViewStyle;
// }

// export function EdgeSwipeGate({
//   children,
//   onSwipeLeft,
//   onSwipeRight,
//   edgeWidth = 32,
//   swipeThreshold = 72,
//   enabled = true,
//   style,
// }: EdgeSwipeGateProps) {
//   const leftEdgeResponder = useMemo(
//     () =>
//       PanResponder.create({
//         onStartShouldSetPanResponder: () => false,
//         onStartShouldSetPanResponderCapture: () => false,
//         onMoveShouldSetPanResponder: (_evt, gestureState) => {
//           if (!enabled) return false;
//           const absDx = Math.abs(gestureState.dx);
//           const absDy = Math.abs(gestureState.dy);
//           return absDx > 8 && absDx > absDy;
//         },
//         onMoveShouldSetPanResponderCapture: (_evt, gestureState) => {
//           if (!enabled) return false;
//           const absDx = Math.abs(gestureState.dx);
//           const absDy = Math.abs(gestureState.dy);
//           return absDx > 8 && absDx > absDy;
//         },
//         onPanResponderRelease: (_evt, gestureState) => {
//           if (!enabled) return;
//           if (gestureState.dx <= -swipeThreshold) {
//             onSwipeLeft?.();
//           }
//         },
//       }),
//     [enabled, onSwipeLeft, swipeThreshold]
//   );

//   const rightEdgeResponder = useMemo(
//     () =>
//       PanResponder.create({
//         onStartShouldSetPanResponder: () => false,
//         onStartShouldSetPanResponderCapture: () => false,
//         onMoveShouldSetPanResponder: (_evt, gestureState) => {
//           if (!enabled) return false;
//           const absDx = Math.abs(gestureState.dx);
//           const absDy = Math.abs(gestureState.dy);
//           return absDx > 8 && absDx > absDy;
//         },
//         onMoveShouldSetPanResponderCapture: (_evt, gestureState) => {
//           if (!enabled) return false;
//           const absDx = Math.abs(gestureState.dx);
//           const absDy = Math.abs(gestureState.dy);
//           return absDx > 8 && absDx > absDy;
//         },
//         onPanResponderRelease: (_evt, gestureState) => {
//           if (!enabled) return;
//           if (gestureState.dx >= swipeThreshold) {
//             onSwipeRight?.();
//           }
//         },
//       }),
//     [enabled, onSwipeRight, swipeThreshold]
//   );

//   return (
//     <View style={[styles.root, style]}>
//       {children}

//       <View
//         pointerEvents={enabled ? 'auto' : 'none'}
//         style={[styles.edgeZone, styles.leftEdge, { width: edgeWidth }]}
//         {...leftEdgeResponder.panHandlers}
//       />

//       <View
//         pointerEvents={enabled ? 'auto' : 'none'}
//         style={[styles.edgeZone, styles.rightEdge, { width: edgeWidth }]}
//         {...rightEdgeResponder.panHandlers}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   root: {
//     flex: 1,
//   },
//   edgeZone: {
//     position: 'absolute',
//     top: 0,
//     bottom: 0,
//     zIndex: 30,
//   },
//   leftEdge: {
//     left: 0,
//   },
//   rightEdge: {
//     right: 0,
//   },
// });
