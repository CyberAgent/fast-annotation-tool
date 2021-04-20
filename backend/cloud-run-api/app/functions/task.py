from typing import List

import pandas as pd
from app.functions.firebase import db
from app.functions.firestore import (
    get_collection_docs_where_in,
    insert_batch_dicts,
    insert_dict,
    snapshots_to_dicts,
)
from app.models.firestore import Annotation, Task


def set_task_annotations(task: Task, annotations: List[Annotation]) -> None:
    # create tasks
    task_ref = insert_dict(task.dict(), "tasks", task.id)
    print(f"insert task: {task_ref.id}")
    # create annotaions
    print(f"insert {len(annotations)} annotations")
    insert_batch_dicts([annot.dict() for annot in annotations], "annotations")


def get_task_result(task_id: str):
    # get data
    task = snapshots_to_dicts(db.collection("tasks").where("id", "==", task_id).get())[0]
    users_tasks = snapshots_to_dicts(
        db.collection("users_tasks").where("task_id", "==", task_id).get()
    )
    user_task_ids = [ut["id"] for ut in users_tasks]
    user_ids = [ut["user_id"] for ut in users_tasks]
    users = get_collection_docs_where_in("users", "id", user_ids)
    print("users", len(users))
    users_annotations = get_collection_docs_where_in(
        "users_annotations", "user_task_id", user_task_ids
    )
    print("users_annotations", len(users_annotations))
    annotation_ids = list(set([uannot["annotation_id"] for uannot in users_annotations]))
    print("annotation_ids", len(annotation_ids))
    annotations = get_collection_docs_where_in("annotations", "id", annotation_ids)
    # parse data
    df_users = pd.DataFrame(users)[["id", "name", "email"]].rename(columns={"id": "user_id"})
    df_users_tasks = pd.DataFrame(users_tasks)[["id", "user_id"]].rename(
        columns={"id": "user_task_id"}
    )
    df_users_annotations = pd.DataFrame(users_annotations)
    df_annotations = pd.DataFrame(annotations).rename(columns={"id": "annotation_id"})[
        ["annotation_id", "data"]
    ]
    df = pd.merge(df_users_tasks, df_users, on="user_id").drop(columns=["user_id"])
    df = pd.merge(df, df_users_annotations, on="user_task_id")
    df = pd.merge(df, df_annotations, on="annotation_id")
    df = df[
        [
            "id",
            "name",
            "email",
            "data",
            "result_data",
            "order_index",
            "user_id",
            "user_task_id",
            "annotation_id",
            "created_at",
            "updated_at",
        ]
    ]
    res_annotations = df.to_dict(orient="records")
    return {"task": task, "annotations": res_annotations}


def get_task_logs(task_id):
    # get data
    user_tasks = snapshots_to_dicts(
        db.collection("users_tasks").where("task_id", "==", task_id).get()
    )
    user_task_ids = [ut["id"] for ut in user_tasks]
    logs = get_collection_docs_where_in("user_annotations_logs", "user_task_id", user_task_ids)
    user_ids = [ut["user_id"] for ut in user_tasks]
    users = get_collection_docs_where_in("users", "id", user_ids)
    # parse data
    df_log = pd.DataFrame(logs)
    df_users = pd.DataFrame(users)[["id", "name", "email"]].rename(columns={"id": "user_id"})
    df_users_tasks = pd.DataFrame(user_tasks)[["id", "user_id"]].rename(
        columns={"id": "user_task_id"}
    )
    df = pd.merge(df_log, df_users_tasks, on="user_task_id")
    df = pd.merge(df, df_users, on="user_id").drop(columns=["user_id"])
    df = df[
        [
            "id",
            "name",
            "email",
            "action_type",
            "action_data",
            "user_task_id",
            "user_annotation_id",
            "created_at",
        ]
    ]
    res_logs = df.to_dict(orient="records")
    return {"logs": res_logs}
