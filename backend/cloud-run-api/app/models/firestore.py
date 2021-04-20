"""Data models: (see also: frontend/app/src/plugins/Schemas.tsx)"""
from datetime import datetime
from enum import Enum
from typing import Any, Dict, Generic, List, Optional, TypeVar

from google.cloud.firestore_v1.document import DocumentReference
from pydantic import BaseModel, ValidationError, validator
from pydantic.generics import GenericModel

DataT = TypeVar("DataT")


class StrEnum(str, Enum):
    @classmethod
    def values(cls):
        return list(map(lambda c: c.value, cls))


# NOTE: ==== FireStore Meta ====


class CollectionName(StrEnum):
    tasks = "tasks"
    users_tasks = "users_tasks"
    users = "users"
    annotations = "annotations"
    user_annotations_logs = "user_annotations_logs"
    users_annotations = "users_annotations"


# NOTE: ==== FireStore Models ====


class UserRoleEnum(StrEnum):
    admin = "admin"
    annotator = "annotator"


class AnnotationTypeEnum(StrEnum):
    card = "card"
    multi_label = "multi_label"


class User(BaseModel):
    id: str
    name: str
    email: str
    photo_url: str
    role: UserRoleEnum
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()


class Task(BaseModel):
    id: str
    annotation_type: AnnotationTypeEnum
    title: str
    question: str
    description: str
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()


class UserTask(BaseModel):
    # user*task で固有
    id: str
    user_id: str
    task_id: str
    annotation_num: int
    submitted_num: int
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()


class UserAnnotation(BaseModel):
    # user_task*annotation で固有
    id: str
    user_id: str
    order_index: int
    result_data: Optional[dict]
    annotation_id: str
    user_task_id: str
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()


class Annotation(GenericModel, Generic[DataT]):
    id: Optional[str]
    task_id: str
    data: DataT
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()


# NOTE: ==== Annotation Data ====

# --- Card ---


class CardAnnotationData(BaseModel):
    text: str
    baseline_text: Optional[str]
    show_ambiguous_button: Optional[bool] = True
    question_overwrite: Optional[str]
    yes_button_label: Optional[str]
    no_button_label: Optional[str]
    hidden_data: Any


# --- MultiLabel ---


class MultiLabelAnnotationData(BaseModel):
    text: str
    choices: List[str]
    max_select_num: Optional[int]
    baseline_text: Optional[str]
    hidden_data: Any


annot_cls_dict = {
    AnnotationTypeEnum.card: Annotation[CardAnnotationData],
    AnnotationTypeEnum.multi_label: Annotation[MultiLabelAnnotationData],
}
