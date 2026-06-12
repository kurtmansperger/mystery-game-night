#!/usr/bin/env bash
# One-time GCP bootstrap for Mystery Game Night (docs/07-gcp-deployment.md).
# Idempotent — safe to re-run. Requires: gcloud authenticated as a project
# owner, billing already linked to the project.
#
# Usage:
#   ANTHROPIC_API_KEY=sk-ant-... ./infra/setup.sh PROJECT_ID [REGION] [GITHUB_REPO]
#
# Prints the four values to put in GitHub → Settings → Secrets and variables
# → Actions → Variables when it finishes.

set -euo pipefail

PROJECT_ID="${1:?usage: setup.sh PROJECT_ID [REGION] [GITHUB_REPO]}"
REGION="${2:-us-central1}"
GITHUB_REPO="${3:-kurtmansperger/mystery-game-night}"

WEB_SA="mgn-web@${PROJECT_ID}.iam.gserviceaccount.com"
GEN_SA="mgn-generator@${PROJECT_ID}.iam.gserviceaccount.com"
TASKS_SA="mgn-tasks@${PROJECT_ID}.iam.gserviceaccount.com"
DEPLOYER_SA="mgn-deployer@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud config set project "$PROJECT_ID"
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')

echo "==> Enabling APIs"
gcloud services enable \
  run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com \
  firestore.googleapis.com secretmanager.googleapis.com cloudtasks.googleapis.com \
  iamcredentials.googleapis.com sts.googleapis.com

echo "==> Firestore (Native mode)"
gcloud firestore databases create --location="$REGION" 2>/dev/null \
  || echo "    (database already exists)"

echo "==> Anthropic key -> Secret Manager"
if ! gcloud secrets describe anthropic-api-key >/dev/null 2>&1; then
  printf '%s' "${ANTHROPIC_API_KEY:?set ANTHROPIC_API_KEY in the environment}" \
    | gcloud secrets create anthropic-api-key --data-file=-
else
  echo "    (secret already exists — add a new version manually to rotate)"
fi

echo "==> Service accounts"
for NAME in mgn-web mgn-generator mgn-tasks mgn-deployer; do
  gcloud iam service-accounts create "$NAME" --display-name="$NAME" 2>/dev/null \
    || echo "    ($NAME already exists)"
done

echo "==> Runtime IAM"
# Web: Firestore, enqueue tasks, read the key (refinement runs in-request), act-as tasks SA for OIDC tasks
gcloud projects add-iam-policy-binding "$PROJECT_ID" --member="serviceAccount:$WEB_SA" --role=roles/datastore.user -q >/dev/null
gcloud projects add-iam-policy-binding "$PROJECT_ID" --member="serviceAccount:$WEB_SA" --role=roles/cloudtasks.enqueuer -q >/dev/null
gcloud secrets add-iam-policy-binding anthropic-api-key --member="serviceAccount:$WEB_SA" --role=roles/secretmanager.secretAccessor -q >/dev/null
gcloud iam service-accounts add-iam-policy-binding "$TASKS_SA" --member="serviceAccount:$WEB_SA" --role=roles/iam.serviceAccountUser -q >/dev/null
# Generator: Firestore + the key
gcloud projects add-iam-policy-binding "$PROJECT_ID" --member="serviceAccount:$GEN_SA" --role=roles/datastore.user -q >/dev/null
gcloud secrets add-iam-policy-binding anthropic-api-key --member="serviceAccount:$GEN_SA" --role=roles/secretmanager.secretAccessor -q >/dev/null
# (mgn-tasks gets run.invoker on the generator service from the deploy workflow,
#  after the service first exists.)

echo "==> Cloud Tasks queue"
gcloud tasks queues create generation --location="$REGION" 2>/dev/null \
  || echo "    (queue already exists)"
gcloud tasks queues update generation --location="$REGION" \
  --max-attempts=2 --min-backoff=60s --max-concurrent-dispatches=5 -q >/dev/null

echo "==> Workload Identity Federation for GitHub Actions"
gcloud iam workload-identity-pools create github-pool --location=global \
  --display-name="GitHub Actions" 2>/dev/null || echo "    (pool already exists)"
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location=global --workload-identity-pool=github-pool \
  --display-name="GitHub OIDC" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='${GITHUB_REPO}'" 2>/dev/null \
  || echo "    (provider already exists)"

WIF_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/providers/github-provider"
gcloud iam service-accounts add-iam-policy-binding "$DEPLOYER_SA" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/attribute.repository/${GITHUB_REPO}" \
  --role=roles/iam.workloadIdentityUser -q >/dev/null

echo "==> Deployer IAM (source deploys via Cloud Build)"
for ROLE in roles/run.admin roles/cloudbuild.builds.editor roles/artifactregistry.admin \
            roles/storage.admin roles/iam.serviceAccountUser roles/serviceusage.serviceUsageConsumer; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" --member="serviceAccount:$DEPLOYER_SA" --role="$ROLE" -q >/dev/null
done

cat <<EOF

✅ Bootstrap complete. Add these as *repository variables* in GitHub
   (Settings → Secrets and variables → Actions → Variables):

   GCP_PROJECT_ID   = ${PROJECT_ID}
   GCP_REGION       = ${REGION}
   GCP_WIF_PROVIDER = ${WIF_PROVIDER}
   GCP_DEPLOYER_SA  = ${DEPLOYER_SA}

Then run the "Deploy to Cloud Run" workflow (or push to main).
EOF
