# Install ArgoCD and ArgoCD Image Updater on Docker Desktop Kubernetes
# Run this script in PowerShell as Administrator

# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD pods to be ready
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=180s

# Expose ArgoCD API server locally
Start-Process powershell -ArgumentList 'kubectl port-forward svc/argocd-server -n argocd 8088:443'

# Install ArgoCD CLI (Windows)
Invoke-WebRequest -Uri "https://github.com/argoproj/argo-cd/releases/latest/download/argocd-windows-amd64.exe" -OutFile "$env:USERPROFILE\argocd.exe"
$env:PATH += ";$env:USERPROFILE"

# Install ArgoCD Image Updater
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml

# Wait for Image Updater pod to be ready
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=120s

Write-Host "ArgoCD and ArgoCD Image Updater installed. Access ArgoCD UI at https://localhost:8088"
Write-Host "Default ArgoCD admin password is the name of the argocd-server pod."
