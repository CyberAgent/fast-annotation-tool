import React, { useState, useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { useAuthState } from "react-firebase-hooks/auth";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconMenu from "./IconMenu";
import { Button } from "@material-ui/core";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  title: {
    textTransform: "none",
    color: "white",
  },
}));

const TopBar: React.FC<{ hideShadow?: boolean }> = ({ hideShadow }) => {
  const classes = useStyles();
  const extStyle = hideShadow ? { boxShadow: "none" } : null;
  const history = useHistory();

  return (
    <AppBar position="static" style={extStyle}>
      <Toolbar>
        <Button
          className={classes.title}
          onClick={(): void => {
            history.push("/home");
          }}
        >
          <Typography variant="h6">FAST</Typography>
        </Button>
        <div style={{ flex: 1 }} />
        <IconMenu />
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
