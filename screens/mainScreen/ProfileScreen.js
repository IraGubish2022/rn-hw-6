//import React from "react";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import sha256 from "crypto-js/sha256";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Feather";
import { useDispatch } from "react-redux";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db, storage } from "../../firebase/config";
import { ref, uploadBytes, getDownloadURL } from "@firebase/storage";
import { authSignOutUser } from "../../redux/auth/authOperations";
import * as ImagePicker from "expo-image-picker";
import { authSlice } from "../../redux/auth/authReducer";

const ProfileScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [userPosts, setUserPosts] = useState(null);
  const [commentsCount, setCommentsCount] = useState(0);

  const { updateUserProfile } = authSlice.actions;
  const { login, userId, photo, email } = useSelector((state) => state.auth);

  const clearPhoto = () => {
    dispatch(updateUserProfile({ photo: null, login, userId, email }));
  };

  useEffect(() => {
    if (route.params?.commentsCount) {
      setCommentsCount((prev) => ({
        ...prev,
        [route.params.postID]: route.params.commentsCount,
      }));
    }
  }, [route.params]);

  const getCommentsCount = async (postID) => {
    try {
      const commentsRef = collection(db, `posts/${postID}/comments`);
      const queryRef = query(commentsRef);
      const unsubscribe = onSnapshot(queryRef, (querySnapshot) => {
        const commentsCount = querySnapshot.docs.length;
        setCommentsCount((prev) => ({ ...prev, [postID]: commentsCount }));
        console.log("PostID", postID);
      });
      return () => unsubscribe();
    } catch (error) {
      console.log(error);
      setCommentsCount((prev) => ({ ...prev, [postID]: 0 }));
    }
  };

  const getUserPosts = async () => {
    try {
      const userPostsRef = collection(db, "posts");
      const queryRef = query(userPostsRef, where("userId", "==", userId));
      const unsubscribe = onSnapshot(queryRef, (querySnapshot) => {
        const userPosts = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setUserPosts(userPosts);

        if (userPosts && userPosts.length > 0) {
          userPosts.forEach((post) => {
            getCommentsCount(post.id.toString());
          });
        }
      });
      return () => unsubscribe();
    } catch (error) {
      console.log(error);
    }
  };

  const hashImageContents = async (imageBlob) => {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
      fileReader.onerror = () => {
        fileReader.abort();
        reject(new Error("Failed to hash image contents."));
      };
      fileReader.onload = () => {
        const hash = sha256(CryptoJS.lib.WordArray.create(fileReader.result));
        resolve(hash.toString());
      };
      fileReader.readAsDataURL(imageBlob);
    });
  };

  const uploadAvatar = async () => {
    if (photo) {
      try {
        setLoading(true);

        // Compute the hash of the image contents
        const response = await fetch(photo);
        const file = await response.blob();
        const imageHash = await hashImageContents(file);

        // Check if there's already an image with the same hash in the database
        const userAvatarRef = collection(db, "profilePictures");
        const q = query(userAvatarRef, where("imageHash", "==", imageHash));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docId = querySnapshot.docs[0].id;
          console.log("docID", docId);
          // An image with the same hash already exists, use its URL instead of uploading
          const downloadURL = querySnapshot.docs[0].data().photo;
          dispatch(
            updateUserProfile({ photo: downloadURL, userId, login, email })
          );
          setLoading(false);
          return;
        }
        const avatarID = Date.now().toString();
        const storageRef = ref(storage, `profilePictures/${avatarID}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        const fullStoragePath = storageRef.fullPath;

        const uniqueId = Date.now().toString();
        await addDoc(userAvatarRef, {
          id: uniqueId,
          photo: downloadURL,
          imageHash,
          fullStoragePath,
          userId,
        });
        // setAvatar(downloadURL);
        dispatch(
          updateUserProfile({ photo: downloadURL, userId, login, email })
        );
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    uploadAvatar();
  }, []);

  const updateAvatar = async () => {
    try {
      setLoading(true);

      // Request permission to access the camera roll
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        alert("Permission to access the camera roll is required!");
        setLoading(false);
        return;
      }

      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const imageUrl = result.assets[0].uri;
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // Upload the new avatar image to the "userAvatar" folder in Firebase Storage
        const avatarID = Date.now().toString();
        const avatarRef = ref(storage, `profilePictures/${avatarID}`);
        await uploadBytes(avatarRef, blob);
        const downloadURL = await getDownloadURL(avatarRef);

        // Update the userAvatar collection in Firestore with the new avatar details
        const userAvatarRef = collection(db, "profilePictures");
        const querySnapshot = await getDocs(query(userAvatarRef));
        if (querySnapshot.docs.length > 0) {
          // Update the existing document
          const docId = querySnapshot.docs[0].id;
          const docRef = doc(userAvatarRef, docId);
          await updateDoc(docRef, { photo: downloadURL });
        } else {
          // Create a new document
          await addDoc(userAvatarRef, { photo: downloadURL });
        }
        console.log(downloadURL);

        // Update the local state and Redux store with the new avatar
        dispatch(
          updateUserProfile({ photo: downloadURL, userId, login, email })
        );
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const signOut = () => {
    dispatch(authSignOutUser());
  };
  useEffect(() => {
    getUserPosts();
    return () => getUserPosts();
  }, []);

  return (
    <ImageBackground
      style={styles.image}
      source={require("../../assets/images/BG.jpg")}
    >
      <View style={styles.wrapper}>
        <TouchableOpacity onPress={signOut}>
          <Feather
            style={styles.logout}
            name="log-out"
            size={24}
            color="#BDBDBD"
          />
        </TouchableOpacity>

        {photo ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: photo }} style={styles.imageUser} />
            <TouchableOpacity onPress={clearPhoto} style={styles.deleteIcon}>
              <Image
                source={require("../../assets/images/cancel.png")}
                style={styles.deleteIcon}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageWrapper}>
            <TouchableOpacity onPress={updateAvatar} style={styles.addIcon}>
              <Image source={require("../../assets/images/add.png")} />
            </TouchableOpacity>
          </View>
        )}
        <View>
          <Text style={styles.name}>{login}</Text>
        </View>
        {userPosts && userPosts.length > 0 && (
          <View style={{ flex: 1 }}>
            <FlatList
              data={userPosts}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={true}
              renderItem={({ item }) => {
                return (
                  <View
                    style={{
                      marginBottom: 30,
                    }}
                  >
                    <Image
                      source={{ uri: item.photo }}
                      style={styles.imagePosts}
                    />
                    <Text style={styles.title}>{item.formValues.title}</Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 11,
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("Comments", {
                              postID: item.id,
                              photo: item.photo,
                            })
                          }
                        >
                          <Icon
                            name="message-circle"
                            size={24}
                            color={
                              commentsCount[item.id] > 0 ? "#FF6C00" : "#BDBDBD"
                            }
                          />
                        </TouchableOpacity>
                        <Text style={styles.commentsCount}>
                          {commentsCount[item.id] || 0}
                        </Text>
                      </View>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("Map", {
                              location: item.location,
                              title: item.formValues.title,
                            })
                          }
                        >
                          <Feather name="map-pin" size={24} color="#BDBDBD" />
                        </TouchableOpacity>
                        <Text style={styles.locationText}>
                          {item.formValues.location}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        )}
      </View>
    </ImageBackground>
  );
};
export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    flex: 1,
    resizeMode: "contain",
    justifyContent: "flex-end",
  },
  wrapper: {
    paddingTop: 32,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    marginTop: 119,
    height: 500,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  imageWrapper: {
    position: "absolute",
    left: "38%",
    top: "-10%",
    width: 120,
    height: 120,
    backgroundColor: "#F6F6F6",
    borderRadius: 16,
  },
  deleteIcon: {
    position: "absolute",
    left: "86%",
    top: "60%",
    width: 35,
    height: 35,
  },
  name: {
    fontSize: 30,
    lineHeight: 35,
    textAlign: "center",
    marginTop: 60,
    color: "#212121",
  },
  logout: {
    marginLeft: "auto",
    width: 24,
    height: 24,
  },
});
