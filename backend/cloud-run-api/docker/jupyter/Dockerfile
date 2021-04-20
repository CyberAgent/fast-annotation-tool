FROM syunyooo/jupyter-notebook

RUN curl -sL https://firebase.tools | bash

COPY ./docker/common/requirements.txt /tmp
RUN pip install pip setuptools -U && pip install --upgrade pip \
    && pip install -r /tmp/requirements.txt

ENV PYTHONPATH ${PYTHONPATH}:/root