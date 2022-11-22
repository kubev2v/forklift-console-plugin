apiVersion: v1
kind: Service
metadata:
  annotations:
    service.alpha.openshift.io/serving-cert-secret-name: plugin-serving-cert
  name: {{ .Values.plugin }}
  namespace: {{ .Values.namespace }}
  labels:
    app: {{ .Values.plugin }}
    app.kubernetes.io/component: {{ .Values.plugin }}
    app.kubernetes.io/instance: {{ .Values.plugin }}
    app.kubernetes.io/part-of: {{ .Values.plugin }}
spec:
  ports:
    - name: 9443-tcp
      protocol: TCP
      port: 9443
      targetPort: 9443
  selector:
    app: {{ .Values.plugin }}
  type: ClusterIP
  sessionAffinity: None
