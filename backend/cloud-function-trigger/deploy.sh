#!/bin/sh -e
ENV="SLACK_API_KEY=${SLACK_API_KEY},SLACK_CHANNEL=${SLACK_CHANNEL}"

gcloud functions deploy notify_slack_on_user_created \
   --runtime python39 \
   --trigger-event providers/cloud.firestore/eventTypes/document.create \
   --trigger-resource "projects/${PROJECT_ID}/databases/(default)/documents/users/{name}" \
   --set-env-vars $ENV


gcloud functions deploy notify_slack_on_usertask_created \
   --runtime python39 \
   --trigger-event providers/cloud.firestore/eventTypes/document.create \
   --trigger-resource "projects/${PROJECT_ID}/databases/(default)/documents/users_tasks/{name}" \
   --set-env-vars $ENV


gcloud functions deploy notify_slack_on_usertask_updated \
   --runtime python39 \
   --trigger-event providers/cloud.firestore/eventTypes/document.update \
   --trigger-resource "projects/${PROJECT_ID}/databases/(default)/documents/users_tasks/{name}" \
   --set-env-vars $ENV
