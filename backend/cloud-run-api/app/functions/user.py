from app.functions.firebase import db
from app.functions.firestore import snapshots_to_dicts, update_doc
from app.models.firestore import CollectionName, UserRoleEnum


def set_user_role(email: str, role: UserRoleEnum):
    assert role in UserRoleEnum.values(), f"Select a role from {UserRoleEnum.values()}"
    user_docs = list(db.collection(CollectionName.users).where("email", "==", email).stream())
    assert len(user_docs) > 0, f"User not found: {email}"
    assert len(user_docs) < 2, f"Multiple users found: {email}"
    user_doc = user_docs[0]
    _user_dict = snapshots_to_dicts(user_docs)[0]
    print(f"User found: {_user_dict}")
    print(f'change role: {_user_dict["role"]} -> {role}')
    update_doc({"role": role}, user_doc)


if __name__ == "__main__":
    import fire

    fire.Fire({"set_user_role": set_user_role})
