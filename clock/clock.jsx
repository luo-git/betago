import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

const formatTime = (time) => {
  const min = Math.floor(time / 60);
  const sec = time - min * 60;
  return { min, sec };
};

export default function GoClock() {
  const [remainingSecs, setRemainingSecs] = useState(0);
  const [isActive, setIsActivie] = useState(false);
  const { min, sec } = formatTime(remainingSecs);

  return <View></View>;
}
