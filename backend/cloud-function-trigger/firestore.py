import firebase_admin
from firebase_admin import firestore

firebase_admin.initialize_app()
db = firestore.client()


def snapshot_to_dict(snapshot):
    return {**snapshot.to_dict(), **{"id": snapshot.id}}


def snapshots_to_dicts(snapshots):
    return [snapshot_to_dict(sp) for sp in snapshots]


def is_doc_exist(collection_name, doc_id):
    return db.collection(collection_name).document(doc_id).get().exists


def get_collection_docs(collection_name, limit=100):
    return snapshots_to_dicts(db.collection(collection_name).get())


def split_list(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


def get_collection_docs_where_in(collection_name, field_name, parent_list):
    items = []
    for _parent_chunk in split_list(parent_list, 10):
        items += snapshots_to_dicts(
            db.collection(collection_name).where(field_name, "in", _parent_chunk).get()
        )
    return items


def get_doc_dict_by_id(collection_name, doc_id):
    return snapshot_to_dict(db.collection(collection_name).document(doc_id).get())
