// userlist.tsx:
import React, { useState, useEffect, useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Button,
  RefreshControl,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { router } from "expo-router";
import { getAllUsers, checkDatabaseState } from "../db/logic";

// Check database state on initial load (optional)
checkDatabaseState();

type User = { id: string; name: string; email: string };

// Container to render each user in the list
const UserItem = ({ user }: { user: User }) => (
  <TouchableOpacity
    style={styles.item}
    onPress={() =>
      router.push({
        pathname: "./updateUser",
        params: { id: user.id, name: user.name, email: user.email },
      })
    }
  >
    <Text style={styles.title}>ID: {user.id}</Text>
    <Text style={styles.title}>Name: {user.name}</Text>
    <Text style={styles.title}>Email: {user.email}</Text>
  </TouchableOpacity>
);

export default function List() {
  const [users, setUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = useCallback(async () => {
    // useCallback is used to memoize the function, reducing unnecessary re-renders
    setRefreshing(true); // Set refreshing to true to show the loading spinner
    const usersData = await getAllUsers();
    console.log("Fetched users:", usersData);
    setUsers(usersData);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={users}
          renderItem={({ item }) => <UserItem user={item} />}
          keyExtractor={(item) => item.id}
          refreshControl={
            // Pass onRefresh to FlatList to trigger fetchUsers() when the user pulls down.
            <RefreshControl refreshing={refreshing} onRefresh={fetchUsers} />
          }
        />
        <Button title="Add User" onPress={() => router.push("./addUser")} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 14,
  },
});
