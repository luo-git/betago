import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TextInput,
  Alert,
} from "react-native";
import Animated, {
  Value,
  block,
  event,
  cond,
  eq,
  set,
  Clock,
  startClock,
  stopClock,
  debug,
  timing,
  clockRunning,
  Easing,
  interpolate,
  Extrapolate,
  concat,
} from "react-native-reanimated";
import { TapGestureHandler, State } from "react-native-gesture-handler";
import * as Google from "expo-google-app-auth";
import firebase from "firebase";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

class LoginScreen extends Component {
  constructor() {
    super();

    this.state = { email: "", password: "" };

    // Initial button opacity of 1
    this.buttonOpacity = new Value(1);

    // Fade out initial buttons
    this.onStateChange = event([
      {
        nativeEvent: ({ state }) =>
          block([
            cond(
              eq(state, State.END),
              set(this.buttonOpacity, runTiming(new Clock(), 1, 0))
            ),
          ]),
      },
    ]);

    // Fade in initial buttons
    this.onCloseState = event([
      {
        nativeEvent: ({ state }) =>
          block([
            cond(
              eq(state, State.END),
              set(this.buttonOpacity, runTiming(new Clock(), 0, 1))
            ),
          ]),
      },
    ]);

    // Login with Google
    this.onLoginGoogle = ({ nativeEvent }) => {
      if (nativeEvent.state == State.END) {
        this.signInWithGoogleAsync();
      }
    };

    this.onSignUpEmail = ({ nativeEvent }) => {
      if (nativeEvent.state == State.END) {
        if (this.state.password.length < 8) {
          alert("Password must be at least 8 characters!");
          return;
        }

        firebase
          .auth()
          .createUserWithEmailAndPassword(this.state.email, this.state.password)
          .then((result) => {
            console.log("Signed up with id " + result.user.uid);
            firebase
              .database()
              .ref("/users/" + result.user.uid)
              .set({
                mail: this.state.email,
                profile_picture: "../assets/profilePicture.png", // TODO: Serve a default profile picture
                locale: "en",
                nickname: this.state.email,
                created_at: Date.now(),
                last_logged_in: Date.now(),
              });
          })
          .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
            console.log(error, errorCode);
          });
      }
    };

    this.onSignInEmail = ({ nativeEvent }) => {
      if (nativeEvent.state == State.END) {
        firebase
          .auth()
          .signInWithEmailAndPassword(this.state.email, this.state.password)
          .then((result) => {
            firebase
              .database()
              .ref("/users/" + result.user.uid)
              .update({ last_logged_in: Date.now() });
          })
          .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
            alert(errorCode, error);
          });
      }
    };

    // Animations
    this.buttonY = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [100, 0],
      extrapolate: Extrapolate.CLAMP,
    });

    this.bgY = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [-screenHeight / 3, 0],
      extrapolate: Extrapolate.CLAMP,
    });

    this.textInputZIndex = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [1, -1],
      extrapolate: Extrapolate.CLAMP,
    });

    this.textInputY = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [0, 100],
      extrapolate: Extrapolate.CLAMP,
    });

    this.textInputOpacity = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [1, 0],
      extrapolate: Extrapolate.CLAMP,
    });

    this.rotateCross = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [180, 360],
      extrapolate: Extrapolate.CLAMP,
    });
  }

  signInWithGoogleAsync = async () => {
    try {
      const result = await Google.logInAsync({
        androidClientId:
          "263841662833-uubvonl7o7g3srl0muitg6nfk3b6a3ur.apps.googleusercontent.com",
        scopes: ["profile", "email"],
      });

      if (result.type === "success") {
        this.onSignIn(result);
        return result.accessToken;
      } else {
        return { cancelled: true };
      }
    } catch (e) {
      return { error: true };
    }
  };

  onSignIn = (googleUser) => {
    console.log("Google Auth Response", googleUser);
    // We need to register an Observer on Firebase Auth to make sure auth is initialized.
    var unsubscribe = firebase.auth().onAuthStateChanged(
      function (firebaseUser) {
        unsubscribe();
        // Check if we are already signed-in Firebase with the correct user.
        if (!this.isUserEqual(googleUser, firebaseUser)) {
          // Build Firebase credential with the Google ID token.
          var credential = firebase.auth.GoogleAuthProvider.credential(
            googleUser.idToken,
            googleUser.accessToken
          );
          // Sign in with credential from the Google user.
          firebase
            .auth()
            .signInWithCredential(credential)
            .then(function (result) {
              console.log("user signed in");
              if (result.additionalUserInfo.isNewUser) {
                firebase
                  .database()
                  .ref("/users/" + result.user.uid)
                  .set({
                    mail: result.user.email,
                    profile_picture: result.additionalUserInfo.profile.picture,
                    locale: result.additionalUserInfo.profile.locale,
                    nickname:
                      result.additionalUserInfo.profile.given_name +
                      result.additionalUserInfo.profile.family_name,
                    created_at: Date.now(),
                    last_logged_in: Date.now(),
                  });
              } else {
                firebase
                  .database()
                  .ref("/users/" + result.user.uid)
                  .update({ last_logged_in: Date.now() });
              }
            })
            .catch(function (error) {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              // The email of the user's account used.
              var email = error.email;
              // The firebase.auth.AuthCredential type that was used.
              var credential = error.credential;
              // ...
            });
        } else {
          console.log("User already signed-in Firebase.");
        }
      }.bind(this)
    );
  };

  isUserEqual = (googleUser, firebaseUser) => {
    if (firebaseUser) {
      var providerData = firebaseUser.providerData;
      for (var i = 0; i < providerData.length; i++) {
        if (
          providerData[i].providerId ===
            firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
          providerData[i].uid === googleUser.getBasicProfile().getId()
        ) {
          // We don't need to reauth the Firebase connection.
          return true;
        }
      }
    }
    return false;
  };

  render() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          justifyContent: "flex-end",
        }}
      >
        <Animated.View
          style={{
            ...StyleSheet.absoluteFill,
            transform: [{ translateY: this.bgY }],
          }}
        >
          <Image
            source={require("../assets/background/bg.jpg")}
            style={{ flex: 1, height: null, width: null }}
          />
        </Animated.View>
        <Text
          style={{
            fontSize: 80,
            fontWeight: "bold",
            fontFamily: "serif",
            position: "absolute",
            top: screenHeight / 6,
            alignSelf: "center",
          }}
        >
          BetaGo
        </Text>
        <View
          style={{
            height: screenHeight / 3,
            justifyContent: "center",
          }}
        >
          <TapGestureHandler onHandlerStateChange={this.onStateChange}>
            <Animated.View
              style={{
                ...styles.button,
                opacity: this.buttonOpacity,
                transform: [{ translateY: this.buttonY }],
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                SIGN IN WITH EMAIL
              </Text>
            </Animated.View>
          </TapGestureHandler>

          <TapGestureHandler onHandlerStateChange={this.onLoginGoogle}>
            <Animated.View
              style={{
                ...styles.button,
                backgroundColor: "#4285F4",
                opacity: this.buttonOpacity,
                transform: [{ translateY: this.buttonY }],
              }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "white" }}
              >
                SIGN IN WITH GOOGLE
              </Text>
            </Animated.View>
          </TapGestureHandler>
          <Animated.View
            style={{
              zIndex: this.textInputZIndex,
              opacity: this.textInputOpacity,
              transform: [{ translateY: this.textInputY }],
              height: screenHeight / 3,
              ...StyleSheet.absoluteFill,
              top: null,
              justifyContent: "center",
            }}
          >
            <TapGestureHandler onHandlerStateChange={this.onCloseState}>
              <Animated.View style={styles.closeButton}>
                <Animated.Text
                  style={{
                    fontSize: 15,
                    transform: [{ rotate: concat(this.rotateCross, "deg") }],
                  }}
                >
                  X
                </Animated.Text>
              </Animated.View>
            </TapGestureHandler>
            <TextInput
              placeholder="EMAIL"
              style={styles.textInput}
              placeholderTextColor="grey"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={(email) => this.setState({ email })}
            />
            <TextInput
              placeholder="PASSWORD"
              style={styles.textInput}
              placeholderTextColor="grey"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={true}
              onChangeText={(password) => this.setState({ password })}
            />
            <View
              style={{
                marginTop: 20,
                flexDirection: "row",
                justifyContent: "space-evenly",
              }}
            >
              <TapGestureHandler onHandlerStateChange={this.onSignInEmail}>
                <Animated.View style={styles.buttonSmall}>
                  <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                    SIGN IN
                  </Text>
                </Animated.View>
              </TapGestureHandler>
              <TapGestureHandler onHandlerStateChange={this.onSignUpEmail}>
                <Animated.View style={styles.buttonSmall}>
                  <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                    SIGN UP
                  </Text>
                </Animated.View>
              </TapGestureHandler>
            </View>
          </Animated.View>
        </View>
      </View>
    );
  }
}

// Run timing function provided by react native reanimated library
function runTiming(clock, value, dest) {
  const state = {
    finished: new Value(0),
    position: new Value(0),
    time: new Value(0),
    frameTime: new Value(0),
  };

  const config = {
    duration: 600,
    toValue: new Value(0),
    easing: Easing.inOut(Easing.ease),
  };

  return block([
    cond(
      clockRunning(clock),
      [
        // if the clock is already running we update the toValue, in case a new dest has been passed in
        set(config.toValue, dest),
      ],
      [
        // if the clock isn't running we reset all the animation params and start the clock
        set(state.finished, 0),
        set(state.time, 0),
        set(state.position, value),
        set(state.frameTime, 0),
        set(config.toValue, dest),
        startClock(clock),
      ]
    ),
    // we run the step here that is going to update position
    timing(clock, state, config),
    // if the animation is over we stop the clock
    cond(state.finished, debug("stop clock", stopClock(clock))),
    // we made the block return the updated position
    state.position,
  ]);
}

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "white",
    height: 70,
    marginHorizontal: 20,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 5,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: "black",
    shadowOpacity: 0.2,
    elevation: 3,
  },
  buttonSmall: {
    backgroundColor: "white",
    height: 60,
    width: screenWidth / 3,
    marginHorizontal: 20,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 5,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: "black",
    shadowOpacity: 0.2,
    elevation: 3,
  },
  closeButton: {
    height: 40,
    width: 40,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: -20,
    left: screenWidth / 2 - 20,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: "black",
    shadowOpacity: 0.2,
    elevation: 3,
  },
  textInput: {
    height: 50,
    borderRadius: 25,
    borderWidth: 0.5,
    marginHorizontal: 20,
    paddingLeft: 10,
    marginVertical: 5,
    borderColor: "rgba(0,0,0,0.2)",
  },
});
