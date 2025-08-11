import { LessonType } from "@workspace/common-models";
import {
  File,
  FileText,
  Link,
  QuestionMark,
  Quiz,
  Speaker,
  Text as TextIcon,
  Video,
} from "@workspace/icons";

export default function LessonIcon({ type }: { type: LessonType }) {
  switch (type.toLowerCase() as LessonType) {
    case "video":
      return <Video />;
    case "audio":
      return <Speaker />;
    case "text":
      return <TextIcon />;
    case "pdf":
      return <FileText />;
    case "quiz":
      return <Quiz />;
    case "file":
      return <File />;
    case "embed":
      return <Link />;
    default:
      return <QuestionMark />;
  }
}
