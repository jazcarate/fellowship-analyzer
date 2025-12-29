#!/bin/bash

url="$1"

# Extract ID - handle both /ability/ and /effect/
if echo "$url" | grep -q '/ability/'; then
  id=$(echo "$url" | sed -E 's|.*/ability/([0-9]+)/.*|\1|')
else
  id=$(echo "$url" | sed -E 's|.*/effect/([0-9]+)/.*|\1|')
fi

slug=$(echo "$url" | sed -E 's|.*/([^/]+)$|\1|')

# Convert slug to title case
name=$(echo "$slug" | tr '-' ' ' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1')

# Output the formatted string
echo "{ id: $id, name: '$name' },"
