from typing import Any, List
from pydantic import BaseModel, ValidationError, root_validator, validator


class AnnotationLog(BaseModel):
    id: str
    name: str
    email: str
    data: Any
    action_type: Any
    action_data: Any
    user_task_id: str
    user_annotation_id: str
    created_at: Any


class ResponseAnnotationLogs(BaseModel):
    logs: List[AnnotationLog]
