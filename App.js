import React from "react";
import "react-native-gesture-handler";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomNavigator } from "@react-navigation/bottom-tabs";
import LoginScreen from "./screens/login";
import MainScreen from "./screens/main";

const Stack = createStackNavigator();

export default class App extends React.Component {
  state = { boardWidth: 0 };

  measureView = (event) => {
    this.setState({ boardWidth: event.nativeEvent.layout.width });
  };

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator headerMode="none">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "Welcome" }}
          />
          <Stack.Screen
            name="Main"
            component={MainScreen}
            options={{ title: "Main Screen" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    flex: 1,
  },
});

/*
<View
          onLayout={(event) => this.measureView(event)}
          style={styles.container}
        >
          <Goban boardWidth={this.state.boardWidth} boardSize={[9, 9]} />
        </View>
*/
