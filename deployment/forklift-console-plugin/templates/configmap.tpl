apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-conf
  namespace: {{ .Values.namespace }}
  labels:
    app: {{ .Values.plugin }}
    app.kubernetes.io/part-of: {{ .Values.plugin }}
data:
  nginx.conf: |
    error_log /dev/stdout info;
    events {}
    http {
      access_log         /dev/stdout;
      include            /etc/nginx/mime.types;
      default_type       application/octet-stream;
      keepalive_timeout  65;
      server {
        listen              9443 ssl;
        ssl_certificate     /var/serving-cert/tls.crt;
        ssl_certificate_key /var/serving-cert/tls.key;
        root                /opt/app-root/src;
      }
    }
