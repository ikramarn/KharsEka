# Backend Microservices (Local Kubernetes on Docker Desktop)

Services:
- api-gateway (port 80 via LoadBalancer)
- auth-service (users, JWT auth)
- listings-service (listings CRUD)
- favorites-service (favorites per user)
- media-service (image upload, static serving)
- postgres (DB)

## Build images and deploy

1) Build images with :local tag

```powershell
# From backend/ directory
$ErrorActionPreference = 'Stop'
$root = (Get-Location)

 docker build -t auth-service:local services/auth-service
 docker build -t listings-service:local services/listings-service
 docker build -t favorites-service:local services/favorites-service
 docker build -t media-service:local services/media-service
 docker build -t api-gateway:local gateway
```

2) Enable Kubernetes in Docker Desktop. Then apply manifests:

```powershell
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/services.yaml
```

3) Get gateway endpoint:
- Docker Desktop exposes LoadBalancer as localhost. Check:
```powershell
kubectl get svc api-gateway
```
- If EXTERNAL-IP is pending, use a NodePort fallback:
```powershell
kubectl port-forward svc/api-gateway 8080:80
```
Then your base URL is http://localhost:8080

4) Verify health:
```powershell
curl http://localhost:8080/healthz
```

## Notes
- JWT secret is set to `devsecret` in manifests. Change for production.
- Media uploads are stored in an ephemeral volume (EmptyDir). For production, back by a PersistentVolume or S3-compatible storage.
- Postgres has a 2Gi PVC.