{{- define "kharseka.fullname" -}}
{{- .Chart.Name -}}
{{- end -}}

{{- define "kharseka.labels" -}}
app.kubernetes.io/name: {{ include "kharseka.fullname" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
{{- end -}}
