# Cloud Run API

## Quick Start

See [here](../../../../wiki/Quick-Start#3-backend).



## Dev Commands

#### Start up the Local API server

```shell
make up
```

#### Upload mock data

```shell
make set_demo_tasks
```

#### Granting Admin privileges

```shell
make set_user_role email=<YOUR_EMAIL> role=admin
```

#### Deploy

```shell
gcloud builds submit --substitutions _PROJECT=<PROJECT_ID>,_SERVICE_ACCOUNT=***.iam.gserviceaccount,_APP_URL=<PROJECT_ID>.web.app
```

