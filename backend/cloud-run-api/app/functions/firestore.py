from datetime import datetime
from typing import Dict, List, Union

import pandas as pd
from app.functions.firebase import db
from app.utils.multi_thread import multi_thread_flat
from google.cloud.firestore_v1.document import DocumentSnapshot
from tqdm.auto import tqdm


def snapshots_to_dicts(snapshots: List[DocumentSnapshot]) -> List[Dict[str, any]]:
    return [{**sp.to_dict(), **{"id": sp.id}} for sp in snapshots]


def is_doc_exist(collection_name: str, docId: str) -> bool:
    return db.collection(collection_name).document(docId).get().exists


def get_collection_docs(collection_name: str, limit=100) -> List[Dict[str, any]]:
    return snapshots_to_dicts(db.collection(collection_name).get())


def get_collection_docs_where_in(
    collection_name: str, field_name: str, parent_list: List[Union[str, int, float]]
):
    assert type(parent_list) == list

    def _get_docs_where_in(_chunks):
        return snapshots_to_dicts(
            db.collection(collection_name).where(field_name, "in", _chunks).get()
        )

    parent_chunks = split_list(parent_list, 10)
    items = multi_thread_flat(parent_chunks, _get_docs_where_in, 20)
    return items


def add_common_fields(_dict: Dict[str, any]):
    return {
        **_dict,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
    }


def insert_dict(_dict: Dict[str, any], collection_name: str, document_id: str = None):
    _dict = add_common_fields(_dict)
    _ref = db.collection(collection_name).document(_dict.get("id", document_id))
    if _dict.get("id", document_id) is None:
        _dict["id"] = _ref.id
    _ref.set(_dict)
    return _ref


def insert_batch_dicts(dicts: List[Dict[str, any]], collection_name: str):
    batch = db.batch()
    chunk_size = 400
    chunks = list(split_list(dicts, chunk_size))
    for _chunk in tqdm(chunks):
        for _dict in _chunk:
            _dict = add_common_fields(_dict)
            _ref = db.collection(collection_name).document(_dict.get("id"))
            if _dict.get("id") is None:
                _dict["id"] = _ref.id
            batch.set(_ref, _dict)
        _ = batch.commit()


def update_doc(_dict, snapshot: DocumentSnapshot):
    return snapshot.reference.update({"updated_at": datetime.now(), **_dict})


def split_list(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i : i + n]
