#!/bin/bash

# setup-service-account.sh
# Helper script to guide through service account key setup

ENV=${1:-staging}

if [ "$ENV" = "production" ]; then
  PROJECT_ID="dans-dichter-db"
  KEY_FILE="serviceAccountKey-production.json"
else
  PROJECT_ID="ddd-spark"
  KEY_FILE="serviceAccountKey-staging.json"
fi

echo "🔑 Setting up service account key for $ENV environment"
echo "   Project: $PROJECT_ID"
echo ""

# Check if key already exists
if [ -f "$KEY_FILE" ]; then
  echo "✅ Service account key already exists: $KEY_FILE"
  echo ""
  read -p "Do you want to replace it? (y/N): " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Keeping existing key. Exiting."
    exit 0
  fi
fi

echo "📋 Instructions:"
echo ""
echo "1. Opening Firebase Console in your browser..."
echo "2. Go to: Project Settings → Service Accounts"
echo "3. Click 'Generate new private key'"
echo "4. Save the downloaded file as: $KEY_FILE"
echo ""

# Open Firebase Console in browser
URL="https://console.firebase.google.com/project/$PROJECT_ID/settings/serviceaccounts/adminsdk"
if command -v open &> /dev/null; then
  open "$URL"
elif command -v xdg-open &> /dev/null; then
  xdg-open "$URL"
else
  echo "Open this URL manually: $URL"
fi

echo ""
echo "⏳ Waiting for you to download and save the file..."
echo "   Expected location: $(pwd)/$KEY_FILE"
echo ""
read -p "Press Enter when you've saved the file as $KEY_FILE..."

# Verify the file exists
if [ -f "$KEY_FILE" ]; then
  echo ""
  echo "✅ Service account key found!"
  echo "🔒 Verifying the key is valid JSON..."

  if command -v jq &> /dev/null; then
    PROJECT_FROM_KEY=$(jq -r '.project_id' "$KEY_FILE")
    if [ "$PROJECT_FROM_KEY" = "$PROJECT_ID" ]; then
      echo "✅ Key is valid and matches project: $PROJECT_ID"
    else
      echo "⚠️  Warning: Key project_id ($PROJECT_FROM_KEY) doesn't match expected ($PROJECT_ID)"
    fi
  else
    # Basic JSON validation without jq
    if grep -q '"project_id"' "$KEY_FILE"; then
      echo "✅ Key appears to be valid"
    else
      echo "❌ Error: File doesn't appear to be a valid service account key"
      exit 1
    fi
  fi

  echo ""
  echo "✨ Setup complete! You can now run:"
  echo "   node normalize-genres-admin.js $ENV"
  echo ""
else
  echo ""
  echo "❌ Error: File not found: $KEY_FILE"
  echo "   Please save the downloaded key with this exact filename"
  exit 1
fi
