import { Node, Edge } from 'reactflow';

export type SystemType = 'flow' | 'database' | 'infographic' | 'api';

export interface FlowVersion {
  id: string;
  version: number;
  createdAt: string | Date;
  snapshot: {
    nodes: Node[];
    edges: Edge[];
  };
  message: string;
}

export type NodeSource = 'core' | 'plugin' | 'ai_generated' | 'custom';

export type DataType = 'uuid' | 'integer' | 'string' | 'text' | 'boolean' | 'timestamp' | 'datetime' | 'decimal' | 'json';

export interface ColumnDefinition {
  id: string;
  name: string;
  type: DataType;
  isPrimary: boolean;
  isNullable: boolean;
  isUnique: boolean;
  defaultValue?: string | null;
  comment?: string;
}

export interface TableDefinition {
  id: string;
  name: string;
  columns: ColumnDefinition[];
}

export interface RelationDefinition {
  id: string;
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  type: 'one_to_one' | 'one_to_many' | 'many_to_many';
}

export interface DatabaseAST {
  tables: TableDefinition[];
  relations: RelationDefinition[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: {
    target: string;
    message: string;
    severity: 'error' | 'warning';
  }[];
}

export type PropertyType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'select' 
  | 'multiselect' 
  | 'code' 
  | 'json' 
  | 'header_list' 
  | 'query_params'
  | 'column_list'
  | 'nested_object';

export interface PropertyValidation {
  required?: boolean;
  min?: number;
  max?: number;
  regex?: string;
  custom?: (value: any, allValues: any) => string | undefined;
}

export interface PropertyDependency {
  property: string;
  equals?: any;
  notEquals?: any;
  includes?: any;
}

export interface PropertyDefinition {
  id: string;
  label: string;
  type: PropertyType;
  description?: string;
  placeholder?: string;
  defaultValue?: any;
  options?: { label: string; value: any }[]; // For select/multiselect
  validation?: PropertyValidation;
  dependency?: PropertyDependency;
  group?: string;
  icon?: string;
}

export interface RegistryNode {
  type: string;
  label: string;
  icon: any;
  description: string;
  category: string;
  color: string;
  source: NodeSource;
  version?: string;
  properties?: PropertyDefinition[];
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  nodes: RegistryNode[];
  version: string;
  author: string;
  isInstalled: boolean;
  installCount: number;
}

export interface RegistryCategory {
  id: string;
  label: string;
  nodes: RegistryNode[];
}

export interface VisualProject {
  id: number;
  workspaceId: number;
  tenantId: string;
  userUid: string;
  name: string;
  type: SystemType;
  currentVersion: number;
  versions: FlowVersion[];
  flowJson: {
    nodes: Node[];
    edges: Edge[];
    viewport?: {
      x: number;
      y: number;
      zoom: number;
    };
  };
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Backward compatibility
export type Flow = VisualProject;

export type NodeType = string;
// Keeping specific types for documentation/reference
export type KnownNodeType = 
  | 'start' | 'action' | 'condition' | 'end' | 'api' | 'webhook' | 'email' | 'prompt'
  | 'table' | 'column' | 'relation'
  | 'block' | 'step' | 'arrow' | 'icon'
  | 'endpoint' | 'request' | 'response' | 'http_request' | 'auth' | 'retry' | 'query' | 'loop';

export interface NodeData {
  label: string;
  type: NodeType;
  config: Record<string, any>;
  // Metadata generated during simulation/validation
  errors?: Record<string, string>;
  isProcessing?: boolean;
  lastRun?: {
    status: 'success' | 'error';
    timestamp: string;
    duration: string;
    result?: any;
  };
  [key: string]: any; // Allow legacy properties
}
