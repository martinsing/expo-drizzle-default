// updateUser.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getUserById, updateUser, deleteUser } from "../db/logic";

export default function UpdateUser() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Fetch user data only when id is available
  useEffect(() => {
    if (!id) return; // Return early if id is not available

    const fetchUser = async () => {
      const user = await getUserById(id);
      if (user) {
        setName(user.name);
        setEmail(user.email);
      }
    };

    fetchUser();
  }, [id]);

  const handleUpdate = async () => {
    if (!name || !email) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      await updateUser(id, { name, email });
      router.replace("./userList");
    } catch (error) {
      console.error("Error updating user:", error);
      Alert.alert("Error", "Failed to update user.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(id);
      router.replace("./userList");
    } catch (error) {
      console.error("Error deleting user:", error);
      Alert.alert("Error", "Failed to delete user.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>ID: {id}</Text>
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
      <Button title="Update" onPress={handleUpdate} />
      <Button title="Delete" onPress={handleDelete} color="red" />
    </View>
  );
}

// Extracted styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
});
