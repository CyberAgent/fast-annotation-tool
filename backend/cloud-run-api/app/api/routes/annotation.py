from typing import Any, Dict, List

from app.config.api_config import APP_URL
from app.functions.firestore import get_collection_docs, is_doc_exist
from app.functions.task import get_task_logs, get_task_result, set_task_annotations
from app.models.firestore import Task, annot_cls_dict
from app.models.log import ResponseAnnotationLogs
from app.models.result import ResponseTaskResult
from app.models.upload import RequestTaskUpload, ResponseTaskUpload
from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/tasks")
async def get_tasks():
    return get_collection_docs("tasks")


@router.post("/tasks", response_model=ResponseTaskUpload)
async def annotations_upload(req: RequestTaskUpload):
    try:
        task = Task(
            id=req.task_id,
            annotation_type=req.annotation_type,
            title=req.title,
            question=req.question,
            description=req.description,
        )
        annotations = [
            annot_cls_dict[task.annotation_type](task_id=task.id, data=annot_data)
            for annot_data in req.annotations_data
        ]
        set_task_annotations(task, annotations)
        return ResponseTaskUpload(
            message="Success upload.",
            task_id=req.task_id,
            annotation_num=len(req.annotations_data),
            task_url=f"{APP_URL}/task/{req.task_id}",
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/tasks/{task_id}", response_model=ResponseTaskResult)
async def get_result(task_id: str):
    return ResponseTaskResult(**get_task_result(task_id))


@router.get("/tasks/{task_id}/logs", response_model=ResponseAnnotationLogs)
async def get_logs(task_id: str):
    return ResponseAnnotationLogs(**get_task_logs(task_id))
