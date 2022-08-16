apiVersion: console.openshift.io/v1alpha1
kind: ConsolePlugin
metadata:
  name: {{ .Values.plugin }}
  annotations:
    console.openshift.io/use-i18n: "true" 
spec:
  displayName: 'Console Plugin Template'
  service:
    name: {{ .Values.plugin }}
    namespace: {{ .Release.Namespace }}
    port: 9443
    basePath: '/'
  proxy:
    - type: Service
      alias: forklift-inventory
      authorize: true
      service:
        name: forklift-inventory
        namespace: {{ .Values.forkliftNamespace }}
        port: 8443
    - type: Service
      alias: forklift-must-gather-api
      authorize: true
      service:
        name: forklift-must-gather-api
        namespace: {{ .Values.forkliftNamespace }}
        port: 8443
