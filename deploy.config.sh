# Deploy configuration (NON-SECRET — safe to commit).
# Secrets (SSH key, API keys) never live here.
# The other developer edits nothing here; they only run `npm run deploy:setup` once.

SERVER_HOST="109.199.106.116"
SERVER_USER="root"
SERVER_PATH="/opt/vipmotors-landing"   # git checkout on the server
HEALTH_URL="https://vipmotors.az/"      # curl'd after deploy; must return 200
LOCAL_BRANCH="main"                      # branch that gets deployed
