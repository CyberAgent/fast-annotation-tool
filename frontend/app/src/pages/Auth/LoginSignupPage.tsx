import React, { useState, useEffect } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { Link as RouterLink } from "react-router-dom";
import { Box, Paper, LinearProgress } from "@material-ui/core";
import { useHistory, useLocation } from "react-router-dom";
import { googleLogin } from "../../plugins/Auth";
import firebase, { analytics } from "../../plugins/firebase";
import querystring from "querystring";
import dataController from "../../plugins/DataController";
import { setTitle } from "../../plugins/Utils";

const useStyles = makeStyles((theme) => ({
  paper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(6),
    width: "80vw",
    maxWidth: "500px",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    // width: "40vw",
    padding: theme.spacing(1),
    textTransform: "none",
  },
  progress: {
    width: "100%",
  },
}));

const LoginSignupPage: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const updateSignUpState = async (): Promise<void> => {
    setLoading(true);
    const res = await firebase.auth().getRedirectResult();
    console.log("getRedirectResult:", res);
    setIsSignUp(Boolean(res.user));
    setLoading(false);
    if (res.user) {
      await dataController.postUserIfNeed(res.user);
    }
  };

  const getNext = (): string => {
    const q = querystring.parse(location.search.replace("?", ""));
    const next = q["next"];
    return next as string;
  };

  const init = async (): Promise<void> => {
    console.log(location);
    await updateSignUpState();
    if (isSignUp) {
      analytics.logEvent("login", {
        method: "google.com",
      });
      const next = getNext();
      if (next) {
        history.push(`/${next}`);
      } else {
        history.push("/home");
      }
    }
  };

  useEffect(() => {
    setTitle("ログイン");
    init();
  }, [isSignUp]);

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justify="center"
      style={{ minHeight: "100vh", minWidth: "100vw" }}
    >
      <CssBaseline />
      <Grid item>
        {loading && <LinearProgress className={classes.progress} />}
        <Paper className={classes.paper}>
          <Typography component="h1" variant="h4">
            FAST
          </Typography>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={googleLogin}
            disabled={loading}
          >
            {loading ? "認証情報を確認中..." : `Google ログイン`}
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default LoginSignupPage;
