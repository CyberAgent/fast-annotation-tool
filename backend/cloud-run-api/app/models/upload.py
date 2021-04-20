from app.functions.firestore import is_doc_exist
from app.models.firestore import AnnotationTypeEnum
from typing import Any, Dict, List
from pydantic import BaseModel, ValidationError, root_validator, validator
from app.models.firestore import annot_cls_dict


class RequestTaskUpload(BaseModel):
    task_id: str
    annotation_type: AnnotationTypeEnum
    title: str
    question: str
    description: str
    annotations_data: List

    @validator("task_id")
    def task_id_is_unique(cls, v) -> str:
        if is_doc_exist("tasks", v):
            raise ValueError(f"task_id: {v} は既に存在します.")
        return v

    @validator("task_id")
    def task_id_not_contains_slash(cls, v) -> str:
        if "/" in v:
            raise ValueError('task_id に "/" を含めることはできません')
        return v


class ResponseTaskUpload(BaseModel):
    message: str
    task_id: str
    annotation_num: int
    task_url: str
