import React, { useState, useEffect, useRef } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from "@material-ui/core/styles";
import { Card, LinearProgress, Typography } from "@material-ui/core";
import hotTeaImage from "../../assets/img/hot_tea_b.png";
import { useHistory, Link } from "react-router-dom";
import { setTitle } from "../../plugins/Utils";

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

const AnnotationThanksPage: React.FC = () => {
  const classes = useStyles();
  const [remainSec, setRemainSec] = useState(5);
  const refRemainSec = useRef(remainSec);
  const history = useHistory();

  useEffect(() => {
    setTitle("アノテーション完了");
  });

  useEffect(() => {
    refRemainSec.current = remainSec;
  }, [remainSec]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log(refRemainSec.current);
      if (refRemainSec.current <= 0) {
        try {
          clearInterval(interval);
        } finally {
          history.push("/home");
        }
      }
      setRemainSec(refRemainSec.current - 1);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <div className={classes.content}>
        <Typography variant={"h3"} align={"center"}>
          Thank you!
        </Typography>
        <img src={hotTeaImage} className={classes.mainImage} />
        <Typography align={"center"} className={classes.description}>
          アノテーションが完了しました。お疲れさまでした！
          <br />
          {remainSec}秒後に<Link to={"/home"}>ホーム画面</Link>へ戻ります...
        </Typography>
      </div>
    </div>
  );
};

export default AnnotationThanksPage;
