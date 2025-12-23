$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot

Write-Host 'Building images...'
docker build -t auth-service:local services/auth-service
docker build -t listings-service:local services/listings-service
docker build -t favorites-service:local services/favorites-service
docker build -t media-service:local services/media-service
docker build -t api-gateway:local gateway

Write-Host 'Applying Kubernetes manifests...'
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/services.yaml

Write-Host 'Done. Check services with: kubectl get svc'
Pop-Location
