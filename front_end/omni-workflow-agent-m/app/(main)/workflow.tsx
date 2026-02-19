import React, { useState, useEffect} from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';

interface WorkflowScreenProps {
  setPagerScrollEnabled: (enabled: boolean) => void;
}

export default function WorkflowScreen({ setPagerScrollEnabled }: WorkflowScreenProps) {
  const [inputText, setInputText] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const insets = useSafeAreaInsets();  // 获取设备安全区信息

  const bgColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");

  // 监听 键盘显隐事件/控制滑动/记录键盘高度
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setPagerScrollEnabled(false);
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setPagerScrollEnabled(true);
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [setPagerScrollEnabled]);

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>

          <View style={{ flex: 1}} />
            
          <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: cardColor, 
              marginBottom:
                insets.bottom +
                16 +
                (Platform.OS === 'android' ? Math.max(0, keyboardHeight - insets.bottom) : 0),
            },
          ]}
        >
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="发消息或按住说话"
            placeholderTextColor="#999"
            multiline
            value={inputText}
            onChangeText={setInputText}
            underlineColorAndroid="transparent"
          />

          <View style={styles.actionRow}>
            <View style={styles.leftActions}>
              {/*  */}
            </View>

            <View style={styles.rightActions}>
              <TouchableOpacity style={styles.iconCircle}>
                <Ionicons name="add" size={24} color={textColor} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconCircle}>
                <Ionicons name="mic-outline" size={24} color={textColor} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginHorizontal: 16,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4, 
  },
  input: {
    fontSize: 16,
    minHeight: 40,
    maxHeight: 120,
    textAlignVertical: 'top',
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
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(128,128,128,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
