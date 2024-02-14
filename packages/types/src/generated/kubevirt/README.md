## Auto generate typescritp types

``` bash
npm i @openapitools/openapi-generator-cli

curl https://raw.githubusercontent.com/kubevirt/kubevirt/main/api/openapi-spec/swagger.json -o swagger.json

npx openapi-generator-cli generate -g typescript-fetch --skip-validate-spec -o $(pwd) -i $(pwd)/swagger.json

rm -rf apis index.ts runtime.ts .openapi-generator*

find ./models -type f -exec sed -i 's/\.\.\/runtime/\.\.\/\.\.\/runtime/g' {} +

echo "export * from './models';" > index.ts
```