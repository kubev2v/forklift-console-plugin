apiVersion: console.openshift.io/v1alpha1
kind: ConsolePlugin
metadata:
  name: {{ .Values.plugin }}
  annotations:
    console.openshift.io/use-i18n: "true"
spec:
  displayName: 'Console Plugin for Forklift'
  service:
    name: {{ .Values.plugin }}
    namespace: {{ .Values.namespace }}
    port: 9443
    basePath: '/'
  proxy:
    - type: Service
      alias: forklift-must-gather-api
      authorize: true
      service:
        name: forklift-must-gather-api
        namespace: {{ .Values.forklift.namespace }}
        port: 8443
    - type: Service
      alias: forklift-inventory
      authorize: true
      service:
        name: forklift-inventory
        namespace: {{ .Values.forklift.namespace }}
        port: 8443
