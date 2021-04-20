import asyncio
from typing import List

from app.api.routes.annotation import annotations_upload
from app.models.upload import RequestTaskUpload


def set_demo_task() -> None:
    loop = asyncio.get_event_loop()
    loop.create_task(set_demo_multi_label_task())
    loop.run_until_complete(set_demo_card_task())


async def set_demo_multi_label_task() -> None:
    annotations_data = [
        {
            "text": f"This is a test{i}.",
            "choices": ["ChoiceA", "ChoiceB", "ChoiceC", "ChoiceD"],
            "baseline_text": "Baseline Text",
            "hidden_data": {"desc": "Data for aggregation. It can be a dictionary or a string."},
        }
        for i in range(100)
    ]
    request = RequestTaskUpload(
        task_id="demo-multilabel",
        annotation_type="multi_label",
        title="Multi-Label Demo",
        question="This is multi-label demo",
        description="This is a multi-label demo, so feel free to annotate it as you wish.",
        annotations_data=annotations_data,
    )
    await annotations_upload(request)


async def set_demo_card_task() -> None:
    annotations_data = [
        {
            "text": f"This is a test{i}.",
            "show_ambiguous_button": True,
            "hidden_data": {"desc": "Data for aggregation. It can be a dictionary or a string."},
        }
        for i in range(100)
    ]
    request = RequestTaskUpload(
        task_id="demo-card",
        annotation_type="card",
        title="Card Demo",
        question="This is card demo",
        description="This is a card demo, so feel free to annotate it as you wish.",
        annotations_data=annotations_data,
    )
    await annotations_upload(request)


if __name__ == "__main__":
    set_demo_task()
