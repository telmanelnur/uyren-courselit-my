import {
  Button,
  Form,
  FormSubmit,
  Select,
  useToast,
} from "@workspace/components-library";
import {
  POPUP_CANCEL_ACTION,
  USER_FILTER_APPLY_BTN,
  USER_FILTER_CATEGORY_TAGGED,
  USER_FILTER_PRODUCT_DOES_NOT_HAVE,
  USER_FILTER_PRODUCT_HAS,
  USER_FILTER_TAGGED_DROPDOWN_LABEL,
} from "@/lib/ui/config/strings";
import React, { useState, useMemo } from "react";
import { DropdownMenuLabel } from "@workspace/ui/components/dropdown-menu";
import { trpc } from "@/utils/trpc";

export default function TaggedFilterEditor({
  onApply,
}: {
  onApply: (...args: any[]) => any;
}) {
  const [condition, setCondition] = useState(USER_FILTER_PRODUCT_HAS);
  const [value, setValue] = useState("");
  const { toast } = useToast();

  // tRPC for tags
  const tagsQuery = trpc.userModule.tag.list.useQuery();
  const tagOptions = useMemo(
    () =>
      (tagsQuery.data || []).map((tag: string) => ({
        label: tag,
        value: tag,
      })),
    [tagsQuery.data],
  );

  const onSubmit = (e: any) => {
    e.preventDefault();
    const buttonName = e.nativeEvent.submitter.name;
    if (buttonName === "apply") {
      onApply({ condition, value });
    } else {
      onApply();
    }
  };

  return (
    <Form className="flex flex-col gap-2 p-2" onSubmit={onSubmit}>
      <DropdownMenuLabel>{USER_FILTER_CATEGORY_TAGGED}</DropdownMenuLabel>
      <Select
        value={condition}
        onChange={setCondition}
        title=""
        options={[
          { label: USER_FILTER_PRODUCT_HAS, value: USER_FILTER_PRODUCT_HAS },
          {
            label: USER_FILTER_PRODUCT_DOES_NOT_HAVE,
            value: USER_FILTER_PRODUCT_DOES_NOT_HAVE,
          },
        ]}
      />
      <Select
        options={tagOptions}
        value={value}
        title=""
        variant="without-label"
        onChange={setValue}
        placeholderMessage={USER_FILTER_TAGGED_DROPDOWN_LABEL}
      />
      <div className="flex justify-between">
        <FormSubmit
          disabled={!value}
          name="apply"
          text={USER_FILTER_APPLY_BTN}
        />
        <Button name="cancel" variant="soft">
          {POPUP_CANCEL_ACTION}
        </Button>
      </div>
    </Form>
  );
}
