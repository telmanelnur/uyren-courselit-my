import { Control, Field, Message } from "@radix-ui/react-form";
import { Help } from "@workspace/icons";
import { Textarea } from "@workspace/ui/components//textarea";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import React from "react";
import { Tooltip } from ".";

interface MessageItem {
  text: string;
  match:
    | "valueMissing"
    | "valid"
    | "typeMismatch"
    | "tooShort"
    | "tooLong"
    | "stepMismatch"
    | "rangeUnderflow"
    | "rangeOverflow"
    | "patternMismatch"
    | "badInput";
  // | CustomMatcher;
}

export interface FormFieldProps {
  label?: string;
  component?: "input" | "textarea";
  type?:
    | "email"
    | "number"
    | "file"
    | "color"
    | "checkbox"
    | "hidden"
    | "range"
    | "submit"
    | "text"
    | "url"
    | "datetime-local"
    | "date"
    | "password";
  messages?: MessageItem[];
  [key: string]: any;
  name: string;
  className?: string;
  endIcon?: React.ReactNode;
  tooltip?: string;
}

export default function FormField({
  label,
  component = "input",
  type = "text",
  messages,
  className = "",
  endIcon,
  tooltip,
  name,
  ...componentProps
}: FormFieldProps) {
  const Component = component === "input" ? Input : Textarea;

  return (
    <Field className={`flex flex-col ${className}`} name={name}>
      <div className="flex items-baseline justify-between">
        {label && (
          <div className="flex grow items-center gap-1">
            <Label htmlFor={name} className="mb-1 font-semibold">
              {label}
            </Label>
            {tooltip && (
              <Tooltip title={tooltip}>
                <Help />
              </Tooltip>
            )}
          </div>
        )}
        {messages &&
          messages.map((message) => (
            <Message
              key={message.text}
              className="text-xs mb-1"
              match={message.match}
            >
              {message.text}
            </Message>
          ))}
      </div>
      <div className="flex items-center gap-2">
        <Control asChild>
          <Component
            type={type}
            className="outline-none w-full"
            name={name}
            {...componentProps}
          />
        </Control>
        {endIcon}
      </div>
    </Field>
  );
}
