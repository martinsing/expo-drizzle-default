// addUser.tsx
import { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet } from "react-native";
import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { usersTable } from "../db/schema";
import { router } from "expo-router";

// Initialize database connection
const expo = SQLite.openDatabaseSync("db.db", { enableChangeListener: true });
const db = drizzle(expo);

export default function User() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // We can create this in logic.ts and import it here, but here's an example of the logic within the component.
  const createUser = async () => {
    //if name or email is empty, show an alert
    if (!name || !email) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    //insert the user into the database
    try {
      await db.insert(usersTable).values([{ name, email }]);
      router.replace("./userList");
    } catch (error) {
      console.error("Error saving user:", error);
      Alert.alert("Error", "Failed to save user. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Button title="Create User" onPress={createUser} />
    </View>
  );
}

// Extracted styles for better readability
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
  },
});
