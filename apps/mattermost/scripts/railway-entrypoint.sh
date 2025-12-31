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

POSTGRES_RAW="${MM_SQLSETTINGS_DATASOURCE:-}"
if [ -n "$POSTGRES_RAW" ]; then
  # Extract the first postgres/postgresql DSN if the env contains multiple values
  CLEAN_DS=$(echo "$POSTGRES_RAW" | grep -o -E 'postgresql?://[^[:space:]]+' | head -n1 2>/dev/null || true)
  if [ -z "$CLEAN_DS" ]; then
    CLEAN_DS="$POSTGRES_RAW"
  fi

  # Extract host/port from DSN like postgres://user:pass@host:port/db?params
  HOST=$(echo "$CLEAN_DS" | sed -E 's#^postgresql?://[^@]+@([^:/]+).*#\1#')
  PORT=$(echo "$CLEAN_DS" | sed -E 's#^postgresql?://[^@]+@[^:/]+:([0-9]+).*#\1#')
  PORT=${PORT:-5432}

  echo "[railway-entrypoint] Waiting for Postgres at $HOST:$PORT (from DSN)..."
  # Increase attempts to allow cloud DB cold-starts
  for i in $(seq 1 60); do
    if command -v nc >/dev/null 2>&1; then
      nc -z "$HOST" "$PORT" && break
    elif command -v bash >/dev/null 2>&1; then
      bash -c ">/dev/tcp/${HOST}/${PORT}" >/dev/null 2>&1 && break
    else
      if command -v getent >/dev/null 2>&1; then
        getent hosts "$HOST" >/dev/null 2>&1 && break
      fi
    fi
    sleep 2
  done

  # Final check using whatever method is available
  if command -v nc >/dev/null 2>&1; then
    nc -z "$HOST" "$PORT" || {
      echo "[railway-entrypoint] ERROR: Postgres not reachable at $HOST:$PORT after timeout. Exiting."
      exit 1
    }
  elif command -v bash >/dev/null 2>&1; then
    bash -c ">/dev/tcp/${HOST}/${PORT}" >/dev/null 2>&1 || {
      echo "[railway-entrypoint] ERROR: Postgres not reachable at $HOST:$PORT after timeout. Exiting."
      exit 1
    }
  else
    if command -v getent >/dev/null 2>&1; then
      getent hosts "$HOST" >/dev/null 2>&1 || {
        echo "[railway-entrypoint] ERROR: Could not resolve Postgres host $HOST. Exiting."
        exit 1
      }
    else
      echo "[railway-entrypoint] WARNING: No 'nc', 'bash /dev/tcp' or 'getent' available to validate Postgres connectivity. Proceeding to start Mattermost (may fail)."
    fi
  fi
fi
exec mattermost server
