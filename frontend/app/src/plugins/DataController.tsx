import { firestore } from "firebase";
import firebase from "./firebase";
import {
  User,
  UserTask,
  Task,
  Annotation,
  UserAnnotation,
  UserAnnotationSet,
  CardResult,
  MultiLabelResult,
  UserAnnotationLog,
  ActionType,
  UserResult,
} from "./Schemas";
import { chunk } from "./Utils";

class DataController {
  private _db: firebase.firestore.Firestore;

  constructor() {
    this._db = firebase.firestore();
  }

  // NOTE: --- POST ---

  postUser = async (user: firebase.User): Promise<void> => {
    const userRef = this._db.collection("users").doc(user.uid);
    const dbUser: User = {
      id: user.uid,
      email: user.email,
      photo_url: user.photoURL,
      name: user.displayName,
      role: "annotator",
      created_at: firestore.Timestamp.now(),
      updated_at: firestore.Timestamp.now(),
    };
    await userRef.set(dbUser);
    console.log("postUser:", dbUser);
  };

  postAnnotation = async (
    userTask: UserTask,
    userAnnotation: UserAnnotation,
    resultData: UserResult
  ): Promise<void> => {
    console.log("postAnnotation", userAnnotation.order_index, resultData);
    const userAnnotationRef = this._db
      .collection("users_annotations")
      .doc(userAnnotation.id);
    await userAnnotationRef.update({
      result_data: resultData,
      updated_at: firestore.Timestamp.now(),
    });
  };

  postUserIfNeed = async (user: firebase.User): Promise<User> => {
    // ユーザが登録済みでなければ登録
    // const userRef = this._db.collection("users").doc(user.uid);
    const dbUser = await this.getUserById(user.uid);
    if (dbUser) {
      console.log("user exists", dbUser);
      return dbUser;
    } else {
      await this.postUser(user);
      return this.getUserById(user.uid);
    }
  };

  postUserAnnotationLog = async (
    userTaskId: string,
    userAnnotationId: string,
    actionType: ActionType,
    actionData?: any
  ): Promise<UserAnnotationLog> => {
    const userAnnotationLogDoc = this._db
      .collection("user_annotations_logs")
      .doc();
    const postUserAnnotationLog: UserAnnotationLog = {
      id: userAnnotationLogDoc.id,
      user_task_id: userTaskId,
      user_annotation_id: userAnnotationId,
      action_type: actionType,
      action_data: actionData,
      created_at: firestore.Timestamp.now(),
    };
    await userAnnotationLogDoc.set(postUserAnnotationLog);
    return postUserAnnotationLog;
  };

  updateUserTaskSubmittedNumIfNeed = async (
    userTask: UserTask
  ): Promise<void> => {
    // UserAnnotaitonに更新があればUserTaskのsubmitted_numを更新する
    const _updated = !(
      await this._db
        .collection("users_annotations")
        .where("user_task_id", "==", userTask.id)
        .where("updated_at", ">", userTask.updated_at)
        .limit(1)
        .get()
    ).empty;
    if (_updated) {
      const userAnnotationSubmitted = await this._db
        .collection("users_annotations")
        .where("user_task_id", "==", userTask.id)
        .where("result_data", "!=", null)
        .get();
      const submittedNum = userAnnotationSubmitted.size;
      console.log(
        "userTask submitted_num update",
        userTask.submitted_num,
        "→",
        submittedNum
      );
      userTask.submitted_num = submittedNum;
      const userTaskRef = this._db.collection("users_tasks").doc(userTask.id);
      await userTaskRef.update({
        submitted_num: submittedNum,
        updated_at: firestore.Timestamp.now(),
      });
    }
  };

  // NOTE: --- Data Transform ---

  docToData = (doc: any) => {
    return { id: doc.id, ...doc.data() };
  };

  refToDataList = async (
    ref: firebase.firestore.CollectionReference | firebase.firestore.Query
  ): Promise<any[]> => {
    return (await ref.get()).docs.map((doc) => {
      return this.docToData(doc);
    });
  };

  // NOTE: -- get all docs

  getDocsDataAll = async <T extends {}>(
    collectionPath: string
  ): Promise<T[]> => {
    return this.refToDataList(this._db.collection(collectionPath));
  };

  getTasksAll = async (): Promise<Task[]> => {
    return this.getDocsDataAll<Task>("tasks");
  };

  getUsersAll = async (): Promise<User[]> => {
    return this.getDocsDataAll<User>("users");
  };

  // NOTE: -- get single doc by id ---

  getDocDataById = async <T extends {}>(
    collectionPath: string,
    docId: string
  ): Promise<T> => {
    const _ref = await this._db.collection(collectionPath).doc(docId).get();
    return _ref.exists ? (this.docToData(_ref) as T) : null;
  };

  getUserById = async (docId: string): Promise<User> => {
    return this.getDocDataById<User>("users", docId);
  };

  getUserTaskById = async (docId: string): Promise<UserTask> => {
    return this.getDocDataById<UserTask>("users_tasks", docId);
  };

  getUserAnnotationById = async (docId: string): Promise<UserAnnotation> => {
    return this.getDocDataById<UserAnnotation>("users_annotations", docId);
  };

  getTaskById = async (docId: string): Promise<Task> => {
    return this.getDocDataById<Task>("tasks", docId);
  };

  getAnnotationById = async (docId: string): Promise<Annotation> => {
    return this.getDocDataById<Annotation>("annotations", docId);
  };

  // NOTE: --- Home ---

  getTasksByIds = async (taskIds: string[]): Promise<Task[]> => {
    // get tasks
    const _taskChunks: Task[][] = await Promise.all(
      chunk(taskIds, 10).map((chunkIds) =>
        this.refToDataList(
          this._db.collection("tasks").where("id", "in", chunkIds)
        )
      )
    );
    const _tasks: Task[] = ([] as Task[]).concat(..._taskChunks);
    // sort by input ids
    const resTasks = taskIds.map((taskId) =>
      _tasks.find((t) => t.id == taskId)
    );
    return resTasks;
  };

  getUserTasksByUserId = async (userId: string): Promise<UserTask[]> => {
    const userTasks = (await this.refToDataList(
      this._db
        .collection("users_tasks")
        .where("user_id", "==", userId)
        .orderBy("created_at", "desc")
    )) as UserTask[];
    await Promise.all(
      userTasks.map((userTask) =>
        this.updateUserTaskSubmittedNumIfNeed(userTask)
      )
    );
    return userTasks;
  };

  // NOTE: -- Tasks --

  getUserTasksByTaskId = async (taskId: string): Promise<UserTask[]> => {
    const userTasks = (await this.refToDataList(
      this._db
        .collection("users_tasks")
        .where("task_id", "==", taskId)
        .orderBy("created_at", "desc")
    )) as UserTask[];
    await Promise.all(
      userTasks.map((userTask) =>
        this.updateUserTaskSubmittedNumIfNeed(userTask)
      )
    );
    return userTasks;
  };

  assignUserTaskAllAnnotations = async (
    userId: string,
    taskId: string,
    annotations?: firestore.QuerySnapshot<firestore.DocumentData>
  ): Promise<UserTask> => {
    if (!annotations) {
      annotations = await this._db
        .collection("annotations")
        .where("task_id", "==", taskId)
        .orderBy("created_at")
        .get();
    }
    const userTaskDoc = this._db.collection("users_tasks").doc();
    const userTask: UserTask = {
      id: userTaskDoc.id,
      user_id: userId,
      task_id: taskId,
      annotation_num: annotations.size,
      submitted_num: 0,
      created_at: firestore.Timestamp.now(),
      updated_at: firestore.Timestamp.now(),
    };
    userTaskDoc.set(userTask);
    // set UserAnnotations
    const chunkSize = 500;
    chunk(annotations.docs, chunkSize).forEach((annotDocs, ci) => {
      const batch = this._db.batch();
      annotDocs.forEach((annotDoc, i) => {
        const orderIndex = chunkSize * ci + i + 1;
        const doc = this._db.collection("users_annotations").doc();
        const userAnnotation: UserAnnotation = {
          id: doc.id,
          user_id: userId,
          annotation_id: annotDoc.id,
          user_task_id: userTask.id,
          order_index: orderIndex,
          result_data: null,
          created_at: firestore.Timestamp.now(),
          updated_at: firestore.Timestamp.now(),
        };
        batch.set(doc, userAnnotation);
      });
      batch.commit();
    });

    return userTask;
  };

  assignUsersTasksAllAnnotations = async (
    userIds: string[],
    taskId: string
  ): Promise<UserTask[]> => {
    // ユーザーにタスク内の全てのアノテーションを振り分け
    // アノテーション全体の取得
    const annotations = await this._db
      .collection("annotations")
      .where("task_id", "==", taskId)
      .orderBy("created_at")
      .get();
    // set UserTask
    const userTasks = await Promise.all(
      userIds.map((userId) =>
        this.assignUserTaskAllAnnotations(userId, taskId, annotations)
      )
    );

    return userTasks;
  };

  deleteTask = async (taskId: string): Promise<void> => {
    // タスクと関連するデータを削除
    // delete Task
    const task = await this._db
      .collection("tasks")
      .where("id", "==", taskId)
      .get();
    task.docs.forEach((doc) => doc.ref.delete());
    // delete Annotation
    const annotations = await this._db
      .collection("annotations")
      .where("task_id", "==", taskId)
      .get();
    chunk(annotations.docs, 500).forEach((docs) => {
      const batch = this._db.batch();
      console.log(`annotations:${docs.length} deleted`);
      docs.forEach((doc) => batch.delete(doc.ref));
      batch.commit();
    });
    // delete User Task
    const userTasks = await this._db
      .collection("users_tasks")
      .where("task_id", "==", taskId)
      .get();
    userTasks.forEach((userTask) => this.deleteUserTask(userTask.id));
  };

  deleteUserTask = async (userTaskId: string): Promise<void> => {
    // ユーザータスクと紐づくユーザアノテーションを削除
    // delete User Task
    const userTask = await this._db
      .collection("users_tasks")
      .where("id", "==", userTaskId)
      .get();
    const batch = this._db.batch();
    userTask.docs.forEach((d) => batch.delete(d.ref));
    batch.commit();
    // delete UserAnnotation
    const userAnnotations = await this._db
      .collection("users_annotations")
      .where("user_task_id", "==", userTaskId)
      .get();
    console.log(`userAnnotations:${userAnnotations.docs.length} deleting`);
    chunk(userAnnotations.docs, 500).forEach((docs) => {
      const batch = this._db.batch();
      console.log(`userAnnotations:${docs.length} deleted`);
      docs.forEach((doc) => batch.delete(doc.ref));
      batch.commit();
    });
    // delete UserAnnotationLog
    const userAnnotationLogs = await this._db
      .collection("user_annotations_logs")
      .where("user_task_id", "==", userTaskId)
      .get();
    chunk(userAnnotationLogs.docs, 500).forEach((docs) => {
      const batch = this._db.batch();
      console.log(`userAnnotationLogs:${docs.length} deleted`);
      docs.forEach((doc) => batch.delete(doc.ref));
      batch.commit();
    });
  };

  // NOTE: -- Annotation --

  getLatestUserAnnotation = async (
    userTaskId: string
  ): Promise<UserAnnotation | null> => {
    // 回答途中: 回答していないアノテーションの中で最小order_indexのもの
    // 全回答済み: 最大order_indexのアノテーション
    const latestResultNull = await this._db
      .collection("users_annotations")
      .where("user_task_id", "==", userTaskId)
      .where("result_data", "==", null)
      .orderBy("order_index")
      .limit(1)
      .get();
    if (!latestResultNull.empty) {
      return this.docToData(latestResultNull.docs[0]) as UserAnnotation;
    } else {
      const lastUserAnnotation = await this._db
        .collection("users_annotations")
        .where("user_task_id", "==", userTaskId)
        .orderBy("order_index", "desc")
        .limit(1)
        .get();
      return this.docToData(lastUserAnnotation.docs[0]) as UserAnnotation;
    }
  };

  getUserAnnotationSetById = async (
    docId: string
  ): Promise<UserAnnotationSet> => {
    const _userAnnotation = await this.getUserAnnotationById(docId);
    const _annotation = await this.getAnnotationById(
      _userAnnotation.annotation_id
    );
    return {
      userAnnotation: _userAnnotation,
      annotation: _annotation,
    };
  };

  getUserAnnotationSets = async (
    userTaskId: string,
    offsetOrderIndex: number,
    type: "next" | "previous",
    limit = 100
  ): Promise<UserAnnotationSet[]> => {
    const ltgt = type == "next" ? ">" : "<";
    const orderType = type == "next" ? "asc" : "desc";
    const _userAnnotationsRef = await this._db
      .collection("users_annotations")
      .where("user_task_id", "==", userTaskId)
      .where("order_index", ltgt, offsetOrderIndex)
      .orderBy("order_index", orderType)
      .limit(limit);
    const _userAnnotations = (await this.refToDataList(
      _userAnnotationsRef
    )) as UserAnnotation[];
    const _annotations: Annotation[] = await Promise.all(
      _userAnnotations.map((uannot) =>
        this.getAnnotationById(uannot.annotation_id)
      )
    );
    return _userAnnotations.map((uannot, i) => {
      return {
        userAnnotation: uannot,
        annotation: _annotations[i],
      } as UserAnnotationSet;
    });
  };
}

const dataController = new DataController();
export default dataController;
