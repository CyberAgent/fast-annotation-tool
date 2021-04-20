import slack
from firestore import get_doc_dict_by_id


def notify_slack_on_user_created(data, context):
    trigger_resource = context.resource
    print("Function triggered by created : %s" % trigger_resource)
    print(data)

    def _get_str(key):
        return data["value"]["fields"][key]["stringValue"]

    slack.post(
        f"email: {_get_str('email')}\nuid: {_get_str('id')}",
        pretext="新規ユーザが登録されました",
        title=_get_str("name"),
        color="#ffa500",
    )


def notify_slack_on_usertask_created(data, context):
    trigger_resource = context.resource
    print("Function triggered by created : %s" % trigger_resource)
    print(data)

    def _get_str(key):
        return list(data["value"]["fields"][key].values())[0]

    user_id = _get_str("user_id")
    task_id = _get_str("task_id")
    user_dict = get_doc_dict_by_id("users", user_id)
    task_dict = get_doc_dict_by_id("tasks", task_id)
    print(user_dict)
    print(task_dict)

    slack.post(
        f"user_name: {user_dict.get('name')}\n件数: {_get_str('annotation_num')}\ntask_id: {task_id}\nuid: {user_id}",
        pretext="ユーザにタスクが振り分けられました",
        title=task_dict.get("title"),
        color="#008080",
    )


def notify_slack_on_usertask_updated(data, context):
    trigger_resource = context.resource
    print("Function triggered by updated : %s" % trigger_resource)
    print(data)

    def _get_str(key):
        return list(data["value"]["fields"][key].values())[0]

    annotation_num = int(_get_str("annotation_num"))
    submitted_num = int(_get_str("submitted_num"))
    user_id = _get_str("user_id")
    task_id = _get_str("task_id")
    user_dict = get_doc_dict_by_id("users", user_id)
    task_dict = get_doc_dict_by_id("tasks", task_id)
    print(user_dict)
    print(task_dict)
    print(f"Annotation {submitted_num}/{annotation_num}")

    if annotation_num == submitted_num:
        # Done
        print("Annotation Done")
        slack.post(
            f"user_name: {user_dict.get('name')}\n件数: {_get_str('annotation_num')}\ntask_id: {task_id}\nuid: {user_id}",
            pretext="ユーザがタスクを完了しました",
            title=task_dict.get("title"),
            color="#4169e1",
        )
    elif submitted_num == 1:
        # WARNING: 呼び出しではキャッシュがとられるので、1がスキップされる可能性高
        # Start
        print("Annotation Start")
        slack.post(
            f"user_name: {user_dict.get('name')}\n件数: {_get_str('annotation_num')}\ntask_id: {task_id}\nuid: {user_id}",
            pretext="ユーザがタスクを開始しました",
            title=task_dict.get("title"),
            color="#2e8b57",
        )
