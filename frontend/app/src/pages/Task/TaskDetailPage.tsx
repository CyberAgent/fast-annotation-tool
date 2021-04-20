import React, { useState, useEffect, useRef, useMemo } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Card, Fab, Typography } from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";
import TopBar from "../Common/components/TopBar";
import LoadingPage from "../Common/LoadingPage";
import { Task, User, UserTask } from "../../plugins/Schemas";
import DataController from "../../plugins/DataController";
import { useSnackbar } from "notistack";
import { DateUtil, setTitle, sleep } from "../../plugins/Utils";
import Skeleton from "@material-ui/lab/Skeleton";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Modal from "@material-ui/core/Modal";
import ArrowBackIcon from "@material-ui/icons/ArrowBackIos";
import DeleteIcon from "@material-ui/icons/Delete";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import DataGrid, {
  Column,
  SelectColumn,
  DataGridHandle,
  RowsUpdateEvent,
  CalculatedColumn,
} from "react-data-grid";
import "react-data-grid/dist/react-data-grid.css";
import IconMenu from "../Common/components/IconMenu";

const useStyles = makeStyles((thema) => ({
  root: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: thema.palette.primary.dark,
    height: "350px",
  },
  headerContent: {
    padding: thema.spacing(3),
    display: "flex",
  },
  mainTitle: {
    color: "white",
  },
  content: {
    width: "100vw",
    // margin: "20px auto",
  },
  card: {
    margin: "1rem",
    padding: "20px",
  },
  dangerCard: {
    border: "1px solid red",
  },
  cardContent: {
    margin: "20px 0",
  },
  emptyGrid: {
    margin: "20px 0",
  },
  featureCard: {
    margin: "1rem",
    marginTop: "-230px",
    padding: "20px",
  },
  cardGrid: {
    margin: "20px 0",
  },
  featureCardGrid: {
    margin: "20px 0",
  },
  blankCardGrid: {
    height: "200px",
    margin: "20px 0",
  },
  gridHeader: {
    display: "flex",
    "& h6": {
      lineHeight: 2,
    },
    "& button": {
      marginLeft: "10px",
    },
  },
}));

type TaskFeatureRow = { key: string; value: string };
type UnAssignedUserRow = { id: string; username: string; email: string };
type AssignedUserRow = {
  id: string;
  username: string;
  email: string;
  annotationNum: number;
  submittedNum: number;
};

const TaskDetailPage: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const { taskId } = useParams();
  const [task, setTask] = useState<Task>(null);
  const [userTasks, setUserTasks] = useState<UserTask[]>(null);
  const [users, setUsers] = useState<User[]>(null);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUnAssignedUserRows, setSelectedUnAssignedUserRows] = useState(
    () => new Set<string>()
  );
  const [selectedAssignedUserRows, setSelectedAssignedUserRows] = useState(
    () => new Set<string>()
  );
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
  };

  useEffect(() => {
    setTitle("タスク詳細");
  });

  useEffect(() => {
    const f = async (): Promise<void> => {
      setLoading(true);
      const task = await DataController.getTaskById(taskId);
      setTask(task);
      console.log("task", task);
      setLoading(false);

      const userTasks = await DataController.getUserTasksByTaskId(task.id);
      setUserTasks(userTasks);
      const users = await DataController.getUsersAll();
      setUsers(users);
      console.log("user, userTasks", users, userTasks);
    };
    f();
  }, []);

  const SkeltonGrid: React.FC = () => (
    <div style={{ margin: "20px 0" }}>
      <Skeleton variant="rect" height="30px" />
      <Skeleton variant="rect" height="100px" style={{ marginTop: "5px" }} />
    </div>
  );

  const EmptyGrid: React.FC<{ message: string }> = ({
    message,
  }: {
    message: string;
  }) => (
    <div className={classes.emptyGrid}>
      <Typography variant="subtitle1" color="textSecondary" align="center">
        {message}
      </Typography>
    </div>
  );

  const TaskGrid: React.FC = () => {
    if (!task) {
      return <EmptyGrid message="タスクがありません." />;
    }
    const rows: TaskFeatureRow[] = useMemo(
      () => [
        { key: "id", value: task.id },
        { key: "title", value: task.title },
        { key: "annotation_type", value: task.annotation_type },
        { key: "description", value: task.description },
        { key: "question", value: task.question },
        {
          key: "updated_at",
          value: DateUtil.toStringDataTime(task.updated_at.toDate()),
        },
        {
          key: "created_at",
          value: DateUtil.toStringDataTime(task.created_at.toDate()),
        }
      ],
      []
    );
    console.log("renderTask", task);
    return (
      <div className={classes.featureCardGrid}>
        {rows.map((r, i) => {
          const _value =
            r.key == "FireStoreUrl" ? (
              <a target="firestoreurl" href={r.value}>
                {r.value}
              </a>
            ) : (
              r.value
            );
          return (
            <Typography key={i}>
              ・ {r.key}: {_value}
            </Typography>
          );
        })}
      </div>
    );
  };

  const getUserById = (userId: string): User => {
    return users.filter((user) => user.id == userId)[0];
  };

  const AssignedUsersTasksGrid: React.FC = () => {
    if (!userTasks || !users) {
      return <SkeltonGrid />;
    }

    const assignedUserIds: string[] = useMemo(
      () => userTasks.map((ut) => ut.user_id),
      [JSON.stringify(userTasks.map((ut) => ut.id))]
    );

    const rows: AssignedUserRow[] = useMemo(
      () =>
        userTasks.map((userTask) => {
          const user = getUserById(userTask.user_id);
          return {
            id: userTask.id,
            uid: user.id,
            username: user.name,
            email: user.email,
            annotationNum: userTask.annotation_num,
            submittedNum: userTask.submitted_num,
          };
        }),
      [JSON.stringify(assignedUserIds)]
    );

    const _renderProgressCell = (value: number) => (
      <div
        style={{
          position: "relative",
          width: "calc(100% + 16px)",
          margin: "0 -8px",
          height: "100%",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: value + "%",
            height: "100%",
            backgroundColor: "#D4EBAF",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            padding: "0 8px",
          }}
        >
          {value}%
        </div>
      </div>
    );

    const columns: Column<AssignedUserRow>[] = useMemo(
      () => [
        SelectColumn,
        { key: "username", name: "ユーザー名" },
        { key: "email", name: "メールアドレス" },
        {
          key: "annotationNum",
          name: "振り分けアノテーション数",
        },
        {
          key: "submittedNum",
          name: "提出済みアノテーション数",
        },
        {
          key: "progress",
          name: "完了率",
          width: 150,
          formatter(props) {
            const value = Math.round(
              (props.row.submittedNum / props.row.annotationNum) * 100
            );
            return _renderProgressCell(value);
          },
        },
      ],
      []
    );

    console.log("振り分け済みユーザー", rows);

    return (
      <div className={classes.cardGrid}>
        <DataGrid
          rowKey="id"
          emptyRowsView={() => (
            <div className={classes.emptyGrid}>
              <Typography
                variant="subtitle1"
                color="textSecondary"
                align="center"
              >
                振り分け済みのユーザはいません
              </Typography>
            </div>
          )}
          rows={rows}
          columns={columns}
          selectedRows={selectedAssignedUserRows}
          onSelectedRowsChange={setSelectedAssignedUserRows}
          height={
            rows.length == 0 ? 100 : Math.min(500, 35 * (rows.length + 1))
          }
        />
      </div>
    );
  };

  const UnAssignedUsersTasksGrid: React.FC = () => {
    if (!userTasks || !users) {
      return <SkeltonGrid />;
    }

    const assignedUserIds: string[] = useMemo(
      () => userTasks.map((ut) => ut.user_id),
      [JSON.stringify(userTasks.map((ut) => ut.id))]
    );

    const rows: UnAssignedUserRow[] = useMemo(
      () =>
        users
          .filter((user) => !assignedUserIds.includes(user.id))
          .map((user) => {
            return {
              id: user.id,
              username: user.name,
              email: user.email,
            };
          }),
      [JSON.stringify(assignedUserIds)]
    );

    const columns: Column<UnAssignedUserRow>[] = useMemo(
      () => [
        SelectColumn,
        { key: "username", name: "ユーザー名" },
        { key: "email", name: "メールアドレス" },
      ],
      []
    );

    console.log("未振り分けユーザー", rows);

    return rows.length > 0 ? (
      <div className={classes.cardGrid}>
        <DataGrid
          rowKey="id"
          rows={rows}
          columns={columns}
          selectedRows={selectedUnAssignedUserRows}
          onSelectedRowsChange={setSelectedUnAssignedUserRows}
          height={
            rows.length == 0 ? 100 : Math.min(500, 35 * (rows.length + 1))
          }
        />
      </div>
    ) : (
      <div className={classes.emptyGrid}>
        <Typography variant="subtitle1" color="textSecondary">
          未振り分けのユーザはいません
        </Typography>
      </div>
    );
  };

  const onClickAssignTask = async (): Promise<void> => {
    const userIds = Array.from(selectedUnAssignedUserRows.keys());
    const _userTasks = await DataController.assignUsersTasksAllAnnotations(
      userIds,
      taskId
    );
    setUserTasks([...userTasks, ..._userTasks]);
    setSelectedUnAssignedUserRows(new Set());
    enqueueSnackbar(`${userIds.length}名にタスクを振り分けました`, {
      variant: "info",
    });
  };

  const onClickUnAssignTask = async (): Promise<void> => {
    const userTaskIds = Array.from(selectedAssignedUserRows.keys());
    console.log(userTaskIds);
    await Promise.all(
      userTaskIds.map((userTaskId) => DataController.deleteUserTask(userTaskId))
    );
    setUserTasks(
      userTasks.filter((userTask) => !userTaskIds.includes(userTask.id))
    );
    setSelectedAssignedUserRows(new Set());
    enqueueSnackbar(`${userTaskIds.length}個のタスクを削除しました`, {
      variant: "info",
    });
  };

  const onClickDeleteTask = async (): Promise<void> => {
    setLoading(true);
    await DataController.deleteTask(taskId);
    history.push("/tasks");
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <div className={classes.content}>
        {loading ? (
          <LoadingPage description="タスクを読み込み中..." />
        ) : (
          <div className={classes.content}>
            <div className={classes.header}>
              <div className={classes.headerContent}>
                <Button
                  onClick={(): void => {
                    history.push("/tasks");
                  }}
                >
                  <ArrowBackIcon htmlColor="white" style={{ fontSize: 40 }} />
                </Button>
                <div className={classes.mainTitle}>
                  <Typography variant="h4">{task.title}</Typography>
                  <Typography variant="h6">{task.id}</Typography>
                </div>
                <div style={{ flex: 1 }} />
                <IconMenu />
              </div>
            </div>
            <Card className={classes.featureCard}>
              <Typography variant="h6">詳細</Typography>
              <TaskGrid />
            </Card>
            <Card className={classes.card}>
              <div className={classes.gridHeader}>
                <Typography variant="h6">振り分け済みユーザー</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={selectedAssignedUserRows.size == 0}
                  onClick={onClickUnAssignTask}
                >
                  振り分けを削除
                </Button>
              </div>
              <AssignedUsersTasksGrid />
              <div className={classes.gridHeader}>
                <Typography variant="h6">未振り分けユーザー</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={selectedUnAssignedUserRows.size == 0}
                  onClick={onClickAssignTask}
                >
                  振り分けを実行
                </Button>
              </div>
              <UnAssignedUsersTasksGrid />
            </Card>
            <Card className={classes.card}>
              <Typography variant="h6">Danger Zone</Typography>
              <div className={classes.cardContent}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<DeleteIcon />}
                  onClick={(): void => setOpenDialog(true)}
                  disabled={!task}
                >
                  このタスクを削除
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
      {task && (
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {`本当に「${task.title}(${task.id})」を削除しますか`}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {task.title}({task.id})
              を削除すると、これまでユーザがアノテーションされたデータも含めて全てが削除されます。
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseDialog}
              color="primary"
              autoFocus
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button
              onClick={onClickDeleteTask}
              color="secondary"
              disabled={loading}
            >
              削除する
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default TaskDetailPage;
