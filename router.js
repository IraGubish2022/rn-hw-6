//import "react-native-gesture-handler";
// import React from "react";
import { TouchableOpacity } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import LoginScreen from "./screens/auth/LoginScreen";
import RegistrationScreen from "./screens/auth/RegistrationScreen";
import PostsScreen from "./screens/mainScreen/PostsScreen";
import CreateScreen from "./screens/mainScreen/CreatePostsScreen";
import ProfileScreen from "./screens/mainScreen/ProfileScreen";

const AuthStack = createStackNavigator();
const MainTab = createBottomTabNavigator();

const useRoute = (isAuth) => {
  if (!isAuth) {
    return (
      <AuthStack.Navigator>
        <AuthStack.Screen
          options={{ headerShown: false }}
          name="Login"
          component={LoginScreen}
        />
        <AuthStack.Screen
          options={{ headerShown: false }}
          name="Registration"
          component={RegistrationScreen}
        />
      </AuthStack.Navigator>
    );
  }

  return (
    <MainTab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 83,
          display: "flex",
          gap: 30,
          paddingHorizontal: 80,
          paddingTop: 9,
        },
      }}
    >
      <MainTab.Screen
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, size, color }) => (
            <Feather name="grid" size={size} color={color} />
          ),
          tabBarItemStyle: { borderRadius: "20px", height: 40, width: 70 },
          tabBarActiveBackgroundColor: "#FF6C00",
          tabBarActiveTintColor: "#FFFFFF",
        }}
        name="Posts"
        component={PostsScreen}
      />
      <MainTab.Screen
        options={({ navigation }) => ({
          headerLeft: () => (
            <TouchableOpacity
              style={{ marginLeft: 20 }}
              onPress={() => navigation.goBack()}
            >
              <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
          ),
          tabBarIcon: ({ focused, size, color }) => (
            <Feather name="plus" size={size} color={color} />
          ),
          tabBarItemStyle: { borderRadius: "20px", height: 40, width: 70 },
          tabBarActiveBackgroundColor: "#FF6C00",
          tabBarActiveTintColor: "#FFFFFF",
          title: "Create Post",
          tabBarStyle: { display: "none" },
        })}
        name="Create"
        component={CreateScreen}
      />
      <MainTab.Screen
        options={{
          tabBarIcon: ({ focused, size, color }) => (
            <Feather name="user" size={size} color={color} />
          ),
          tabBarItemStyle: { borderRadius: "20px", height: 40, width: 70 },
          tabBarActiveBackgroundColor: "#FF6C00",
          tabBarActiveTintColor: "#FFFFFF",
          headerShown: false,
        }}
        name="Profile"
        component={ProfileScreen}
      />
    </MainTab.Navigator>
  );
};
export default useRoute;
