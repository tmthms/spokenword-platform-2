#!/bin/bash

# normalize-genres-auto.sh
# Automated script to normalize genres with temporary Firestore rules
#
# This script will:
# 1. Backup current Firestore rules
# 2. Deploy temporary rules that allow the normalization
# 3. Run the normalization script
# 4. Restore original rules
#
# Usage:
#   ./normalize-genres-auto.sh          # Uses current Firebase project
#   ./normalize-genres-auto.sh staging  # Uses staging (ddd-spark)
#   ./normalize-genres-auto.sh production # Uses production (dans-dichter-db)

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Determine environment
if [ -n "$1" ]; then
  if [ "$1" = "production" ]; then
    echo -e "${YELLOW}⚠️  Switching to PRODUCTION${NC}"
    firebase use dans-dichter-db
  elif [ "$1" = "staging" ]; then
    echo -e "${BLUE}📝 Switching to STAGING${NC}"
    firebase use ddd-spark
  else
    echo -e "${RED}❌ Invalid environment: $1${NC}"
    echo "   Use: staging or production"
    exit 1
  fi
fi

# Get current project
CURRENT_PROJECT=$(firebase use | grep "Active Project:" | awk '{print $3}')
echo -e "${BLUE}🔥 Current Firebase project: $CURRENT_PROJECT${NC}\n"

# Confirm if production
if [ "$CURRENT_PROJECT" = "dans-dichter-db" ]; then
  echo -e "${YELLOW}⚠️  WARNING: You are about to modify PRODUCTION database${NC}"
  read -p "Are you sure you want to continue? (yes/NO): " -r
  if [ "$REPLY" != "yes" ]; then
    echo "Aborted."
    exit 0
  fi
fi

# Step 1: Backup current rules
echo -e "${BLUE}📦 Step 1: Backing up current Firestore rules...${NC}"
cp firestore.rules firestore.rules.backup
echo -e "${GREEN}✅ Backup created: firestore.rules.backup${NC}\n"

# Step 2: Create temporary rules
echo -e "${BLUE}📝 Step 2: Creating temporary Firestore rules...${NC}"
cat > firestore.rules.temp << 'EOF'
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY: Allow all access for genre normalization script
    // This file should NEVER be committed or left deployed
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
EOF

echo -e "${YELLOW}⚠️  Temporary rules created (allows all access)${NC}\n"

# Step 3: Deploy temporary rules
echo -e "${BLUE}🚀 Step 3: Deploying temporary Firestore rules...${NC}"
cp firestore.rules.temp firestore.rules
firebase deploy --only firestore:rules

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to deploy temporary rules${NC}"
  echo -e "${BLUE}📦 Restoring original rules...${NC}"
  cp firestore.rules.backup firestore.rules
  rm -f firestore.rules.temp
  exit 1
fi

echo -e "${GREEN}✅ Temporary rules deployed${NC}\n"

# Step 4: Run normalization script
echo -e "${BLUE}🔄 Step 4: Running genre normalization...${NC}\n"
sleep 2  # Wait for rules to propagate

node normalize-genres-cli.js

NORMALIZATION_EXIT_CODE=$?

# Step 5: Restore original rules (even if normalization failed)
echo -e "\n${BLUE}📦 Step 5: Restoring original Firestore rules...${NC}"
cp firestore.rules.backup firestore.rules
firebase deploy --only firestore:rules

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ CRITICAL: Failed to restore original rules!${NC}"
  echo -e "${YELLOW}⚠️  Manual intervention required:${NC}"
  echo -e "   1. The backup is in: firestore.rules.backup"
  echo -e "   2. Copy it back: cp firestore.rules.backup firestore.rules"
  echo -e "   3. Deploy: firebase deploy --only firestore:rules"
  exit 1
fi

echo -e "${GREEN}✅ Original rules restored${NC}\n"

# Step 6: Cleanup
echo -e "${BLUE}🧹 Step 6: Cleaning up temporary files...${NC}"
rm -f firestore.rules.temp
echo -e "${GREEN}✅ Cleanup complete${NC}\n"

# Final status
if [ $NORMALIZATION_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✨ Genre normalization completed successfully!${NC}"
  echo -e "${GREEN}✅ Original security rules are restored${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  Genre normalization had errors (see above)${NC}"
  echo -e "${GREEN}✅ Original security rules are restored${NC}"
  exit $NORMALIZATION_EXIT_CODE
fi
