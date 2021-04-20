import React, {
  useRef,
  useContext,
  useImperativeHandle,
  forwardRef,
} from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Card } from "@material-ui/core";
import {
  CardAnnotationData,
  CardChoice,
  UserAnnotationSet,
} from "../../../plugins/Schemas";
import TinderCard from "react-tinder-card";
import ReplyIcon from "@material-ui/icons/Reply";
import CloseIcon from "@material-ui/icons/Close";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import {
  RoundButton,
  RoundButtonWithDesc,
} from "../../Common/components/RoundButton";
import {
  AnswerAreaHandler,
  annotationFnContext,
  userAnnotationInfoContext,
} from "../AnnotationContext";

import { userAnnotSetCompareDescFn } from "../AnnotationUtils";
import { useSnackbar } from "notistack";

const limitRenderCard = 10;

type Direction = "left" | "right" | "up" | "down";
const DirectionResult: { [key in Direction]: CardChoice } = {
  left: "No",
  right: "Yes",
  up: "Ambiguous",
  down: "Ambiguous",
};

const useStyles = makeStyles(() => ({
  question: {
    fontSize: "1.5rem",
    textAlign: "center",
    margin: "30px 10px",
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
  cardArea: {
    position: "relative",
    zIndex: 10,
    flex: 1,
    height: "50vh",
    width: "80vw",
    "& > div": {
      position: "absolute",
      height: "100%",
      width: "100%",
      left: "10vw",
    },
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    height: "100%",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  annotation: {
    fontSize: "1.2rem",
    textAlign: "center",
    margin: "1.5rem",
    MozUserSelect: "none",
    WebkitUserSelect: "none",
    msUserSelect: "none",
  },
  bottomArea: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    margin: "10px",
    MozUserSelect: "none",
    WebkitUserSelect: "none",
    msUserSelect: "none",
  },
}));

let prevQuestion = "";
let prevBaseline = "";

const CardAnnotation = forwardRef<AnswerAreaHandler>((_, ref) => {
  // NOTE: https://qiita.com/otanu/items/994fdf9d8fb7327d41d5
  const classes = useStyles();
  const { goBack, answer, answerCurrent } = useContext(annotationFnContext);
  const {
    currentOrderIndex,
    userAnnotationSets,
    task,
    currentUserAnnotationSet,
    postLog,
  } = useContext(userAnnotationInfoContext);
  const { enqueueSnackbar } = useSnackbar();
  const refBackButton = useRef<HTMLButtonElement>(null);
  const refNoButton = useRef<HTMLButtonElement>(null);
  const refAmbiguousButton = useRef<HTMLButtonElement>(null);
  const refYesButton = useRef<HTMLButtonElement>(null);
  const currentAnnotationData: CardAnnotationData =
    currentUserAnnotationSet.annotation.data;
  const preventSwipe: Direction[] = currentAnnotationData.show_ambiguous_button
    ? []
    : ["up", "down"];

  const trimAnnotationText = (text: string): string => {
    // 長すぎるテキストを切り取る
    if (text.length < 160) {
      return text;
    }
    try {
      const [bstart, bend] = [
        text.match("<b>").index,
        text.match("</b>").index + "<\b>".length,
      ];
      return text.slice(Math.max(bstart - 50, 0), bend + 100);
    } catch {
      console.log("error trim ", text);
      return text;
    }
  };

  const onSwipe = (
    userAnnotationSet: UserAnnotationSet,
    nextUserAnnotationSet: UserAnnotationSet
  ) => async (direction: Direction): Promise<void> => {
    const result = DirectionResult[direction];

    if (!currentAnnotationData.show_ambiguous_button && result == "Ambiguous") {
      postLog("invalid_submit", { by: "swipe", direction: direction });
      enqueueSnackbar(
        "不正なスワイプです。スワイプは右か左のみにしてください",
        {
          variant: "warning",
        }
      );
      return;
    }

    postLog("submit", { by: "swipe" });
    answer(
      userAnnotationSet,
      nextUserAnnotationSet
    )(DirectionResult[direction]);
  };

  useImperativeHandle(ref, () => ({
    onKeyPress: (e: KeyboardEvent): void => {
      console.log(e.code);
      postLog("submit", { by: "keyboard" });
      switch (e.code) {
        case "ArrowLeft":
          answerCurrent("No")();
          break;
        case "ArrowUp":
        case "ArrowDown":
          if (currentAnnotationData.show_ambiguous_button) {
            answerCurrent("Ambiguous")();
          }
          break;
        case "ArrowRight":
          answerCurrent("Yes")();
          break;
        default:
          console.log("Out KeyCode ", e.code);
      }
    },
  }));

  const answerByButton = (choice: CardChoice) => (): void => {
    answerCurrent(choice)();
    postLog("submit", { by: "button" });
  };

  // 全て出すとイベント検出でむちゃくちゃ重たくなるためフィルタリング
  const diplayUserAnnotationSets = userAnnotationSets
    .filter(
      (userAnnotSet) =>
        userAnnotSet.userAnnotation.order_index >= currentOrderIndex &&
        userAnnotSet.userAnnotation.order_index <
          currentOrderIndex + limitRenderCard
    )
    .sort(userAnnotSetCompareDescFn);
  console.log("diplayUserAnnotationSets ", diplayUserAnnotationSets);
  console.log("currentUserAnnotationSet ", currentUserAnnotationSet);

  let questionMargin = "30px 10px";
  let cardHeight = "50vh";
  if (currentAnnotationData.baseline_text) {
    cardHeight = "40vh";
    questionMargin = "20px 10px";
  }

  const questionOverwrite = currentAnnotationData.question_overwrite;
  if (questionOverwrite) {
    if (prevQuestion && prevQuestion != questionOverwrite) {
      enqueueSnackbar(
        `質問が「${currentAnnotationData.cand_entity}」に切り替わりました`,
        {
          variant: "info",
          anchorOrigin: { vertical: "top", horizontal: "center" },
        }
      );
    }
    prevQuestion = questionOverwrite;
  }

  if (
    currentAnnotationData.baseline_text &&
    prevBaseline &&
    prevBaseline != currentAnnotationData.baseline_text
  ) {
    enqueueSnackbar(
      `ベースラインが「${currentAnnotationData.baseline_text}」に切り替わりました`,
      {
        variant: "info",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      }
    );
  }
  prevBaseline = currentAnnotationData.baseline_text;

  return (
    <React.Fragment>
      <div
        className={classes.question}
        style={{ margin: questionMargin }}
        dangerouslySetInnerHTML={{
          __html: currentAnnotationData.question_overwrite
            ? currentAnnotationData.question_overwrite
            : task.question,
        }}
      ></div>
      {/* NOTE: Baseline Card Area */}
      {currentAnnotationData.baseline_text && (
        <div>
          <Card className={classes.baselineCard} variant="outlined">
            <div
              className={classes.baselineText}
              dangerouslySetInnerHTML={{
                __html: trimAnnotationText(currentAnnotationData.baseline_text),
              }}
            ></div>
          </Card>
        </div>
      )}
      {/* NOTE: Card Area */}
      <div className={classes.cardArea} style={{ height: cardHeight }}>
        {diplayUserAnnotationSets.map((userAnnotSet, i) => (
          <TinderCard
            key={`${currentOrderIndex}-${userAnnotSet.userAnnotation.id}`}
            onSwipe={onSwipe(userAnnotSet, diplayUserAnnotationSets[i - 1])}
            preventSwipe={preventSwipe}
          >
            <Card className={classes.card} variant="outlined">
              <div
                className={classes.annotation}
                dangerouslySetInnerHTML={{
                  __html: trimAnnotationText(userAnnotSet.annotation.data.text),
                }}
              ></div>
            </Card>
          </TinderCard>
        ))}
      </div>
      {/* NOTE: Bottom Buttons */}
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
        <RoundButtonWithDesc
          size={55}
          icon={
            <CloseIcon
              htmlColor="#EB5757"
              fontSize="large"
              style={{ fontSize: "2rem" }}
            />
          }
          description={currentAnnotationData.no_button_label ?? "いいえ"}
          onClick={answerByButton("No")}
          buttonRef={refNoButton}
          buttonKey={"noButton"}
        />
        {currentAnnotationData.show_ambiguous_button && (
          <RoundButtonWithDesc
            size={55}
            icon={<div style={{ fontSize: "2rem", color: "#2D9CDB" }}>?</div>}
            description={
              <div>
                部分的にそう
                <br />
                わからない
              </div>
            }
            onClick={answerByButton("Ambiguous")}
            buttonRef={refAmbiguousButton}
            buttonKey={"ambiguousButton"}
          />
        )}
        <RoundButtonWithDesc
          size={55}
          icon={
            <ThumbUpIcon htmlColor="#6FCF97" style={{ fontSize: "2rem" }} />
          }
          description={currentAnnotationData.yes_button_label ?? "はい"}
          onClick={answerByButton("Yes")}
          buttonRef={refYesButton}
          buttonKey={"yesButton"}
        />
        <RoundButton size={40} isDummy={true}>
          <div />
        </RoundButton>
      </div>
    </React.Fragment>
  );
});

export default CardAnnotation;
