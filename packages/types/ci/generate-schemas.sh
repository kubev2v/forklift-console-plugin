#!/usr/bin/env bash

set -euo pipefail
script_dir=$(realpath $(dirname "$0"))

# Try to make a schema directory 
mkdir -p "${script_dir}/../schemas"

# Generate JSON schema files for forklift k8s models
modelTypes=(
    "V1beta1Hook"
    "V1beta1Host"
    "V1beta1Migration"
    "V1beta1NetworkMap"
    "V1beta1OvirtVolumePopulator"
    "V1beta1Plan"
    "V1beta1Provider"
    "V1beta1StorageMap")

for type in ${modelTypes[*]}; do
    echo "generating: ${type}.schema.json"
    npx ts-json-schema-generator \
        --path "${script_dir}/../src/models/*.ts" \
        --type ${type} \
        --out ${script_dir}/../schemas/${type}.schema.json
done

# Generate JSON schema files for forklift inventory
inventoryTypes=(
    "ProviderSecret"
)

for type in ${inventoryTypes[*]}; do
    echo "generating: ${type}.schema.json"
    npx ts-json-schema-generator \
        --path "${script_dir}/../src/types/*.ts" \
        --type ${type} \
        --out ${script_dir}/../schemas/${type}.schema.json
done


