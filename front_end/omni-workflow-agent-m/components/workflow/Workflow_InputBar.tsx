import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, PanResponder, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, type GestureResponderEvent, type ViewStyle } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { WorkflowFileUpload } from '@/components/workflow/Workflow_file upload';
import type {
  WorkflowAttachment,
  WorkflowPendingLongAudioInput,
  WorkflowRecordedAudioPreview,
  WorkflowRecordingSession,
} from '@/constants/workflow_type';
import { useThemeColor } from '@/hooks/use-theme-color';
import { pickWorkflowCameraImage } from '@/services/workflow/Workflow_Camera';
import { createWorkflowUploadService } from '@/services/workflow/Workflow_Upload';
import { getWorkflowAudioDurationMs } from '@/services/workflow/Workflow_audio_read';
import {
  DEFAULT_LONG_AUDIO_PROMPT,
  inferWorkflowAudioMimeType,
  isWorkflowAudioFile,
} from '@/services/workflow/Workflow_audio_utils';
import { uploadAttachmentToBackend } from '@/services/workflow/Workflow_Upload_Backend';
import { pickWorkflowUploadFile } from '@/services/workflow/Workflow_upload_file';

interface WorkflowInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onPressInRecord?: () => void;   // 新增录音相关回调
  onPressOutRecord?: () => void;
  onCancelRecord?: () => void;    // 滑动取消录音回调
  onSlideCancelStateChange?: (isCancel: boolean) => void;
  isPressRecording?: boolean;
  recordSlideCancelThreshold?: number;
  containerStyle?: ViewStyle;
  onKeyboardVisibleChange?: (visible: boolean) => void;
  attachments?: WorkflowAttachment[];
  onAttachmentsChange?: (attachments: WorkflowAttachment[]) => void;
  onLongRecordAudioReady?: (audio: WorkflowRecordedAudioPreview) => void;
  onLongAudioInputReady?: (audio: WorkflowPendingLongAudioInput) => void;
  hasRecordedAudioPreview?: boolean;
  onClearRecordedAudioPreview?: () => void;
}

export function WorkflowInputBar({
  value,
  onChangeText,
  onSubmit,
  onPressInRecord,
  onPressOutRecord,
  onCancelRecord,
  onSlideCancelStateChange,
  isPressRecording = false,
  recordSlideCancelThreshold = 56,
  containerStyle,
  onKeyboardVisibleChange,
  attachments = [],
  onAttachmentsChange,
  onLongRecordAudioReady,
  onLongAudioInputReady,
  hasRecordedAudioPreview = false,
  onClearRecordedAudioPreview,
}: WorkflowInputBarProps) {
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const inactiveSendBgColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'card');
  const inactiveSendBorderColor = useThemeColor({ light: 'rgba(128,128,128,0.2)', dark: '#38383A' }, 'border');
  // 输入框文字数量 / 控制发送 UI
  const hasText = value.trim().length > 0;
  const hasSubmitContent = hasText || hasRecordedAudioPreview;

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isPressHolding, setIsPressHolding] = useState(false);
  const [showLongRecordSheet, setShowLongRecordSheet] = useState(false);
  const [isLongRecording, setIsLongRecording] = useState(false);
  const [longRecordDuration, setLongRecordDuration] = useState(0);
  const [longRecordWaveTick, setLongRecordWaveTick] = useState(0);

  // 持久化 Ref / 测试 / 待确认
  const pressStartXRef = useRef<number | null>(null);  // 按动时 X坐标
  const pressStartYRef = useRef<number | null>(null);  // 按动时 Y坐标
  const lastTouchXRef = useRef<number | null>(null);   // 滑动时 X坐标
  const lastTouchYRef = useRef<number | null>(null);   // 滑动时 Y坐标
  const slideCancelRef = useRef(false);                // 触发 滑动取消 
  const longPressStartedRef = useRef(false);           // 触发 长按     
  // 长计时器 Ref / 测试 / 长按延迟
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);            // 输入框 Ref / 聚焦
  const uploadServiceRef = useRef(createWorkflowUploadService());
  const longRecordSessionRef = useRef<WorkflowRecordingSession | null>(null);
  const longRecordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // 录音 启动 / 未录音 + 键盘收起 + 无输入框文字(可选)
  const pressToRecordEnabled = !isPressRecording && !isKeyboardVisible && value.trim().length === 0;
  // 录音层 显隐
  const showPressRecordTouchLayer = pressToRecordEnabled || isPressHolding;

  // 键盘 监听 / 弹出/收起
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
      onKeyboardVisibleChange?.(true);
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
      onKeyboardVisibleChange?.(false);
      inputRef.current?.blur();
    });

    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      showSub.remove();
      hideSub.remove();
    };
  }, [onKeyboardVisibleChange]);

  useEffect(() => {
    if (!isLongRecording) return;
    const timer = setInterval(() => {
      setLongRecordWaveTick((prev) => prev + 1);
    }, 70);
    return () => clearInterval(timer);
  }, [isLongRecording]);

  // 监听 触摸事件 坐标
  const readTouchPoint = (event: GestureResponderEvent) => {
    const nativeEvent = event.nativeEvent as GestureResponderEvent['nativeEvent'] & {
      touches?: Array<{ pageX?: number; pageY?: number }>;
      changedTouches?: Array<{ pageX?: number; pageY?: number }>;
    };
    // 当前 触摸点 / 变化 触摸点
    const touch = nativeEvent.touches?.[0] ?? nativeEvent.changedTouches?.[0];
    const pageX = nativeEvent.pageX ?? touch?.pageX;
    const pageY = nativeEvent.pageY ?? touch?.pageY;
    return {
      x: Number.isFinite(pageX) ? pageX : null,
      y: Number.isFinite(pageY) ? pageY : null,
    };
  };

  // 更新 滑动取消状态 
  const updateSlideCancelState = (currentX: number | null, currentY: number | null) => {
    // 检验 / 未触发长按/无初始/当前坐标
    if (
      !longPressStartedRef.current || 
      pressStartXRef.current == null || pressStartYRef.current == null ||
      currentX == null || currentY == null
    ) {
      return;
    }

    // 滑动距离 计算
    const deltaY = pressStartYRef.current - currentY;            // Y 轴偏移
    const deltaX = Math.abs(currentX - pressStartXRef.current);  // X 轴偏移 (绝对值)

    // 取消阈值
    const cancelEnterThreshold = recordSlideCancelThreshold;                                  // 进入取消状态 (56px)
    const cancelExitThreshold = Math.max(12, Math.floor(recordSlideCancelThreshold * 0.72));  // 退出取消状态
    
    // 滑动方向
    const movingUp = deltaY > 0;
    const verticalDominant = deltaY > deltaX * 1.1;

    // 取消状态判断
    const nextIsCancel = slideCancelRef.current
      ? movingUp && deltaY > cancelExitThreshold
      : movingUp && verticalDominant && deltaY > cancelEnterThreshold;
    if (slideCancelRef.current !== nextIsCancel) {
      slideCancelRef.current = nextIsCancel;
      onSlideCancelStateChange?.(nextIsCancel);
    }
  };

  // 按住事件 / 初始化坐标 + 启动计时器
  const handlePressIn = (event: GestureResponderEvent) => {
    const point = readTouchPoint(event);
    setIsPressHolding(true);
    // 初始化坐标 Ref
    pressStartXRef.current = point.x;
    pressStartYRef.current = point.y;
    lastTouchXRef.current = point.x;
    lastTouchYRef.current = point.y;
    // 重置状态
    slideCancelRef.current = false;
    longPressStartedRef.current = false;
    onSlideCancelStateChange?.(false);

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = setTimeout(() => {
      longPressStartedRef.current = true;
      onPressInRecord?.();
      updateSlideCancelState(lastTouchXRef.current, lastTouchYRef.current);  // 初始化取消状态
    }, 180);
  };
   
  // 输入区 / 未触发长按 则聚焦
  const handleTapInputArea = () => {
    if (!longPressStartedRef.current) {
      inputRef.current?.focus();
    }
  };

  // 滑动事件 / 更新坐标 + 取消状态
  const handlePressMove = (event: GestureResponderEvent) => {
    const point = readTouchPoint(event);  // 最新坐标
    lastTouchXRef.current = point.x;
    lastTouchYRef.current = point.y;
    updateSlideCancelState(lastTouchXRef.current, lastTouchYRef.current);  // 判断取消状态
  };

  // 松开
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
      handleTapInputArea();
      slideCancelRef.current = false;
      onSlideCancelStateChange?.(false);
      pressStartXRef.current = null;
      pressStartYRef.current = null;
      lastTouchXRef.current = null;
      lastTouchYRef.current = null;
      return;
    }

    if (slideCancelRef.current) {
      onCancelRecord?.();
    } else {
      onPressOutRecord?.();
    }

    slideCancelRef.current = false;
    onSlideCancelStateChange?.(false);
    pressStartXRef.current = null;
    pressStartYRef.current = null;
    lastTouchXRef.current = null;
    lastTouchYRef.current = null;
    longPressStartedRef.current = false;
  };

  // PanResponder 用于 录音 按住说话 的手势处理 / 兼容按住 + 滑动取消 / 待复用逻辑 / 极小概率拆分
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

  const handleOpenLongRecordSheet = () => {
    setShowLongRecordSheet(true);
  };

  const handleCloseLongRecordSheet = () => {
    setShowLongRecordSheet(false);
  };

  // 附件相关处理函数 / 测试
  const handleRemoveAttachment = async (id: string) => {
    const { WorkflowLocalFileStorage } = await import('@/services/workflow/Workflow_upload_local_file');
    await WorkflowLocalFileStorage.deleteFile(id);
    onAttachmentsChange?.(attachments.filter(a => a.id !== id));
  };

  const handleRetryUpload = async (id: string) => {
    const target = attachments.find((attachment) => attachment.id === id);
    if (!target) {
      return;
    }

    onAttachmentsChange?.(
      attachments.map((attachment) =>
        attachment.id === id
          ? { ...attachment, uploadStatus: 'uploading' as const }
          : attachment
      )
    );

    try {
      const fileRef = await uploadAttachmentToBackend(target);
      onAttachmentsChange?.(
        attachments.map((attachment) =>
          attachment.id === id
            ? { ...attachment, uploadStatus: 'success' as const, fileRef }
            : attachment
        )
      );
    } catch {
      onAttachmentsChange?.(
        attachments.map((attachment) =>
          attachment.id === id
            ? { ...attachment, uploadStatus: 'error' as const }
            : attachment
        )
      );
    }
  };

  // 文件上传处理函数 / 待优化
  const handlePressCameraUpload = async () => {
    const result = await pickWorkflowCameraImage();
    if (!result || !result.uri) return;

    const { WorkflowLocalFileStorage } = await import('@/services/workflow/Workflow_upload_local_file');
    const { generateThumbnail } = await import('@/services/workflow/Workflow_Image_Compress');

    const fileName = result.fileName || 'image.jpg';
    const mimeType = result.mimeType || 'image/jpeg';
    const fileEntry = await WorkflowLocalFileStorage.saveFile(result.uri, fileName, mimeType);
    const thumbnailUri = await generateThumbnail(result.uri);

    const attachment: WorkflowAttachment = {
      id: fileEntry.id,
      type: 'image',
      fileName: fileEntry.originalName,
      fileSize: fileEntry.size,
      mimeType: fileEntry.mimeType,
      localPath: fileEntry.localPath,
      thumbnailUri,
      uploadStatus: 'pending',
    };

    onAttachmentsChange?.([...attachments, attachment]);
    handleCloseLongRecordSheet();
  };

  // 图库上传处理函数 / 待优化
  const handlePressGalleryUpload = async () => {
    const { pickWorkflowGalleryImage } = await import('@/services/workflow/Workflow_Gallery');
    const result = await pickWorkflowGalleryImage();
    if (!result || !result.uri) return;

    const { WorkflowLocalFileStorage } = await import('@/services/workflow/Workflow_upload_local_file');
    const { generateThumbnail } = await import('@/services/workflow/Workflow_Image_Compress');

    const fileName = result.fileName || 'image.jpg';
    const mimeType = result.mimeType || 'image/jpeg';
    const fileEntry = await WorkflowLocalFileStorage.saveFile(result.uri, fileName, mimeType);
    const thumbnailUri = await generateThumbnail(result.uri);

    const attachment: WorkflowAttachment = {
      id: fileEntry.id,
      type: 'image',
      fileName: fileEntry.originalName,
      fileSize: fileEntry.size,
      mimeType: fileEntry.mimeType,
      localPath: fileEntry.localPath,
      thumbnailUri,
      uploadStatus: 'pending',
    };

    onAttachmentsChange?.([...attachments, attachment]);
    handleCloseLongRecordSheet();
  };

  // 文件上传处理函数 / 待优化
  const handlePressFileUpload = async () => {
    const result = await pickWorkflowUploadFile();
    if (!result || !result.uri) return;

    const { WorkflowLocalFileStorage } = await import('@/services/workflow/Workflow_upload_local_file');

    const fileName = result.name || 'file';
    const mimeType = result.mimeType || 'application/octet-stream';
    const fileEntry = await WorkflowLocalFileStorage.saveFile(result.uri, fileName, mimeType);

    if (isWorkflowAudioFile({ fileName, mimeType })) {
      const durationMs = (await getWorkflowAudioDurationMs(fileEntry.localPath)) ?? 0;
      onLongRecordAudioReady?.({
        audioUri: fileEntry.localPath,
        durationMs,
        remoteAudioId: null,
        sourceMode: 'long-form',
      });
      onLongAudioInputReady?.({
        audioUri: fileEntry.localPath,
        durationMs,
        remoteAudioId: null,
        sourceMode: 'long-form',
        prompt: DEFAULT_LONG_AUDIO_PROMPT,
        origin: 'uploaded-audio',
        fileName: fileEntry.originalName,
        mimeType: inferWorkflowAudioMimeType({ fileName, mimeType }),
      });
      handleCloseLongRecordSheet();
      return;
    }

    const attachment: WorkflowAttachment = {
      id: fileEntry.id,
      type: 'file',
      fileName: fileEntry.originalName,
      fileSize: fileEntry.size,
      mimeType: fileEntry.mimeType,
      localPath: fileEntry.localPath,
      uploadStatus: 'pending',
    };

    onAttachmentsChange?.([...attachments, attachment]);
    handleCloseLongRecordSheet();
  };

  // 长录音处理函数
  const handleStartLongRecord = async () => {
    setIsLongRecording(true);
    setLongRecordDuration(0);

    const session = await uploadServiceRef.current.startPressRecording('long-form', 'workflow-long-form');
    longRecordSessionRef.current = session;

    if (session.phase === 'recording') {
      longRecordTimerRef.current = setInterval(() => {
        setLongRecordDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setIsLongRecording(false);
    }
  };

  const handleCancelLongRecord = async () => {
    if (longRecordTimerRef.current) {
      clearInterval(longRecordTimerRef.current);
      longRecordTimerRef.current = null;
    }

    if (longRecordSessionRef.current?.phase === 'recording') {
      await uploadServiceRef.current.stopPressRecording(longRecordSessionRef.current);
    }

    setIsLongRecording(false);
    setLongRecordDuration(0);
    setLongRecordWaveTick(0);
    longRecordSessionRef.current = null;
  };

  const handleConfirmLongRecord = async () => {
    if (longRecordTimerRef.current) {
      clearInterval(longRecordTimerRef.current);
      longRecordTimerRef.current = null;
    }

    const session = longRecordSessionRef.current;
    if (session?.phase === 'recording') {
      const stopped = await uploadServiceRef.current.stopPressRecording(session);
      const safeStoppedDurationMs =
        typeof stopped.durationMs === 'number' &&
        Number.isFinite(stopped.durationMs) &&
        stopped.durationMs > 0 &&
        stopped.durationMs <= 12 * 60 * 60 * 1000
          ? stopped.durationMs
          : 0;
      const effectiveDurationMs =
        longRecordDuration > 0
          ? longRecordDuration * 1000
          : safeStoppedDurationMs;
      // 预览回调 / 先展示录音文件 + 时长 / 后续上传完成后可更新状态或 URL
      if (stopped.localUrl) {
        console.log('[workflow-long-record] preview payload', {
          audioUri: stopped.localUrl,
          effectiveDurationMs,
          remoteAudioId: stopped.remoteAudioId ?? null,
        });
        onLongRecordAudioReady?.({
          audioUri: stopped.localUrl,
          durationMs: effectiveDurationMs,
          remoteAudioId: stopped.remoteAudioId ?? null,
          sourceMode: 'long-form',
        });
        onLongAudioInputReady?.({
          audioUri: stopped.localUrl,
          durationMs: effectiveDurationMs,
          remoteAudioId: stopped.remoteAudioId ?? null,
          sourceMode: 'long-form',
          prompt: DEFAULT_LONG_AUDIO_PROMPT,
          origin: 'recorded',
          fileName: `record-${Date.now()}.m4a`,
          mimeType: 'audio/m4a',
        });
      }
    }

    setIsLongRecording(false);
    setLongRecordDuration(0);
    setLongRecordWaveTick(0);
    longRecordSessionRef.current = null;
  };

  // 长录音波形数据
  const longRecordDots = useMemo(() =>
    Array.from({ length: 38 }).map((_, i) => {
      const centerIndex = (38 - 1) / 2;
      const distanceRatio = Math.abs(i - centerIndex) / centerIndex;
      const envelope = Math.max(0.32, 1 - Math.pow(distanceRatio, 1.28));
      const oscillation = 0.5 + 0.5 * Math.sin(longRecordWaveTick * 0.42 + i * 0.62);
      return {
        key: `long-dot-${i}`,
        height: 6 + envelope * (2 + oscillation * 8),
        opacity: 0.48 + envelope * (0.14 + oscillation * 0.2),
      };
    }),
  [longRecordWaveTick]);

  return (
    <>
      <View style={[styles.inputContainer, { backgroundColor: cardColor }, containerStyle]}>

        {!isLongRecording ? (
          <>
            {/* 状态 A: 默认输入状态 */}
            {/* 附件预览区 */}
            {attachments.length > 0 && (
              <View style={styles.attachmentPreviewArea}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachmentScroll}>
              {attachments.map((att) => (
                <View key={att.id} style={styles.attachmentItem}>
                  {att.type === 'image' ? (
                    <Image source={{ uri: att.thumbnailUri || att.localPath }} style={styles.attachmentThumbnail} />
                  ) : (
                    <View style={styles.fileThumbnail}>
                      <Ionicons name="document-outline" size={32} color="#666" />
                      <Text style={styles.fileName} numberOfLines={1}>{att.fileName}</Text>
                    </View>
                  )}
                  {att.uploadStatus === 'error' && (
                    <TouchableOpacity style={styles.retryOverlay} onPress={() => handleRetryUpload(att.id)}>
                      <Ionicons name="alert-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveAttachment(att.id)}>
                    <Ionicons name="close" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            
            {/* 附件分隔线 */}
            {/* <View style={styles.attachmentDivider} /> */}
          </View>
        )}

        {/* 输入区 */}
        <View style={styles.inputTouchArea}>
          {/* 文本输入 */}
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: textColor }]}
            placeholder="发消息或按住说话"
            placeholderTextColor="#999"
            multiline
            value={value}
            onChangeText={onChangeText}
            underlineColorAndroid="transparent"
          />
          {/* 录音(按住说话) / 长按显隐 */}
          {/* 待修改 */}
          {showPressRecordTouchLayer ? (
            <View
              style={[
                styles.pressRecordTouchLayer,
                isPressHolding ? styles.pressRecordTouchLayerExpanded : null,
              ]}
              {...panResponder.panHandlers}
            />
          ) : null}
        </View>

        {/* 功能区 */}
        <View style={styles.actionRow}>
          <View style={styles.leftActions} />

          <View style={styles.rightActions}>
            {hasRecordedAudioPreview ? (
              <TouchableOpacity style={styles.iconCircle} onPress={onClearRecordedAudioPreview}>
                <Ionicons name="close" size={18} color={textColor} />
              </TouchableOpacity>
            ) : null}
            {/* 文件上传 */}
            <TouchableOpacity style={styles.iconCircle} onPress={handleOpenLongRecordSheet}>
              <Ionicons name="add" size={24} color={textColor} />
            </TouchableOpacity>
            {/* 长时录音  */}
            <TouchableOpacity style={styles.iconCircle} onPress={handleStartLongRecord}>
              <Ionicons name="mic-outline" size={24} color={textColor} />
            </TouchableOpacity>
            {/* 发送 */}
            <TouchableOpacity
              style={[
                styles.sendIconCircle,
                hasSubmitContent ? styles.sendIconCircleActive : styles.sendIconCircleInactive,
                hasSubmitContent ? null :
                    {
                      backgroundColor: inactiveSendBgColor,
                      borderColor: inactiveSendBorderColor,
                    },
              ]}
              onPress={() => {
                Keyboard.dismiss();
                onSubmit?.();
              }}
            >
              <Ionicons
                name="arrow-up"
                size={18}
                color={hasSubmitContent ? '#FFFFFF' : textColor}
              />
            </TouchableOpacity>
          </View>
        </View>
          </>
        ) : (
          <>
            {/* 状态 B: 长录音状态 */}
            <View style={styles.longRecordingContent}>
              <View style={styles.longRecordingInfoRow}>
                <View style={styles.waveformCenterWrap}>
                  <View style={styles.waveformContainer}>
                    {longRecordDots.map((dot) => (
                      <View
                        key={dot.key}
                        style={[styles.recordingDot, { height: Math.max(4, dot.height), opacity: dot.opacity }]}
                      />
                    ))}
                  </View>
                </View>
                <View style={styles.durationWrap}>
                  <Text style={[styles.durationText, { color: textColor }]}>
                    {Math.floor(longRecordDuration / 60)}:{(longRecordDuration % 60).toString().padStart(2, '0')}
                  </Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <View style={styles.leftActions}>
                  <Text style={[styles.longRecordingLabel, { color: textColor }]}>长时录音中</Text>
                </View>

                <View style={styles.rightActions}>
                  <TouchableOpacity style={[styles.iconCircle, styles.cancelActionButton]} onPress={handleCancelLongRecord}>
                    <Ionicons name="close" size={18} color="#EF4444" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.iconCircle, styles.confirmActionButton]} onPress={handleConfirmLongRecord}>
                    <Ionicons name="checkmark" size={18} color="#10B981" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}
      </View>

      <WorkflowFileUpload
        visible={showLongRecordSheet}
        onClose={handleCloseLongRecordSheet}
        onPressCamera={handlePressCameraUpload}
        onPressGallery={handlePressGalleryUpload}  // 新增图库上传回调
        onPressFile={handlePressFileUpload}
      />
    </>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginHorizontal: 16,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 92,
    elevation: 2,
    shadowColor: '#7A7A7A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  input: {
    fontSize: 16,
    minHeight: 40,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  inputTouchArea: {
    position: 'relative',
  },
  pressRecordTouchLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  pressRecordTouchLayerExpanded: {
    top: -420,
    bottom: -120,
    left: -40,
    right: -40,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  leftActions: {
    flexDirection: 'row',
    gap: 8,
  },
  rightActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIconCircleInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
  },
  sendIconCircleActive: {
    backgroundColor: '#3B82F6',
    borderWidth: 0,
  },
  attachmentPreviewArea: {
    marginBottom: 8,
  },
  attachmentDivider: {
    height: 1,
    backgroundColor: 'rgba(128,128,128,0.15)',
    marginBottom: 8,
  },
  attachmentScroll: {
    maxHeight: 100,
  },
  attachmentItem: {
    width: 80,
    height: 80,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  attachmentThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
  },
  fileThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  fileName: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(128,128,128,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  longRecordingContent: {
    minHeight: 72,
    justifyContent: 'space-between',
  },
  longRecordingInfoRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
  },
  waveformCenterWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
    paddingRight: 34,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2.5,
    height: 28,
    width: '100%',
  },
  durationWrap: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  recordingDot: {
    width: 3,
    borderRadius: 1.5,
    backgroundColor: '#3B82F6',
  },
  durationText: {
    fontSize: 14,
    minWidth: 40,
    textAlign: 'right',
  },
  longRecordingLabel: {
    fontSize: 13,
    opacity: 0.72,
  },
  cancelActionButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.18)',
  },
  confirmActionButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.18)',
  },
});

