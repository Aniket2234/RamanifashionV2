#!/bin/bash
# Export secrets to current shell
export WHATSAPP_API_KEY="7RlFwj57xE6wHngTfSmNHA"
export WHATSAPP_PHONE_NUMBER_ID="919970127778"

# Also add to .env for local development
cat > .env << 'ENVEOF'
WHATSAPP_API_KEY=7RlFwj57xE6wHngTfSmNHA
WHATSAPP_PHONE_NUMBER_ID=919970127778
ENVEOF

echo "Environment variables configured"
