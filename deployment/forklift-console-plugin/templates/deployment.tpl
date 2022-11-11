apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Values.plugin }}
  namespace: {{ .Values.namespace }}
  labels:
    app: {{ .Values.plugin }}
    app.kubernetes.io/component: {{ .Values.plugin }}
    app.kubernetes.io/instance: {{ .Values.plugin }}
    app.kubernetes.io/part-of: {{ .Values.plugin }}
    app.openshift.io/runtime-namespace: {{ .Values.namespace }}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: {{ .Values.plugin }}
  template:
    metadata:
      labels:
        app: {{ .Values.plugin }}
    spec:
      containers:
        - name: {{ .Values.plugin }}
          image: {{ .Values.image }}
          ports:
            - containerPort: 9443
              protocol: TCP
          imagePullPolicy: Always
          resources:
              requests:
                cpu: 10m
                memory: 50Mi
          volumeMounts:
            - name: plugin-serving-cert
              readOnly: true
              mountPath: /var/serving-cert
            - name: nginx-conf
              readOnly: true
              mountPath: /etc/nginx/nginx.conf
              subPath: nginx.conf
      volumes:
        - name: plugin-serving-cert
          secret:
            secretName: plugin-serving-cert
            defaultMode: 420
        - name: nginx-conf
          configMap:
            name: nginx-conf
            defaultMode: 420
      restartPolicy: Always
      dnsPolicy: ClusterFirst
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 25%
      maxSurge: 25%
