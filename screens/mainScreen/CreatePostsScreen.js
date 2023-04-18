import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  TextInput,
  Platform,
  Button,
} from "react-native";
import { Camera } from "expo-camera";
import * as Location from "expo-location";
import { FontAwesome } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";

const CreatePostsScreen = ({ navigation }) => {
  const [camera, setCamera] = useState(null);
  const [photo, setPhoto] = useState("");
  const [location, setLocation] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [formValues, setFormValues] = useState({ title: "", location: "" });
  const [isFormValid, setIsFormValid] = useState(false);
  console.log(isFormValid);
  const [isFocus, setIsFocus] = useState({
    title: false,
    location: false,
  });

  const handleCameraReady = () => {
    setIsCameraReady(true);
  };

  const takePhoto = async () => {
    if (camera && isCameraReady) {
      try {
        const photo = await camera.takePictureAsync();
        console.log("photo", photo.uri);
        const location = await Location.getCurrentPositionAsync({});
        console.log("latitude", location.coords.latitude);
        console.log("longitude", location.coords.longitude);
        setLocation(location);
        setPhoto(photo.uri);
      } catch (error) {
        console.error("Failed to take photo", error);
      }
    } else {
      console.log("Camera is not ready yet");
    }
  };

  useEffect(() => {
    if (formValues.title && formValues.location) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [formValues]);

  const sendPhoto = () => {
    console.log("navigation", navigation);
    navigation.navigate("DefaultScreen", { photo, title: formValues.title,
      location: formValues.location, });
  };

  useEffect(() => {
    const requestCameraPermission = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== "granted") {
        console.log("Camera permission denied");
      } else {
        console.log("Camera permission granted");
      }
    };

    const requestLocationPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
      } else {
        console.log("Location permission granted");
      }
    };

    if (Platform.OS === "android" && !Constants.isDevice) {
      console.log("Location permission denied because emulator has no GPS");
    } else {
      requestLocationPermission();
    }

    requestCameraPermission();
  }, []);

  return (
    <View style={styles.container}>
      <Camera
        type={type}
        style={styles.camera}
        ref={(ref) => setCamera(ref)}
        onCameraReady={handleCameraReady}
      >
        {photo && (
          <View style={styles.takePhotoContainer}>
            <Image
              source={{ uri: photo }}
              style={{ height: "100%", width: "100%" }}
            />
          </View>
        )}
        <TouchableOpacity style={styles.cameraBtn} onPress={takePhoto}>
          <FontAwesome name="camera" size={24} color="#BDBDBD" />
        </TouchableOpacity>
      </Camera>
      {!photo ? (
        <Text style={styles.text}>Загрузите фото</Text>
      ) : (
        <Text style={styles.text}>Редактировать фото</Text>
      )}
      <View>
        <TextInput
          style={styles.input}
          placeholder="Название..."
          value={formValues.title}
          onChangeText={(value) =>
            setFormValues({ ...formValues, title: value })
          }
        />
        <View style={styles.inputMapWrapper}>
          <Feather
            name="map-pin"
            size={18}
            color="#BDBDBD"
            style={styles.mapIcon}
          />
          <TextInput
            style={styles.inputMap}
            placeholder="Местность..."
            value={formValues.location}
            onChangeText={(value) =>
              setFormValues({ ...formValues, location: value })
            }
          />
        </View>
        <TouchableOpacity
          style={[styles.button, !isFormValid && styles.disabledButton]}
          onPress={() => {
            if (isFormValid) {
              sendPhoto();
            }
          }}
        >
          <Text
            style={{
              ...styles.textButton,
              color: isFormValid ? "#FFFFFF" : "#BDBDBD",
            }}
          >
            Опубликовать
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default CreatePostsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  camera: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
    height: 240,
    backgroundColor: "#F6F6F6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    overflow: "hidden",
  },
  cameraBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: "50%",
  },
  takePhotoContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  text: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 19,
    color: "#BDBDBD",
  },
  input: {
    marginTop: 32,
    fontSize: 16,
    lineHeight: 19,
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  button: {
    backgroundColor: "#FF6C00",
    borderRadius: 100,
    height: 51,
    marginTop: 32,
    marginBottom: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#F6F6F6",
  },
  textButton: {
    color: "#FFFFFF",
    fontFamily: "Roboto-Regular",
    fontSize: 16,
    lineHeight: 19,
  },
  inputMapWrapper: {
    position: "relative",
  },
  mapIcon: {
    position: "absolute",
    top: 24,
  },
  inputMap: {
    marginTop: 10,
    paddingLeft: 20,
    fontSize: 16,
    lineHeight: 19,
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
});