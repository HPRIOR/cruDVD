# cruDVD API

## Testing
The integration rests require a postgres database with the correct schema and data.
You can create a docker image containing a postgres database and the required data to restore, 
by running the following commands (from /crudDVD):

```shell
cd db
docker build . -t dvd-test
```

A script is provided to setup the container with the required data. From cruDVD/API/db
execute:

```shell
./setup-db.sh "test"
```
This will create a container without a volume, but with the correct schema and data in it to run any tests.
Because no volume is present the data is transient and will reset everytime this script is run. 

To create a container with persistent data, for development purposes, run:
```shell
./setup-db.sh "dev"
```

notes:
- if using a jetbrains ide and configurations to run the tests, ensure that jest these options are set:
  - --runInBand
  - --setupFiles dotenv/config
- tests running from a jetbrains configurations are also required to have their working directory set as 
cruDVD/API, otherwise the tests will not be able to find the env variables



