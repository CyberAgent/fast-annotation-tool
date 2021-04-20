from slacker import Slacker
import os

API_KEY = os.environ["SLACK_API_KEY"]
CHANNEL = os.environ["SLACK_CHANNEL"]
slacker = Slacker(API_KEY)


def post(_str, pretext=None, title=None, color="good", channel=None, image_url=None):
    if channel is None:
        channel = CHANNEL
    slacker.chat.post_message(
        channel,
        attachments=[
            {
                "title": title,
                "pretext": pretext,
                "color": color,
                "text": _str,
                "image_url": image_url,
            }
        ],
        username="fast-cat",
        icon_emoji=":cat-sit:",
    )
