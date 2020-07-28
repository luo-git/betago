import { AsyncStorage } from "react-native";

const storeEmoteOption = async (value) => {
  try {
    await AsyncStorage.setItem("enableEmote", value);
  } catch (e) {
    console.log(e);
  }
};

const getEmoteOption = async () => {
  try {
    const value = await AsyncStorage.getItem("enableEmote");
    if (value === null) {
      return true;
    }
    return value;
  } catch (e) {
    console.log(e);
  }
};

const removeOption = async (option) => {
  try {
    await AsyncStorage.removeItem(option);
  } catch (e) {
    console.log(e);
  }
  console.log("Removed option.");
};

export { storeEmoteOption, getEmoteOption, removeOption };
