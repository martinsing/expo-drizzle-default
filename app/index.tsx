import { router } from "expo-router";
import { Button, View } from "react-native";
import { initializeDatabase } from "@/db/logic";

// Initialize the database, if it doesn't exist
initializeDatabase();
export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button title="See Users" onPress={() => router.push("./userList")} />
    </View>
  );
}
