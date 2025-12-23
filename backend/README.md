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
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/services.yaml
kubectl apply -f k8s/hpa.yaml
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
- Secrets: Set `backend-secrets` values in [k8s/secrets.yaml](backend/k8s/secrets.yaml). Do NOT commit real secrets.
- Media storage: Backed by `uploads-pvc` (2Gi). For production, use cloud object storage (S3/GCS/Azure Blob).
- Postgres: PVC `postgres-pvc` 2Gi.
- HPA: Requires metrics-server installed. On Docker Desktop:
	```powershell
	kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
	```
- Ingress: Install NGINX ingress controller to use [k8s/ingress.yaml](backend/k8s/ingress.yaml) or keep using LoadBalancer/port-forward:
	```powershell
	kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
	```
	Then map `kharseka.local` in your hosts file to 127.0.0.1 and create a TLS secret `kharseka-tls` (self-signed or dev cert).