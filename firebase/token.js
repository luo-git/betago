import firebase from "./firebase";

export default async function getUserToken() {
  const token = await firebase.auth().currentUser.getIdToken();
  return token;
}
