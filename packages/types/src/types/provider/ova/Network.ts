import { TypedOvaResource } from './TypedResource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ova/network.go
export interface OvaNetwork extends TypedOvaResource {
  Description?: string;
}
