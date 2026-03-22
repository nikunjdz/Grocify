import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-4xl font-bold text-blue-600 mb-4">
        Grocify
      </Text>
      <Text className="text-xl text-gray-600">
        Grocery App – Ready to go!
      </Text>
    </View>
  );
}