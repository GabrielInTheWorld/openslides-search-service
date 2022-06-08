#!/bin/sh

set -e

export POSTGRESQL_PORT="${POSTGRESQL_PORT:-5432}"

./wait-for.sh --timeout=10 "$POSTGRESQL_HOST:$POSTGRESQL_PORT"

exec "$@"
