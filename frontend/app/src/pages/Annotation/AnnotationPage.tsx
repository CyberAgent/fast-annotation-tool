import React, { useState, useEffect, useRef, ReactNode } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from "@material-ui/core/styles";
import { useAuthState } from "react-firebase-hooks/auth";
import dataController from "../../plugins/DataController";
import {
  Task,
  UserAnnotation,
  UserTask,
  UserAnnotationSet,
  UserSelect,
  UserAnnotationLog,
  ActionType,
} from "../../plugins/Schemas";
import { useParams, useHistory } from "react-router-dom";
import AnnotationTopBar from "./components/AnnotationTopBar";
import LoadingPage from "../Common/LoadingPage";
import { useSnackbar } from "notistack";
import { setTitle, sleep } from "../../plugins/Utils";
import {
  AnswerAreaHandler,
  userAnnotationInfoContext,
  annotationFnContext,
} from "./AnnotationContext";
import {
  userAnnotSetCompareDescFn,
  userAnnotSetCompareAscFn,
} from "./AnnotationUtils";
import CardAnnotation from "./components/CardAnnotation";
import MultiLabelAnnotation from "./components/MultiLabelAnnotation";
import { getDeviceInfo } from "../../plugins/DeviceInfo";

const diffLimit = 10;

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    flexDirection: "column",
  },
}));

const AnnotationPage: React.FC = () => {
  const classes = useStyles();
  const [task, setTask] = useState<Task>();
  const [userTask, setUserTask] = useState<UserTask>();
  const [loading, setLoading] = useState(true);
  const { userTaskId, userAnnotationId } = useParams();
  const history = useHistory();
  const [userAnnotationSets, setUserAnnotationSets] = useState<
    UserAnnotationSet[]
  >([]);
  const [currentOrderIndex, setCurrentOrderIndex] = useState<number>();
  const { enqueueSnackbar } = useSnackbar();
  const isLatest = userAnnotationId == "latest";
  const answerArea = useRef({} as AnswerAreaHandler);

  const notifyErrorAndGoHome = async (error: string): Promise<void> => {
    enqueueSnackbar(error, {
      variant: "error",
    });
    await sleep(500);
    enqueueSnackbar("ホーム画面に戻ります...", {
      variant: "info",
    });
    await sleep(1000);
    history.push("/home");
  };

  const redirectLatest = async (): Promise<void> => {
    setLoading(true);
    // latest指定の場合, 最新のものを取得しリダイレクトする
    const latestAnnotation = await dataController.getLatestUserAnnotation(
      userTaskId
    );
    console.log("latestAnnotation:", latestAnnotation);
    if (latestAnnotation) {
      history.push(
        `/user_task/${userTaskId}/annotation/${latestAnnotation.id}`
      );
    } else {
      await notifyErrorAndGoHome("タスク情報の取得に失敗しました");
    }
    setLoading(false);
  };

  const getUserAnnotationSetByOrderIndex = (
    orderIndex: number
  ): UserAnnotationSet | null => {
    return userAnnotationSets.filter(
      (annotSet) => annotSet.userAnnotation.order_index == orderIndex
    )[0];
  };

  const setAnnotationLocation = (userAnnotation: UserAnnotation): void => {
    history.push(`/user_task/${userTaskId}/annotation/${userAnnotation.id}`);
  };

  const getOrderIndexes = (userAnnotSets: UserAnnotationSet[]): number[] => {
    return userAnnotSets.map((set) => set.userAnnotation.order_index);
  };

  const getMinMaxOrderIndex = (
    userAnnotSets: UserAnnotationSet[]
  ): [number, number] => {
    const orderIndexes = getOrderIndexes(userAnnotSets);
    const maxIndex = Math.max(...orderIndexes);
    const minIndex = Math.min(...orderIndexes);
    return [minIndex, maxIndex];
  };

  const postLog = (actionType: ActionType, actionData: any): void => {
    actionData = { ...actionData, ...{ deviceInfo: getDeviceInfo() } };
    console.log("postLog", actionType, actionData, userAnnotationId);
    dataController.postUserAnnotationLog(
      userTaskId,
      userAnnotationId,
      actionType,
      actionData
    );
  };

  const fetchAnnotationsIfNeed = async (): Promise<void> => {
    // 必要に応じてアノテーションデータを取得する
    const [minIndex, maxIndex] = getMinMaxOrderIndex(userAnnotationSets);

    console.log(
      `check index ${currentOrderIndex} min:${minIndex}, max:${maxIndex}, 全体:${userTask.annotation_num}`
    );
    if (
      maxIndex - currentOrderIndex < diffLimit &&
      maxIndex != userTask.annotation_num
    ) {
      // 追加のnextを取得し, 降順にして配列先頭に追加
      console.log("fetch next");
      const _sets = await dataController.getUserAnnotationSets(
        userTaskId,
        maxIndex,
        "next",
        10
      );
      setUserAnnotationSets([
        ..._sets.sort(userAnnotSetCompareDescFn),
        ...userAnnotationSets,
      ]);
    }
    if (currentOrderIndex - minIndex < diffLimit && minIndex != 1) {
      // 追加のpreviousを取得し, 降順にして配列末尾に追加
      console.log("fetch previous");
      const _sets = await dataController.getUserAnnotationSets(
        userTaskId,
        minIndex,
        "previous",
        10
      );
      setUserAnnotationSets([
        ...userAnnotationSets,
        ..._sets.sort(userAnnotSetCompareAscFn),
      ]);
    }
  };

  const goBack = (): void => {
    // 1個前のAnnotationに戻る
    const _preOrderIndex = currentOrderIndex - 1;
    const _preUserAnnotationSet = getUserAnnotationSetByOrderIndex(
      _preOrderIndex
    );
    postLog("back", {
      from_order_index: currentOrderIndex,
      to_order_index: _preOrderIndex,
    });
    if (_preUserAnnotationSet) {
      setCurrentOrderIndex(_preOrderIndex);
      setAnnotationLocation(_preUserAnnotationSet.userAnnotation);
    }
    fetchAnnotationsIfNeed();
  };

  const goThanks = (): void => {
    history.push("/annotation-thanks");
  };

  const initUserAnnotationSets = async (): Promise<void> => {
    const _currentUserAnnotationSet = await dataController.getUserAnnotationSetById(
      userAnnotationId
    );
    console.log("current", _currentUserAnnotationSet);
    const _previousAnnotationSets = await dataController.getUserAnnotationSets(
      userTaskId,
      _currentUserAnnotationSet.userAnnotation.order_index,
      "previous",
      10
    );
    console.log("previous", _previousAnnotationSets);
    const _nextAnnotationSets = await dataController.getUserAnnotationSets(
      userTaskId,
      _currentUserAnnotationSet.userAnnotation.order_index,
      "next",
      10
    );
    console.log("next", _nextAnnotationSets);
    setCurrentOrderIndex(_currentUserAnnotationSet.userAnnotation.order_index);

    setUserAnnotationSets(
      [
        ..._previousAnnotationSets,
        _currentUserAnnotationSet,
        ..._nextAnnotationSets,
      ].sort(userAnnotSetCompareDescFn)
    );
  };

  useEffect(() => {
    // ログ用
    // 初回表示（タスク一覧から読み込み or 更新 or リンクから読み込み）の場合は initialize=true でログ
    const logData = currentOrderIndex ? null : { initialize: true };
    postLog("display", logData);
  }, [currentOrderIndex]);

  useEffect(() => {
    const f = async (): Promise<void> => {
      console.log("useEffect", loading, task, userTask);
      if (task && userTask && userAnnotationSets.length > 0) {
        console.log("in useEffect data filled");
        return;
      }

      // latest の場合リダイレクト
      if (isLatest) {
        await redirectLatest();
        return;
      }

      // ユーザタスク & タスクを取得
      setLoading(true);
      try {
        const _userTask = await dataController.getUserTaskById(userTaskId);
        const _task = await dataController.getTaskById(_userTask.task_id);
        setUserTask(_userTask);
        setTask(_task);
        setTitle(_task.title);
        // 前,現在,後のアノテーション群を取得
        await initUserAnnotationSets();
      } catch {
        await notifyErrorAndGoHome("タスク情報の取得に失敗しました");
      }
      setLoading(false);
    };
    f();
  }, [loading]);

  const answer = (
    userAnnotationSet: UserAnnotationSet,
    nextUserAnnotationSet?: UserAnnotationSet
  ) => async (input: UserSelect): Promise<void> => {
    console.log(
      "answer",
      currentOrderIndex,
      input,
      userAnnotationSet,
      "→",
      nextUserAnnotationSet
    );
    if (nextUserAnnotationSet) {
      setCurrentOrderIndex(nextUserAnnotationSet.userAnnotation.order_index);
      setAnnotationLocation(nextUserAnnotationSet.userAnnotation);
    }
    fetchAnnotationsIfNeed();
    // 結果をPost
    const result = {
      result: input,
    };
    await dataController.postAnnotation(
      userTask,
      userAnnotationSet.userAnnotation,
      result
    );
    if (!nextUserAnnotationSet) {
      // サンクス画面へ
      goThanks();
    }
  };

  const answerCurrent = (input: UserSelect) => async (): Promise<void> => {
    const _annots: UserAnnotationSet[] = userAnnotationSets.filter(
      (annotSet) => {
        const _orderIndex = annotSet.userAnnotation.order_index;
        return (
          _orderIndex == currentOrderIndex ||
          _orderIndex == currentOrderIndex + 1
        );
      }
    );
    _annots.sort(userAnnotSetCompareAscFn);
    answer(_annots[0], _annots[1])(input);
  };

  const onKeyPress = (e: KeyboardEvent): void => {
    answerArea.current.onKeyPress && answerArea.current.onKeyPress(e);
  };

  useEffect(() => {
    document.addEventListener("keydown", onKeyPress);
    return (): void => {
      document.removeEventListener("keydown", onKeyPress);
    };
  }, []);

  const renderAnswerArea = (): ReactNode => {
    // アノテーションのタイプを増やすごとにここに追加していく
    const rest = { ref: answerArea };
    switch (task.annotation_type) {
      case "card":
        return <CardAnnotation {...rest} />;
      case "multi_label":
        return <MultiLabelAnnotation {...rest} />;
      default:
        notifyErrorAndGoHome(
          `${task.annotation_type} は対応しないアノテーションタイプです。`
        );
        break;
    }
  };

  if (!loading && task && userTask && userAnnotationSets) {
    console.log("render annotation", currentOrderIndex);
    return (
      <div className={classes.root}>
        <CssBaseline />
        <AnnotationTopBar userTask={userTask} orderIndex={currentOrderIndex} />
        <userAnnotationInfoContext.Provider
          value={{
            currentOrderIndex: currentOrderIndex,
            userAnnotationSets: userAnnotationSets,
            currentUserAnnotationSet: userAnnotationSets.find(
              (userAnnotSet) =>
                userAnnotSet.userAnnotation.order_index == currentOrderIndex
            ),
            task: task,
            postLog: postLog,
          }}
        >
          <annotationFnContext.Provider
            value={{
              answer: answer,
              answerCurrent: answerCurrent,
              goBack: goBack,
            }}
          >
            {renderAnswerArea()}
          </annotationFnContext.Provider>
        </userAnnotationInfoContext.Provider>
      </div>
    );
  } else {
    //   Loading
    return <LoadingPage description={"アノテーションデータを読み込み中..."} />;
  }
};

export default AnnotationPage;
