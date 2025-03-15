expo-drizzle-default

# Get Started

As I was trying to learn expo when I decided I needed an ORM.
Drizzle seemed robust though the documentation needed more information.
I will fork what they have made from drizzle's [get started](https://orm.drizzle.team/docs/get-started/expo-new). **The only exception is that age was removed**

This repo will show you how to setup expo with drizzle. The instructions will then create a simple app to demonstrate drizzle. I will try to use as few dependacies and libraries as possible. The repo will create an experience that can create, read, update, and delete (CRUD) users as needed.

We'll use npm but I'm sure you can figure out the other commands if needed

## Step 1 - Setup a project from Expo Template

We're using the [default template](https://docs.expo.dev/more/create-expo/) because it's suitable for most apps.

`npx create-expo-app --template default`

Name your app, I've calling the project _expo-drizzle-default_

### Change Directory in the Terminal

`cd expo-drizzle-default`

### Delete the example project

`npm run reset-project`

## Step 2 - Install required packages etc

`npx expo install expo-sqlite`

`npm i drizzle-orm`

`npm i -D drizzle-kit`

`npm i babel-plugin-inline-import`

`npx expo customize metro.config.js`

`npx expo customize babel.config.js`

<!-- # Step 3 - Connect Drizzle ORM to the database

In the Root Directory, create `App.tsx` and initilize the connection.

```
import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
const expo = SQLite.openDatabaseSync('db.db');
const db = drizzle(expo);
``` -->

## Step - Create a Schema

Create a schema.ts file in the db directory and declare your table. It's the same as Drizzle's get started minus the age element.

`db/schema.ts`

```
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const usersTable = sqliteTable("users_table", {
id: int().primaryKey({ autoIncrement: true }),
name: text().notNull(),
email: text().notNull().unique(),
});
```

## Step - Setup config files

These should exist in your Root Folder

### metro config

`metro.config.js`

```
const { getDefaultConfig } = require('expo/metro-config');
/\*_ @type {import('expo/metro-config').MetroConfig} _/
const config = getDefaultConfig(\_\_dirname);
config.resolver.sourceExts.push('sql'); // <- add this line
module.exports = config;
```

### babel config

`babel.config.js`

```
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [["inline-import", { "extensions": [".sql"] }]] // <-- add this line
  };
};
```

### drizzle config

Create `drizzle.config.ts` in the Root Directory with the following:

```
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "expo",
});
```

## Step - Generate Migrations

`npx drizzle-kit generate`

This will make:

1.  ./drizzle folder
2.  ./drizzle/migration.js
3.  ./drizzle/SQLmigrationfile.sql

## Step - Update index.tsx

The is the original code (minus the age) from Drizzle's [get started](https://orm.drizzle.team/docs/get-started/expo-new).

`./app/index.tsx`

```
import { Text, View } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { usersTable } from './db/schema';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from './drizzle/migrations';
const expo = SQLite.openDatabaseSync('db.db');
const db = drizzle(expo);
export default function App() {
  const { success, error } = useMigrations(db, migrations);
  const [items, setItems] = useState<typeof usersTable.$inferSelect[] | null>(null);
  useEffect(() => {
    if (!success) return;
    (async () => {
      await db.delete(usersTable);
      await db.insert(usersTable).values([
        {
            name: 'John',
            email: 'john@example.com',
        },
      ]);
      const users = await db.select().from(usersTable);
      setItems(users);
    })();
  }, [success]);
  if (error) {
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }
  if (!success) {
    return (
      <View>
        <Text>Migration is in progress...</Text>
      </View>
    );
  }
  if (items === null || items.length === 0) {
    return (
      <View>
        <Text>Empty</Text>
      </View>
    );
  }
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
      }}
    >
      {items.map((item) => (
        <Text key={item.id}>{item.email}</Text>
      ))}
    </View>
  );
}
```

## Step - expo start

`npx expo start` If successful, you should see John's email. Hurray!

**Setup Complete!**

# Make a functional application

Starting here, we're moving past setting up drizzle and making the basic app.

We're going to:

1. update `./app/index.tsx`
2. make the logic that joins everything `./db/logic.ts`
3. make `./app/userList.tsx`
4. make `./app/addUser.tsx`
5. make `./app/updateUser.tsx`

If you want to practice, then you can combined addUser.tsx and updateUser.tsx as their views are pretty much the same. Follow along in Expo Go and don't forget to refresh `r` to see how this app comes together.

## Update index.tsx

Not going to mess too much with index.tsx and App.tsx and play with the config files. We'll make a simple index.tsx have a button that will point us to the list of users.

`./app/index.tsx`

```
import { router } from "expo-router";
import { Text, View, Button } from "react-native";

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
```

## Step - make logic.ts

This file contains the logic for interacting with the SQLite database. It provides functions for fetching, updating, and deleting user records from the database. Create `./db/logic.ts` with the following:

```
// db/logic.ts
import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";

const expo = SQLite.openDatabaseSync("db.db", { enableChangeListener: true });
const db = drizzle(expo);

// Database logic is kept in this file to keep the other files clean

// Checks to see if there is any data in database with a count in userList
export async function checkDatabaseState() {
  try {
    const count = await db.$count(usersTable);
    console.log(`Current users in the database: ${count}`);
  } catch (error) {
    console.error("Error checking database state:", error);
  }
}

// Reads all Users in userList
export async function getAllUsers() {
  try {
    const users = await db.select().from(usersTable);
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// Reads User by ID in updateUser
export async function getUserById(id: string) {
  try {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));
    return users[0] || null; // Return the first user or null
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
}

// Updates Current User in updateUser
export async function updateUser(
  id: string,
  data: { name: string; email: string }
) {
  try {
    await db.update(usersTable).set(data).where(eq(usersTable.id, id));
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

// Deletes Current User in in updateUser
export async function deleteUser(id: string) {
  try {
    await db.delete(usersTable).where(eq(usersTable.id, id));
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

```

## Step - Create userList.tsx:

This screen **READS** the list of all users currently in the database.
Create `./app/userList.tsx` with the following:

```
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
```

## Step - Create addUser.tsx:

This screen allows us to **CREATE** new users to the database
Create `./app/addUser.tsx` with the following:

```
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
```

## Step - make updateUser.tsx

This screen **READS** the userTable and allows us to **UPDATE** & **DELETE** new users in the database. Create `./app/updateUser.tsx` with the following:

```
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
```

**All done!** Play around with it. I hope this has helped you in learning how to start an Expo project and get started using drizzle.
