import {
    COURSE_TYPE_COURSE,
    COURSE_TYPE_DOWNLOAD,
} from "@/lib/ui/config//constants";
import {
    BTN_CONTINUE,
    BTN_NEW_PRODUCT,
    BUTTON_CANCEL_TEXT,
    FORM_NEW_PRODUCT_MENU_COURSE_SUBTITLE,
    FORM_NEW_PRODUCT_MENU_DOWNLOADS_SUBTITLE,
    FORM_NEW_PRODUCT_TITLE_PLC,
    FORM_NEW_PRODUCT_TYPE,
    TOAST_TITLE_ERROR,
} from "@/lib/ui/config/strings";
import { capitalize } from "@/lib/ui/lib/utils";
import { trpc } from "@/utils/trpc";
import { CourseType } from "@workspace/common-models";
import {
    Button,
    Form,
    FormField,
    Link,
    Select,
    useToast,
} from "@workspace/components-library";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";


export function NewProduct() {
    const [title, setTitle] = useState("");
    const [type, setType] = useState<CourseType>(COURSE_TYPE_COURSE);
    const router = useRouter();
    const { toast } = useToast();

    const createCourseMutation = trpc.lmsModule.courseModule.course.create.useMutation();

    const createCourse = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await createCourseMutation.mutateAsync({
                data: {
                    title,
                    type,
                },
            });
            if (response) {
                router.replace(
                    `/dashboard/product/${response.courseId}`,
                );
            }
        } catch (err: any) {
            toast({
                title: TOAST_TITLE_ERROR,
                description: err.message,
                variant: "destructive",
            });
        }
    };

    const loading = createCourseMutation.isPending;

    return (
        <div className="flex flex-col">
            <div className="flex flex-col">
                <h1 className="text-4xl font-semibold mb-4">
                    {BTN_NEW_PRODUCT}
                </h1>
                <Form onSubmit={createCourse} className="flex flex-col gap-4">
                    <FormField
                        required
                        label="Title"
                        name="title"
                        value={title}
                        onChange={(e: any) => setTitle(e.target.value)}
                        placeholder={FORM_NEW_PRODUCT_TITLE_PLC}
                    />
                    <Select
                        title={FORM_NEW_PRODUCT_TYPE}
                        value={type}
                        onChange={(e) => setType(e)}
                        options={[
                            {
                                label: capitalize(COURSE_TYPE_COURSE),
                                value: COURSE_TYPE_COURSE,
                                sublabel: FORM_NEW_PRODUCT_MENU_COURSE_SUBTITLE,
                            },
                            {
                                label: capitalize(COURSE_TYPE_DOWNLOAD),
                                value: COURSE_TYPE_DOWNLOAD,
                                sublabel:
                                    FORM_NEW_PRODUCT_MENU_DOWNLOADS_SUBTITLE,
                            },
                        ]}
                    />
                    <div className="flex gap-2">
                        <Button
                            disabled={
                                !title ||
                                !type ||
                                (!!title && !!type && loading)
                            }
                            onClick={createCourse}
                            sx={{ mr: 1 }}
                        >
                            {BTN_CONTINUE}
                        </Button>
                        <Link href="/dashboard/products">
                            <Button variant="soft">{BUTTON_CANCEL_TEXT}</Button>
                        </Link>
                    </div>
                </Form>
            </div>
        </div>
    );
}