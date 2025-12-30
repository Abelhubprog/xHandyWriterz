#!/bin/sh
set -eu

# Mattermost uses AWS SDK for Go for S3-compatible storage.
# If the endpoint contains a URL path (e.g. https://<account>.r2.cloudflarestorage.com/bucket)
# the SDK rejects it with:
#   "Endpoint url cannot have fully qualified paths."
# This wrapper strips any path component from configured endpoint variables.

trim() {
  # trim leading/trailing whitespace
  # shellcheck disable=SC2001
  echo "$1" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//'
}

sanitize_endpoint() {
  raw="$(trim "$1")"
  if [ -z "$raw" ]; then
    echo ""
    return 0
  fi

  case "$raw" in
    http://*|https://*)
      # Keep scheme + host[:port], drop any /path?query#fragment
      echo "$raw" | sed -E 's#^(https?://[^/]+).*$#\1#'
      ;;
    *)
      # No scheme: keep only host[:port]
      echo "${raw%%/*}"
      ;;
  esac
}

sanitize_var() {
  var_name="$1"
  # printenv returns non-zero if unset; ignore
  val="$(printenv "$var_name" 2>/dev/null || true)"
  if [ -z "${val:-}" ]; then
    return 0
  fi

  sanitized="$(sanitize_endpoint "$val")"
  if [ -n "${sanitized:-}" ] && [ "$sanitized" != "$val" ]; then
    echo "[railway-entrypoint] Sanitized $var_name (removed URL path)" >&2
    export "$var_name=$sanitized"
  fi
}

# Common S3 endpoint vars used by Mattermost.
sanitize_var MM_FILESETTINGS_AMAZONS3ENDPOINT
sanitize_var MM_FILESETTINGS_EXPORTAMAZONS3ENDPOINT

# Some setups use an intermediate variable that then gets mapped into MM_*.
sanitize_var MM_R2_ENDPOINT

exec mattermost server
POSTGRES_HOST="${MM_SQLSETTINGS_DATASOURCE:-}""
if [ -n "$POSTGRES_HOST" ]; then
  # Extract host/port from postgres://user:pass@host:port/db?params
  HOST=$(echo "$POSTGRES_HOST" | sed -E 's#^postgres://[^@]+@([^:/]+).*#\1#')
  PORT=$(echo "$POSTGRES_HOST" | sed -E 's#^postgres://[^@]+@[^:/]+:([0-9]+).*#\1#')
  PORT=${PORT:-5432}
  echo "[railway-entrypoint] Waiting for Postgres at $HOST:$PORT..."
  for i in $(seq 1 30); do
    nc -z "$HOST" "$PORT" && break
    sleep 2
  done
  nc -z "$HOST" "$PORT" || {
    echo "[railway-entrypoint] ERROR: Postgres not reachable at $HOST:$PORT after 60s. Exiting."
    exit 1
  }
fi

exec mattermost server
