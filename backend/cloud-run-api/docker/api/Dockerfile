FROM python:3.8-slim
WORKDIR /root
RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends sudo curl && curl -sL https://firebase.tools | bash
COPY ./docker/common/requirements.txt /tmp
RUN pip install pip setuptools -U && pip install --upgrade pip \
    && pip install -r /tmp/requirements.txt
COPY ./app /root/app
ENV PORT 5000
EXPOSE 5000
ENV PYTHONPATH ${PYTHONPATH}:/root
CMD exec uvicorn --port $PORT --host 0.0.0.0 app.main:app
