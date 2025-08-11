import { Submit } from "@radix-ui/react-form";
import { ReactNode } from "react";
import { Button2 } from ".";

interface FormSubmitProps {
  text: ReactNode;
  [key: string]: any;
}

export default function FormSubmit({ text, ...other }: FormSubmitProps) {
  return (
    <Submit asChild>
      <Button2 {...other}>{text}</Button2>
    </Submit>
  );
}
