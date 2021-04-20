import React, { useRef, useContext, forwardRef, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Card, Fab } from "@material-ui/core";
import { MultiLabelAnnotationData } from "../../../plugins/Schemas";
import {
  RoundButton,
  RoundButtonWithDesc,
} from "../../Common/components/RoundButton";
import ReplyIcon from "@material-ui/icons/Reply";
import {
  AnswerAreaHandler,
  annotationFnContext,
  userAnnotationInfoContext,
} from "../AnnotationContext";
import Chip from "@material-ui/core/Chip";

const useStyles = makeStyles((theme) => ({
  root: {},
  question: {
    fontSize: "1.2rem",
    textAlign: "center",
    margin: "30px 20px",
    wordWrap: "break-word",
  },
  baselineCard: {
    width: "80vw",
    maxWidth: "500px",
    margin: "20px auto",
  },
  baselineText: {
    fontSize: "1.2rem",
    textAlign: "center",
    margin: "1.5rem",
    MozUserSelect: "none",
    WebkitUserSelect: "none",
    msUserSelect: "none",
  },
  card: {
    width: "100%",
    // maxWidth: "90vw",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  annotation: {
    fontSize: "1.2rem",
    textAlign: "center",
    margin: "1.5rem",
  },
  tipsAreaWrapper: {
    padding: "1rem",
  },
  tipsArea: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  tip: {
    margin: theme.spacing(0.5),
    boxSizing: "border-box",
    border: "1px solid rgba(0, 0, 0, 0.23)",
    fontSize: "0.9rem",
  },
  bottomArea: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    MozUserSelect: "none",
    WebkitUserSelect: "none",
    msUserSelect: "none",
  },
  nextButton: {
    margin: "10px 20px",
    width: "200px",
  },
}));

const MultiLabelAnnotation = forwardRef<AnswerAreaHandler>((_, ref) => {
  const classes = useStyles();
  const { goBack, answerCurrent } = useContext(annotationFnContext);
  const {
    currentOrderIndex,
    task,
    currentUserAnnotationSet,
    postLog,
  } = useContext(userAnnotationInfoContext);
  const annotData = currentUserAnnotationSet.annotation
    .data as MultiLabelAnnotationData;
  const choices: string[] = annotData.choices;
  const [userChoices, setUserChoices] = useState<string[]>([]);
  const refBackButton = useRef<HTMLButtonElement>(null);

  const onClickTip = (choice: string) => (): void => {
    console.log(choice);
    const alreadyChoiced = userChoices.includes(choice);
    postLog("select", {
      choice: choice,
      action: alreadyChoiced ? "deselect" : "select",
    });
    if (alreadyChoiced) {
      setUserChoices(userChoices.filter((c) => c != choice));
    } else {
      const new_choices = [...userChoices, choice];
      if (
        annotData.max_select_num &&
        annotData.max_select_num < new_choices.length
      ) {
        new_choices.shift();
      }
      setUserChoices(new_choices);
    }
  };

  const onClickNext = async (): Promise<void> => {
    console.log("answer", userChoices);
    postLog("submit", { choices: userChoices });
    answerCurrent(userChoices)();
    setUserChoices([]);
  };

  console.log(userChoices);

  return (
    <div className={classes.root}>
      <div
        className={classes.question}
        dangerouslySetInnerHTML={{ __html: task.question }}
      ></div>
      {/* NOTE: Baseline Card Area */}
      {annotData.baseline_text && (
        <div>
          <Card className={classes.baselineCard} variant="outlined">
            <div
              className={classes.baselineText}
              dangerouslySetInnerHTML={{
                __html: annotData.baseline_text,
              }}
            ></div>
          </Card>
        </div>
      )}
      {/* NOTE: Main Card Area */}
      <Card className={classes.card} variant="outlined">
        <div
          className={classes.annotation}
          dangerouslySetInnerHTML={{
            __html: currentUserAnnotationSet.annotation.data.text,
          }}
        ></div>
      </Card>
      <div className={classes.tipsAreaWrapper}>
        <div className={classes.tipsArea}>
          {choices.map((choice, i) => {
            const isChoiced = userChoices.includes(choice);
            return (
              <Chip
                key={`${i}-${choice}`}
                label={choice}
                variant={isChoiced ? "default" : "outlined"}
                className={classes.tip}
                onClick={onClickTip(choice)}
                color={isChoiced ? "primary" : "default"}
              />
            );
          })}
        </div>
      </div>
      <div className={classes.bottomArea}>
        <RoundButtonWithDesc
          size={40}
          icon={<ReplyIcon htmlColor="gray" />}
          description="一つ前へ"
          onClick={goBack}
          buttonRef={refBackButton}
          buttonKey={"backButton"}
          isDummy={currentOrderIndex == 1}
        />
        <Fab
          onClick={onClickNext}
          className={classes.nextButton}
          key="next"
          variant="extended"
          color="primary"
          disabled={userChoices.length == 0}
        >
          次へ
        </Fab>
        <RoundButton size={40} isDummy={true}>
          <div />
        </RoundButton>
      </div>
    </div>
  );
});

export default MultiLabelAnnotation;
