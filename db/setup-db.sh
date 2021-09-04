if [ $# -eq 0 ]; then
    echo "No arguments supplied"
    exit 1
fi

docker stop test-db > /dev/null 2>&1
docker rm test-db > /dev/null 2>&1

no_pgdata="[ -z \"$(ls -A mount)\" ]"

if [ "$1" == "test" ]; then
    docker run -d --name test-db -p 5432:5432 dvd-test
fi

if [ "$1" == "dev" ]; then
    docker run -d --name test-db \
        -v "/$(pwd)/mount/:/var/lib/postgresql/data" \
        -e PGDATA=/var/lib/postgresql/data/pgdata \
        -p 5432:5432 \
        dvd-test
fi

while true; do
    echo "Waiting for db conn"
    if docker exec test-db sh -c "psql -U postgres -lqt | cut -d \| -f 1 | grep -qw dvdrental" > /dev/null 2>&1; then
        echo "Connection found"
        if eval "$no_pgdata" || [ "$1" == "test" ] > /dev/null 2>&1; then
            echo "Restoring dvdrental"
            docker exec test-db sh -c "pg_restore -U postgres -C -d dvdrental /var/lib/postgresql/backup/dvdrental.tar" > /dev/null 2>&1
        fi
        break
    fi
done
