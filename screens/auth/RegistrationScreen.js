import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
  Image,
  Alert,
} from "react-native";

import { nanoid } from "nanoid";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useDispatch } from "react-redux";
import * as ImagePicker from "expo-image-picker"

import { authSignUpUser } from "../../redux/auth/authOperations";
import { storage } from "../../firebase/config";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";

import {
  loginValidation,
  passwordValidation,
  emailValidation,
} from "../../shared/validation";

SplashScreen.preventAutoHideAsync();

const initialState = {
  login: "",
  email: "",
  password: "",
  imageUri: null,
};

export default function RegistrationScreen({ navigation }) {
  const [photo, setPhoto] = useState(null);
  const [isShowKeyboard, setIsShowKeyboard] = useState(false);
  const [state, setState] = useState(initialState);
  const [fontsLoaded] = useFonts({
    "Roboto-Regular": require("../../assets/fonts/Roboto-Regular.ttf"),
    "Roboto-Medium": require("../../assets/fonts/Roboto-Medium.ttf"),
  });
  const [isFocus, setIsFocus] = useState({
    login: false,
    email: false,
    password: false,
  });
  const dispatch = useDispatch();
  const [isSecureEntry, setIsSecureEntry] = useState(true);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  function submitForm() {
    if (
      loginValidation(state) &&
      passwordValidation(state) &&
      emailValidation(state)
    ) {
      console.log("state in register", state);
      const formData = { ...state };
      dispatch(authSignUpUser(formData));
      setState(initialState);
    } else return;
  }

  const handleAddImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // if (result.assets.length > 0) {
    //   setPhoto(result.assets[0]);
    // }
    if (!result.canceled) {
      try {
        const imageUrl = result.assets[0].uri;
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        // download selected photo
        const avatarID = nanoid();
        const avatarRef = ref(storage, `temp/${avatarID}`);
        await uploadBytes(avatarRef, blob);
        const downloadURL = await getDownloadURL(avatarRef);
        // additional code for setting avatar
        setState((prevState) => ({ ...prevState, userAvatar: downloadURL }));
        Alert.alert("Successfully uploaded");
      } catch (error) {
        console.error(error);
        Alert.alert("Error uploading image");
      }
    }
  };

  const uploadPhotoToServer = async () => {
    try {
      const response = await fetch(photo.uri);
      const file = await response.blob();
      const uniquePostId = Date.now().toString();
      const storageRef = ref(storage, `profilePictures/${uniquePostId}`);
      await uploadBytes(storageRef, file);
      const processedPhoto = await getDownloadURL(storageRef);
      console.log("processedPhoto", processedPhoto);
      return processedPhoto;
    } catch (error) {
      console.log(error.message);
    }
  };
  const clearPhoto = () => {
    setPhoto(null);
  };

  async function handleSubmit() {
    try {
      const processedPhoto = photo ? await uploadPhotoToServer() : null;

      const user = {
        login: state.login,
        email: state.email,
        password: state.password,
        photo: processedPhoto,
      };

      dispatch(authSignUpUser(user));
      setState({
        login: "",
        email: "",
        password: "",
      });
      setPhoto(null);
    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container} onLayout={onLayoutRootView}>
        <ImageBackground
          style={styles.imageBg}
          source={require('../../assets/images/BG.jpg')}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View style={styles.wrapper}>
              <View style={styles.form}>
                <Text style={styles.title}>Регистрация</Text>
                <View>
                  <TextInput
                    style={styles.input}
                    keyboardType="login"
                    placeholder="Логин"
                    value={state.login}
                    onFocus={() => {
                      setIsShowKeyboard(true);
                    }}
                    onChangeText={(value) =>
                      setState((prevState) => ({ ...prevState, login: value }))
                    }
                  />
                </View>
                <View style={{ marginTop: 16 }}>
                  <TextInput
                    style={styles.input}
                    keyboardType="email-address"
                    placeholder="Адрес электронной почты"
                    value={state.email}
                    onFocus={() => {
                      setIsShowKeyboard(true);
                    }}
                    onChangeText={(value) =>
                      setState((prevState) => ({ ...prevState, email: value }))
                    }
                  />
                </View>
                <View style={{ marginTop: 16 }}>
                  <TextInput
                    style={styles.input}
                    secureTextEntry={true}
                    placeholder="Пароль"
                    value={state.password}
                    onFocus={() => {
                      setIsShowKeyboard(true);
                    }}
                    onChangeText={(value) =>
                      setState((prevState) => ({
                        ...prevState,
                        password: value,
                      }))
                    }
                  />
                  <Text style={styles.textPassword}>Показать</Text>
                </View>
                <View style={styles.imageWrapper}>
                  <Image
                    source={require("../../assets/images/add.png")}
                    style={styles.addIcon}
                  />
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
          <View style={styles.registrationWrapper}>
            <View style={styles.registration}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.button}
                onPress={submitForm}
                // onPress={keyboardHide}
              >
                <Text 
                style={styles.textButton}
                onPress={() => navigation.navigate("Home")}
                >Зарегистрироваться</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.textLink}>Уже есть аккаунт? Войти</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  imageBg: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "flex-end",
  },
  wrapper: {
    paddingTop: 32,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  form: {
    paddingTop: 32,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginHorizontal: 16,
    paddingBottom: 32,
  },
  imageWrapper: {
    position: "absolute",
    left: "35%",
    top: "-32%",
    width: 120,
    height: 120,
    backgroundColor: "#F6F6F6",
    borderRadius: 16,
  },
  addIcon: {
    position: "absolute",
    left: "90%",
    top: "65%",
    width: 25,
    height: 25,
  },
  title: {
    textAlign: "center",
    fontFamily: "Roboto-Medium",
    fontSize: 30,
    lineHeight: 35,
    letterSpacing: 0.01,
    color: "#212121",
    marginBottom: 32,
    marginTop: 32,
  },
  input: {
    fontFamily: "Roboto-Regular",
    fontSize: 16,
    lineHeight: 19,
    height: 50,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    backgroundColor: "#F6F6F6",
    borderRadius: 8,
    padding: 16,
    color: "#212121",
  },
  textPassword: {
    position: "absolute",
    top: "35%",
    left: "78%",
    color: "#1B4371",
    fontSize: 16,
    lineHeight: 19,
  },
  button: {
    backgroundColor: "#FF6C00",
    borderRadius: 100,
    height: 51,

    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  textButton: {
    color: "#FFFFFF",
    fontFamily: "Roboto-Regular",
    fontSize: 16,
    lineHeight: 19,
  },
  textLink: {
    fontFamily: "Roboto-Regular",
    fontSize: 16,
    lineHeight: 19,
    textAlign: "center",
    color: "#1B4371",
  },
  registrationWrapper: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 111,
  },
  registration: {
    marginHorizontal: 16,
  },
});