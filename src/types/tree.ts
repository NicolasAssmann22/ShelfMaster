export interface TreeNodeData {
  id: string;
  label: string;
  children?: TreeNodeData[];
  expanded: boolean;
  highlighted: boolean
  icon: string;
}
