import React, { useState, useEffect } from "react";
import firebase from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { User } from "./Schemas";
import DataController from "./DataController";

export default function useDBUserStatus(): [
  User,
  boolean,
  firebase.auth.Error
] {
  const [user, loading, error] = useAuthState(firebase.auth());
  const [dbUser, setDBUser] = useState<User>(null);
  const [dbLoading, setDBLoading] = useState<boolean>(true);

  console.log("useDBUserStatus", user, loading);

  useEffect(() => {
    const f = async (): Promise<void> => {
      console.log("loading:", loading);
      if (!loading) {
        if (user) {
          await setDBLoading(true);
          const _dbUser = await DataController.getUserById(user.uid);
          setDBUser(_dbUser);
          setDBLoading(false);
        } else {
          setDBLoading(false);
        }
      }
    };
    f();
  }, [user, loading]);
  return [dbUser, dbLoading, error];
}
