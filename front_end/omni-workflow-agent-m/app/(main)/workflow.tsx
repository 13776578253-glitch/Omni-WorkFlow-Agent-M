import React, { useEffect, useState } from 'react';
import { Keyboard, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WorkflowContentArea } from '@/components/workflow/Workflow_ContentArea';
import { WorkflowInputBar } from '@/components/workflow/Workflow_InputBar';
import { WorkflowQuickActions } from '@/components/workflow/Workflow_QuickActions';
import { useThemeColor } from '@/hooks/use-theme-color';

interface WorkflowScreenProps {
  setPagerScrollEnabled: (enabled: boolean) => void;
}

export default function WorkflowScreen({ setPagerScrollEnabled }: WorkflowScreenProps) {
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const insets = useSafeAreaInsets();

  const bgColor = useThemeColor({}, 'background');

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

  const inputBarMarginBottom =
    insets.bottom +
    20 +
    (Platform.OS === 'android' ? Math.max(0, keyboardHeight - insets.bottom) : 0);

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <View style={{ flex: 1 }}>
        <WorkflowContentArea />

        <View>
          <WorkflowQuickActions />

          <WorkflowInputBar
            value={inputText}
            onChangeText={setInputText}
            onSubmit={() => setInputText('')}
            containerStyle={{ marginBottom: inputBarMarginBottom }}
          />
        </View>
      </View>
    </View>
  );
}
