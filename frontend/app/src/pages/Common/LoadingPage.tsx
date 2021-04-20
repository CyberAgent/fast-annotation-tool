import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from "@material-ui/core/styles";
import { LinearProgress, Typography } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    flexDirection: "column",
  },
  description: {
    textAlign: "center",
    margin: "1rem",
  },
}));

const LoadingPage: React.FC<{
  description?: string;
}> = ({ description }) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <CssBaseline />
      <LinearProgress />
      {description && (
        <Typography variant={"subtitle2"} className={classes.description}>
          {description}
        </Typography>
      )}
    </div>
  );
};

export default LoadingPage;
