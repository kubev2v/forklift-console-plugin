# Create Service Account with bearer token

Kubernetes can use bearer tokens for authenticaion, for development we may need to create
service accounts with different roles and use bearer tokens to access them.

Example:

``` bash
# get pods using a bearer token 
curl -k -H "Authorization: Bearer very-secret-token" 'https://api.k8s.server.org:6443/api/v1/namespaces/default/pods'
```

We will create a service account with a token we can use to authenticate to the API servers, and then
add permissions to that service account and token.

## Authenticate using a token

### Create an account with a token

``` bash
export SERVICE_ACCOUNT=forklift-user
export NAMESPACE=default

cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ${SERVICE_ACCOUNT}
  namespace: ${NAMESPACE}
automountServiceAccountToken: true
EOF

cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: ${SERVICE_ACCOUNT}
  namespace: ${NAMESPACE}
  annotations:
    kubernetes.io/service-account.name: ${SERVICE_ACCOUNT}
type: kubernetes.io/service-account-token
EOF
```

### Create some roles

We can use some pre-defined roles, like `cluster-admin` and `cluster-reader`, we can
also create some custom roles, each role is a set of permissions a cluster admin can bind and un-bind to our account.

See kubernetes [documentation](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)

``` bash
cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: forklift-reader
rules:
- apiGroups: ["forklift.konveyor.io"]
  resources: ["*"]
  verbs: ["get", "watch", "list"]
EOF

cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: forklift-admin
rules:
- apiGroups: ["forklift.konveyor.io"]
  resources: ["*"]
  verbs: ["*"]
EOF
```

### Bind a role to our account

``` bash
cat <<EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: ${SERVICE_ACCOUNT}-forklift-reader
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: forklift-reader
subjects:
- kind: ServiceAccount
  name: ${SERVICE_ACCOUNT}
  namespace: ${NAMESPACE}
EOF

# or use the short-hand
kubectl create clusterrolebinding ${SERVICE_ACCOUNT}-forklift-reader \
  --clusterrole=forklift-reader \
  --serviceaccount=${NAMESPACE}:${SERVICE_ACCOUNT}

# to un-bind the role, delete the object
kubectl delete clusterrolebindings ${SERVICE_ACCOUNT}-forklift-reader
```

Now we can use the token to authenticate when calling kubernetes API:

``` bash
# using admin account get the token assigned to our account
export TOKEN=$(kubectl get secret ${SERVICE_ACCOUNT} -n ${NAMESPACE} -o=jsonpath={.data.token} | base64 -d)

# This examples use curl to call the API serve and authenticate using our token

# get pods
curl -k -H "Authorization: Bearer ${TOKEN}" 'https://127.0.0.1:6443/api/v1/namespaces/default/pods'

# get providers
curl -k -H "Authorization: Bearer ${TOKEN}" 'https://127.0.0.1:6443/apis/forklift.konveyor.io/v1beta1/namespaces/default/providers
```

## Create a user

Sometimes it is useful to use a user instead of a service account.

## Create a certification request

To create a user authentication, a user can create a certificate signing request (.csr) and use
a cluster admin account to sign it. Once the request is approved, a user get a signed certificate
that can be used to authenticate the user.

The key and signed certificate should be added into the kubeconfig file as a user, and then in the context
section, connect the user to the cluster. 

``` bash
export USER=test

# create a csr file for our user
openssl genrsa -out ca.key 2048
openssl req -new -key ca.key -out ca.csr --subj "/CN=${USER}"

## ask for a signed certificate
cat <<EOF | kubectl apply -f -
apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  name: test
spec:
  request: $(cat ca.csr | base64 | tr -d "\n")
  signerName: kubernetes.io/kube-apiserver-client
  expirationSeconds: 31104000  # 360 days
  usages:
  - client auth
EOF

# check the status of our request
kubectl get csr

# as admin user, sign the request
kubectl certificate approve test

# get the signed certificate
kubectl get csr test -o=jsonpath={.status.certificate} | base64 -d > ca.crt
```
