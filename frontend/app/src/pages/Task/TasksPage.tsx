import React, { useState, useEffect, useRef } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  ButtonBase,
  Card,
  CardActions,
  CardContent,
  LinearProgress,
  Typography,
} from "@material-ui/core";
import hotTeaImage from "../../assets/img/hot_tea_b.png";
import { useHistory } from "react-router-dom";
import TopBar from "../Common/components/TopBar";
import LoadingPage from "../Common/LoadingPage";
import { Task } from "../../plugins/Schemas";
import DataController from "../../plugins/DataController";
import { useSnackbar } from "notistack";
import { DateUtil, setTitle } from "../../plugins/Utils";
import { createdAtDescFn } from "../Annotation/AnnotationUtils";

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
  title: {
    margin: "1rem",
    marginBottom: 0,
  },
  content: {
    width: "90vw",
    margin: "0 auto",
  },
  cardList: {
    display: "flex",
    flexWrap: "wrap",
    // justifyContent: "center",
  },
  cardButton: {
    display: "block",
    height: "100%",
    width: "100%",
  },
  card: {
    margin: "1rem",
    width: "350px",
    height: "200px",
    borderRadius: "12px",
  },
  cardContent: {
    padding: "25px",
    height: "100%",
    textAlign: "left",
  },
  taskId: {
    fontSize: "1rem",
  },
  cardDescription: {
    marginTop: "1rem",
  },
}));

const TasksPage: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const [tasks, setTasks] = useState<Task[]>([]);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setTitle("タスク一覧");
  });

  useEffect(() => {
    const f = async (): Promise<void> => {
      setLoading(true);
      const tasks = await DataController.getTasksAll();
      tasks.sort(createdAtDescFn);
      setTasks(tasks);
      console.log(tasks);
      setLoading(false);
    };
    f();
  }, []);

  const goTaskDetailPage = (taskId: string): (() => void) => (): void => {
    history.push(`/task/${taskId}`);
  };

  const TaskList: React.FC<{ tasks: Task[] }> = () => (
    <div className={classes.cardList}>
      {tasks.map((task) => (
        <Card className={classes.card} key={task.id}>
          <ButtonBase
            className={classes.cardButton}
            onClick={goTaskDetailPage(task.id)}
          >
            <CardContent className={classes.cardContent}>
              <Typography variant="h5" component="h2">
                {task.title}
              </Typography>
              <Typography color="textSecondary" className={classes.taskId}>
                {task.id}
              </Typography>

              <Typography
                color="textSecondary"
                className={classes.cardDescription}
              >
                形式: {task.annotation_type}, 作成日:{" "}
                {DateUtil.parseDateWithAgo(task.created_at.toDate())}
              </Typography>
            </CardContent>
          </ButtonBase>
        </Card>
      ))}
    </div>
  );

  return (
    <div className={classes.root}>
      <CssBaseline />
      <TopBar />
      <div className={classes.content}>
        <Typography variant="h6" className={classes.title}>
          タスク一覧
        </Typography>
        {loading ? (
          <LoadingPage description="タスクを読み込み中..." />
        ) : (
          <TaskList tasks={tasks} />
        )}
      </div>
    </div>
  );
};

export default TasksPage;
