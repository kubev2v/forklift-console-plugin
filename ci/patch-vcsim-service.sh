#!/bin/bash

set -ex

FORKLIFT_NAMESPACE=konveyor-forklift
kubectl patch service -n ${FORKLIFT_NAMESPACE} vcsim --type='merge' \
  -p '{"spec":{"type":"NodePort","ports":[{"name":"vcsim","targetPort":8989,"port":8989,"nodePort":30089}]}}'
