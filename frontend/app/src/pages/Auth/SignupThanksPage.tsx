import React, { useState, useEffect, useRef } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from "@material-ui/core/styles";
import { Card, LinearProgress, Typography } from "@material-ui/core";
import goodHandImage from "../../assets/img/good_hand.png";

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    height: "100vh",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  mainImage: {
    marginTop: "10px",
    width: "40vw",
    maxWidth: "300px",
    height: "auto",
  },
  description: {
    marginTop: "10px",
  },
}));

const SignupThanksPage: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <div className={classes.content}>
        <Typography variant={"h3"} align={"center"}>
          Thank you!
        </Typography>
        <img src={goodHandImage} className={classes.mainImage} />
        <Typography align={"center"} className={classes.description}>
          ユーザ登録が完了しました。
          <br />
          画面を閉じて管理者の指示をお待ちください。
        </Typography>
      </div>
    </div>
  );
};

export default SignupThanksPage;
