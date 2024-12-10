export interface TreeNodeData {
  id: string;
  label: string;
  children?: TreeNodeData[];
  expanded: boolean;
  icon: string;
}
