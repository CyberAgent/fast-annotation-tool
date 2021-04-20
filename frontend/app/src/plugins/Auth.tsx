import firebase from "./firebase";

const googleAuthProvider = new firebase.auth.GoogleAuthProvider();

export const googleLogin = async (): Promise<void> => {
  console.log("login");
  try {
    const res = await firebase.auth().signInWithRedirect(googleAuthProvider);
    console.log("res", res);
  } catch (error) {
    console.log("error", error);
  }
};

export const logout = () => {
  firebase.auth().signOut();
};
