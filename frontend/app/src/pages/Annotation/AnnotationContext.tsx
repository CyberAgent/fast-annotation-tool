import { createContext } from "react";
import {
  Task,
  CardChoice,
  UserAnnotationSet,
  MultiLabelSelect,
  ActionType,
} from "../../plugins/Schemas";

interface AnnotationFnProps {
  answer: (
    userAnnotationSet: UserAnnotationSet,
    nextUserAnnotationSet?: UserAnnotationSet
  ) => (input: CardChoice | MultiLabelSelect) => Promise<void>;
  answerCurrent: (input: CardChoice | MultiLabelSelect) => () => Promise<void>;
  goBack: () => void;
}

interface UserAnnotationInfoProps {
  currentUserAnnotationSet: UserAnnotationSet;
  currentOrderIndex: number;
  task: Task;
  userAnnotationSets: UserAnnotationSet[];
  postLog: (actionType: ActionType, actionData: any) => void;
}

export const annotationFnContext = createContext({} as AnnotationFnProps);

export const userAnnotationInfoContext = createContext(
  {} as UserAnnotationInfoProps
);

export interface AnswerAreaHandler {
  onKeyPress: (e: KeyboardEvent) => void;
}
