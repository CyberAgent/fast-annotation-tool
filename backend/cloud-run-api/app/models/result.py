from app.functions.firestore import is_doc_exist
from app.models.firestore import Task
from typing import Any, List
from pydantic import BaseModel, ValidationError, root_validator, validator


class AnnotationResult(BaseModel):
    id: str
    name: str
    email: str
    data: Any
    result_data: Any
    order_index: int
    user_id: str
    user_task_id: str
    annotation_id: str
    created_at: Any
    updated_at: Any


class ResponseTaskResult(BaseModel):
    task: Task
    annotations: List[AnnotationResult]


class RequestTaskResult(BaseModel):
    task_id: str

    @validator("task_id")
    def task_id_is_exist(cls, v):
        if not is_doc_exist("tasks", v):
            raise ValueError(f"task_id: {v} is not found.")
        return v
