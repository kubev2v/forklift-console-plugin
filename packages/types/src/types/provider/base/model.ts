// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/model/base/model.go

// An object reference.
export interface Ref {
  // The kind (type) of the referenced.
  // Kind string `json:"kind"`
  kind: string;
  // The ID of object referenced.
  // ID string `json:"id"`
  id: string;
}

// VM concerns.
export interface Concern {
  // Label      string `json:"label"`
  label: string;
  // 'Warning' | 'Critical' | 'Information' | 'Advisory'
  // Category   string `json:"category"`
  category: string;
  // Assessment string `json:"assessment"`
  assessment: string;
}
