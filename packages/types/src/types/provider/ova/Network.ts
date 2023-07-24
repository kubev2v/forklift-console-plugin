import { OvaResource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ova/network.go
export interface OvaNetwork extends OvaResource {
  Description?: string;
}
