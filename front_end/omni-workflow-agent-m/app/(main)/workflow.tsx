import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard, 
  KeyboardAvoidingView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';

export default function WorkflowScreen() {
  const [inputText, setInputText] = useState("");
  const insets = useSafeAreaInsets();

  const bgColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: bgColor }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/*  */}
          </View>

          <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: cardColor,
              marginBottom: 16, 
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginHorizontal: 16,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4, // Android 阴影
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

//  return (
//     <KeyboardAvoidingView style={{ flex: 1, backgroundColor: bgColor }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//         <View style={{ flex: 1 }}>
//           <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//             {/* <Ionicons name="infinite" size={60} color={tintColor} />
//             <ThemedText type="title" style={{ marginTop: 12 }}>今天有什么可以帮到你？</ThemedText> */}
//           </View>

//           <View
//           style={[
//             styles.inputContainer,
//             {
//               backgroundColor: cardColor,
//               marginBottom: insets.bottom > 0 ? insets.bottom : 16, 
//             },
//           ]}
//         >
//           <TextInput
//             style={[styles.input, { color: textColor }]}
//             placeholder="发消息或按住说话"
//             placeholderTextColor="#999"
//             multiline
//             value={inputText}
//             onChangeText={setInputText}
//             underlineColorAndroid="transparent"
//           />

//           {/* <View style={styles.actionRow}>
//             <View style={styles.leftActions}>
//               <TouchableOpacity style={styles.pillButton}>
//                 <Ionicons name="aperture-outline" size={16} color={tintColor} />
//                 <ThemedText style={styles.pillText}>思考</ThemedText>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.pillButton}>
//                 <Ionicons name="globe-outline" size={16} color={tintColor} />
//                 <ThemedText style={styles.pillText}>搜索</ThemedText>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.rightActions}>
//               <TouchableOpacity style={styles.iconCircle}>
//                 <Ionicons name="add" size={24} color={textColor} />
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.iconCircle}>
//                 <Ionicons name="mic-outline" size={24} color={textColor} />
//               </TouchableOpacity>
//             </View>
//           </View> */}
//         </View>
//         </View>
//       </TouchableWithoutFeedback>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   inputContainer: {
//     marginHorizontal: 16,
//     borderRadius: 28,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     elevation: 4, // Android 阴影
//   },
//   input: {
//     fontSize: 16,
//     minHeight: 40,
//     maxHeight: 120,
//     textAlignVertical: 'top',
//   },
//   actionRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   leftActions: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   rightActions: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   pillButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(128,128,128,0.1)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     gap: 4,
//   },
//   pillText: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   iconCircle: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: 'rgba(128,128,128,0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   }
// });