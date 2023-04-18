//import React from "react";
//import { View, Text, StyleSheet, Image } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";


import DefaultScreen from "../nestedScreens/DefaultScreen";
import CommentsScreen from "../nestedScreens/CommentsScreen";
import MapScreen from "../nestedScreens/MapScreen";

const NestedScreen = createStackNavigator();
const PostsScreen = () => {
  const navigation = useNavigation();
  return (
    <NestedScreen.Navigator>
      <NestedScreen.Screen
        options={{
          title: "Публикации",
          headerRight: () => (
            <TouchableOpacity>
              {/* onPress={signOut} */}
              <Feather
                name="log-out"
                size={24}
                color="#BDBDBD"
                style={{ marginRight: 10 }}
              />
            </TouchableOpacity>
          ),
        }}
        name="DefaultScreen"
        component={DefaultScreen}
      />
      <NestedScreen.Screen
        name="Comments"
        component={CommentsScreen}
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather
                name="arrow-left"
                size={24}
                color="#212121"
                style={{ marginLeft: 16 }}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <NestedScreen.Screen
        name="Map"
        component={MapScreen}
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather
                name="arrow-left"
                size={24}
                color="#212121"
                style={{ marginLeft: 16 }}
              />
            </TouchableOpacity>
          ),
        }}
      />
    </NestedScreen.Navigator>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "flex-start",
//     borderColor: "#BDBDBD",
//     borderWidth: 1,
//     backgroundColor: "#FFFFFF",
//   },
//   wrapper: {
//     top: 10,
//     zIndex: 5,
//     flexDirection: "row",
//     flexWrap: "wrap",

//     alignItems: "center",
//     marginHorizontal: 16,
//     marginVertical: 32,
//   },
//   name: {
//     fontSize: 13,
//     lineHeight: 15,
//     color: "#212121",
//   },
//   img: {
//     width: 60,
//     height: 60,
//     marginRight: 6,
//   },
//   email: {
//     textShadowColor: "rgba(0, 0, 0, 0.25)",
//     textShadowOffset: { width: 0, height: 4 },
//     textShadowRadius: 4,
//   },
// });

export default PostsScreen;