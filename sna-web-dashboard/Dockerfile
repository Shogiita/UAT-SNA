steps:
  # Langkah 1: Build Docker Image untuk Frontend
  - name: "gcr.io/cloud-builders/docker"
    id: "Build-Frontend-Image"
    dir: "sna-web-dashboard"  # <--- TAMBAHKAN BARIS INI
    args:
      - "build"
      - "-t"
      - "gcr.io/$PROJECT_ID/sna-web-dashboard:$SHORT_SHA"
      - "."

  # Langkah 2: Push Docker Image ke Google Container Registry (GCR)
  - name: "gcr.io/cloud-builders/docker"
    id: "Push-Frontend-Image"
    dir: "sna-web-dashboard"  # <--- TAMBAHKAN BARIS INI
    args:
      - "push"
      - "gcr.io/$PROJECT_ID/sna-web-dashboard:$SHORT_SHA"

  # Langkah 3: Deploy ke Cloud Run
  - name: "gcr.io/google.com/cloudsdktool/cloud-sdk"
    id: "Deploy-Frontend-Cloud-Run"
    dir: "sna-web-dashboard"  # <--- TAMBAHKAN BARIS INI
    entrypoint: gcloud
    args:
      - "run"
      - "deploy"
      - "sna-web-dashboard"
      - "--image"
      - "gcr.io/$PROJECT_ID/sna-web-dashboard:$SHORT_SHA"
      - "--region"
      - "asia-southeast2"
      - "--platform"
      - "managed"
      - "--allow-unauthenticated"
      - "--port"
      - "8080"

images:
  - "gcr.io/$PROJECT_ID/sna-web-dashboard:$SHORT_SHA"