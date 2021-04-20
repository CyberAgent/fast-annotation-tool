# 一時的にDockerコンテナを立ち上げ、内部でコマンドを実行します.
# Temporarily launch a Docker container and run commands inside it.
EXEC_CMD=''

UPP_CMD='docker-compose run --rm app sh -c'
DOCKER_CMD=${UPP_CMD}

while [ "$1" != "" ]
do
  EXEC_CMD="${EXEC_CMD} $1"
  shift
done

echo ${DOCKER_CMD} "${EXEC_CMD}"
${DOCKER_CMD} "${EXEC_CMD}"
