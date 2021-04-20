import React, { useState } from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { useHistory } from "react-router-dom";
import { UserTask } from "../../../plugins/Schemas";
import { User } from "firebase";
import HomeIcon from "@material-ui/icons/Home";
import IconMenu from "../../Common/components/IconMenu";

const useStyles = makeStyles((theme) => ({
  title: {
    flexGrow: 1,
    textAlign: "center",
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
}));

const AnnotationTopBar: React.FC<{
  userTask: UserTask;
  orderIndex: number;
}> = ({ userTask, orderIndex }) => {
  const classes = useStyles();
  const history = useHistory();

  const goHome = (): void => {
    history.push("/home");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          className={classes.menuButton}
          color="inherit"
          aria-label="menu"
          onClick={goHome}
        >
          <HomeIcon />
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          {orderIndex | 0} / {userTask.annotation_num | 0}
        </Typography>
        <IconMenu />
      </Toolbar>
    </AppBar>
  );
};

export default AnnotationTopBar;
