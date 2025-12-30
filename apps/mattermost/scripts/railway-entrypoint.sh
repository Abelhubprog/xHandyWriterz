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
