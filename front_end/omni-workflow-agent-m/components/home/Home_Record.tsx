import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';

import * as Haptics from 'expo-haptics';

import type { WorkflowRecordingSession } from '@/constants/workflow_type';
import { createWorkflowUploadService } from '@/services/workflow/Workflow_Upload';

interface HomeRecordProps {
  cardBg: string;
  ringColor: string;
  ringPressedColor: string;
  subtitleColor: string;
  onRecordingStateChange?: (isActive: boolean) => void;
  onTranscriptReady?: (transcriptText: string) => void;
}

const RECORD_DOT_COUNT = 30;

export function HomeRecord({
  cardBg,
  ringColor,
  ringPressedColor,
  subtitleColor,
  onRecordingStateChange,
  onTranscriptReady,
}: HomeRecordProps) {
  const [isPressHolding, setIsPressHolding] = useState(false);
  const [isPressRecording, setIsPressRecording] = useState(false);
  const [isSlideCancelPreview, setIsSlideCancelPreview] = useState(false);
  const [waveTick, setWaveTick] = useState(0);

  const uploadServiceRef = useRef(createWorkflowUploadService());
  const recordingSessionRef = useRef<WorkflowRecordingSession | null>(null);
  const startRecordingPendingRef = useRef(false);
  const pendingReleaseActionRef = useRef<'send' | 'cancel' | null>(null);
  const pressStartXRef = useRef<number | null>(null);
  const pressStartYRef = useRef<number | null>(null);
  const lastTouchXRef = useRef<number | null>(null);
  const lastTouchYRef = useRef<number | null>(null);
  const slideCancelRef = useRef(false);
  const longPressStartedRef = useRef(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onRecordingStateChange?.(isPressRecording);
  }, [isPressRecording, onRecordingStateChange]);

  useEffect(() => {
    if (!isPressRecording) return;
    const timer = setInterval(() => setWaveTick((prev) => prev + 1), 65);
    return () => clearInterval(timer);
  }, [isPressRecording]);

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const recordingDots = useMemo(
    () =>
      Array.from({ length: RECORD_DOT_COUNT }).map((_, index) => {
        const centerIndex = (RECORD_DOT_COUNT - 1) / 2;
        const distanceRatio = Math.abs(index - centerIndex) / centerIndex;
        const envelope = Math.max(0.2, 1 - Math.pow(distanceRatio, 1.35));
        const oscillation = 0.5 + 0.5 * Math.sin(waveTick * 0.42 + index * 0.58);
        return {
          key: `home-record-dot-${index}`,
          height: 5 + envelope * (4 + oscillation * 14),
          opacity: 0.45 + envelope * (0.2 + oscillation * 0.35),
        };
      }),
    [waveTick]
  );

  const readTouchPoint = (event: GestureResponderEvent) => {
    const nativeEvent = event.nativeEvent as GestureResponderEvent['nativeEvent'] & {
      touches?: Array<{ pageX?: number; pageY?: number }>;
      changedTouches?: Array<{ pageX?: number; pageY?: number }>;
    };
    const touch = nativeEvent.touches?.[0] ?? nativeEvent.changedTouches?.[0];
    const pageX = nativeEvent.pageX ?? touch?.pageX;
    const pageY = nativeEvent.pageY ?? touch?.pageY;
    return {
      x: Number.isFinite(pageX) ? pageX : null,
      y: Number.isFinite(pageY) ? pageY : null,
    };
  };

  const updateSlideCancelState = (currentX: number | null, currentY: number | null) => {
    if (
      !longPressStartedRef.current ||
      pressStartXRef.current == null ||
      pressStartYRef.current == null ||
      currentX == null ||
      currentY == null
    ) {
      return;
    }

    const deltaY = pressStartYRef.current - currentY;
    const deltaX = Math.abs(currentX - pressStartXRef.current);
    const cancelEnterThreshold = 56;
    const cancelExitThreshold = 40;
    const movingUp = deltaY > 0;
    const verticalDominant = deltaY > deltaX * 1.1;

    const nextIsCancel = slideCancelRef.current
      ? movingUp && deltaY > cancelExitThreshold
      : movingUp && verticalDominant && deltaY > cancelEnterThreshold;

    if (slideCancelRef.current !== nextIsCancel) {
      slideCancelRef.current = nextIsCancel;
      setIsSlideCancelPreview(nextIsCancel);
    }
  };

  const finalizePressRecord = async (action: 'send' | 'cancel') => {
    setIsSlideCancelPreview(false);
    setIsPressRecording(false);
    const current = recordingSessionRef.current;
    if (!current || current.phase !== 'recording') return;

    const stopped = await uploadServiceRef.current.stopPressRecording(current);
    recordingSessionRef.current = stopped;
    if (stopped.phase === 'error' || action === 'cancel') {
      recordingSessionRef.current = null;
      return;
    }

    const pipelineResult = await uploadServiceRef.current.runPressToTalkPipeline(stopped);
    const transcriptText = pipelineResult.transcriptText.trim() || 'Mock transcript content.';
    recordingSessionRef.current = null;
    onTranscriptReady?.(transcriptText);
  };

  const startPressRecord = async () => {
    setIsSlideCancelPreview(false);
    setIsPressRecording(true);
    pendingReleaseActionRef.current = null;
    startRecordingPendingRef.current = true;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    const session = await uploadServiceRef.current.startPressRecording('press-to-talk');
    recordingSessionRef.current = session;
    startRecordingPendingRef.current = false;

    if (session.phase !== 'recording') {
      setIsPressRecording(false);
      recordingSessionRef.current = null;
      return;
    }

    if (pendingReleaseActionRef.current) {
      const action = pendingReleaseActionRef.current;
      pendingReleaseActionRef.current = null;
      await finalizePressRecord(action);
    }
  };

  const handlePressIn = (event: GestureResponderEvent) => {
    const point = readTouchPoint(event);
    setIsPressHolding(true);
    pressStartXRef.current = point.x;
    pressStartYRef.current = point.y;
    lastTouchXRef.current = point.x;
    lastTouchYRef.current = point.y;
    slideCancelRef.current = false;
    longPressStartedRef.current = false;
    setIsSlideCancelPreview(false);

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = setTimeout(() => {
      longPressStartedRef.current = true;
      void startPressRecord();
      updateSlideCancelState(lastTouchXRef.current, lastTouchYRef.current);
    }, 180);
  };

  const handlePressMove = (event: GestureResponderEvent) => {
    const point = readTouchPoint(event);
    lastTouchXRef.current = point.x;
    lastTouchYRef.current = point.y;
    updateSlideCancelState(lastTouchXRef.current, lastTouchYRef.current);
  };

  const resetGestureRefs = () => {
    slideCancelRef.current = false;
    longPressStartedRef.current = false;
    pressStartXRef.current = null;
    pressStartYRef.current = null;
    lastTouchXRef.current = null;
    lastTouchYRef.current = null;
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    const point = readTouchPoint(event);
    setIsPressHolding(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    lastTouchXRef.current = point.x;
    lastTouchYRef.current = point.y;
    updateSlideCancelState(lastTouchXRef.current, lastTouchYRef.current);

    if (!longPressStartedRef.current) {
      setIsSlideCancelPreview(false);
      resetGestureRefs();
      return;
    }

    if (slideCancelRef.current) {
      if (startRecordingPendingRef.current) {
        pendingReleaseActionRef.current = 'cancel';
      } else {
        void finalizePressRecord('cancel');
      }
    } else if (startRecordingPendingRef.current) {
      pendingReleaseActionRef.current = 'send';
    } else {
      void finalizePressRecord('send');
    }

    setIsSlideCancelPreview(false);
    resetGestureRefs();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          handlePressIn(event);
        },
        onPanResponderMove: (event) => {
          handlePressMove(event);
        },
        onPanResponderRelease: (event) => {
          handlePressOut(event);
        },
        onPanResponderTerminate: (event) => {
          handlePressOut(event);
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [handlePressIn, handlePressMove, handlePressOut]
  );

  return (
    <View {...panResponder.panHandlers}>
      {!isPressRecording ? (
        <>
        <Pressable
          accessibilityRole="button"
          android_ripple={{ color: 'rgba(124,124,132,0.18)', radius: 30 }}
          style={({ pressed }) => [
            styles.ringButtonOuter,
            { backgroundColor: pressed ? ringPressedColor : ringColor },
          ]}
        >
          <View style={[styles.ringButtonInner, { backgroundColor: cardBg }]} />
        </Pressable>

        <View style={styles.pullHint} pointerEvents="none">
          <View style={[styles.chevronStroke, styles.chevronLeft, { backgroundColor: subtitleColor }]} />
          <View style={[styles.chevronStroke, styles.chevronRight, { backgroundColor: subtitleColor }]} />
        </View>
        </>
      ) : (
        <View style={styles.recordingContainer} pointerEvents="none">
          <Text
            style={[
              styles.recordingHint,
              { color: isSlideCancelPreview ? '#B91C1C' : subtitleColor },
              isSlideCancelPreview ? styles.recordingHintCancel : null,
            ]}
          >
            {isSlideCancelPreview ? '松手取消发送' : '松手发送，上滑取消'}
          </Text>

          <View style={styles.recordingDotsRow}>
            {recordingDots.map((dot) => (
              <View
                key={dot.key}
                style={[
                  styles.recordingDot,
                  { height: Math.max(4, dot.height), opacity: dot.opacity },
                  isSlideCancelPreview ? styles.recordingDotCancel : styles.recordingDotNormal,
                ]}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  recordingContainer: {
    width: 240,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  recordingHint: {
    fontSize: 15,
    opacity: 0.85,
    marginBottom: 18,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  recordingHintCancel: {
    opacity: 1,
  },
  recordingDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 3,
    height: 40,
  },
  recordingDot: {
    width: 3,
    borderRadius: 1.5,
  },
  recordingDotNormal: {
    backgroundColor: '#3B82F6',
  },
  recordingDotCancel: {
    backgroundColor: '#EF4444',
  },
});
