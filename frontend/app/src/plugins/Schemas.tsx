import firebase from "./firebase";

export type UserRole = "admin" | "annotator";

export type FsDate = firebase.firestore.Timestamp;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photo_url: string;
  created_at: FsDate;
  updated_at: FsDate;
}

export type AnnotationType = "card" | "multi_label";

export interface Task {
  id: string;
  annotation_type: AnnotationType;
  title: string;
  question: string;
  description: string;
  created_at: FsDate;
  updated_at: FsDate;
}

export interface Annotation {
  id: string;
  task_id: string;
  data: AnnotationData;
  created_at: FsDate;
  updated_at: FsDate;
}

export interface UserTask {
  id: string;
  user_id: string;
  task_id: string;
  annotation_num: number;
  submitted_num: number;
  created_at: FsDate;
  updated_at: FsDate;
}

export interface UserAnnotation {
  id: string;
  user_id: string;
  annotation_id: string;
  user_task_id: string;
  result_data: AnnotationResult<UserSelect> | null;
  order_index: number;
  created_at: FsDate;
  updated_at: FsDate;
}

export interface UserAnnotationSet {
  userAnnotation: UserAnnotation;
  annotation: Annotation;
}

export type ActionType =
  | "display"
  | "select"
  | "submit"
  | "back"
  | "invalid_submit";

export interface UserAnnotationLog {
  id: string;
  user_task_id: string;
  user_annotation_id: string;
  action_type: ActionType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action_data: any;
  created_at: FsDate;
}

// --- タスク依存系 ---

export type AnnotationData = CardAnnotationData | MultiLabelAnnotationData;

export interface CardAnnotationData {
  text: string;
  baseline_text?: string;
  cand_entity?: string;
  show_ambiguous_button?: boolean;
  question_overwrite?: string;
  yes_button_label?: string;
  no_button_label?: string;
}

export interface MultiLabelAnnotationData {
  text: string;
  choices: string[];
  max_select_num?: number;
  baseline_text?: string;
}

export interface AnnotationResult<T> {
  result: T;
}

export type UserResult = CardResult | MultiLabelResult | PairwiseResult;
export type UserSelect = CardChoice | MultiLabelSelect | PairwiseSelect;

export type CardChoice = "Yes" | "No" | "Ambiguous";
export type CardResult = AnnotationResult<CardChoice>;

export type MultiLabelSelect = string[];
export type MultiLabelResult = AnnotationResult<MultiLabelSelect>;
