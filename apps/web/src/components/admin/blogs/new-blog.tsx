import {
    BTN_CONTINUE,
    BTN_NEW_BLOG,
    BUTTON_CANCEL_TEXT,
    FORM_NEW_PRODUCT_TITLE_PLC,
    TOAST_TITLE_ERROR,
    TOAST_TITLE_SUCCESS
} from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import { Constants } from "@workspace/common-models";
import {
    Button,
    Form,
    FormField,
    useToast,
} from "@workspace/components-library";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";


function NewBlog() {
    const [title, setTitle] = useState("");
    const router = useRouter();
    const { toast } = useToast();

    const createCourseMutation = trpc.lmsModule.courseModule.course.create.useMutation({
        onSuccess: (response) => {
            toast({
                title: TOAST_TITLE_SUCCESS,
                description: "Course created successfully",
            });
            router.replace(`/dashboard/blog/${response.courseId}`);
        },
        onError: (error) => {
            toast({
                title: TOAST_TITLE_ERROR,
                description: error.message,
            });
        },
    });

    const createCourse = async (e: FormEvent) => {
        e.preventDefault();
        createCourseMutation.mutate({
            data: {
                title,
                type: Constants.CourseType.BLOG,
            },
        });
    };

    const loading = createCourseMutation.isPending;

    return (
        <div className="flex flex-col">
            <div className="flex flex-col">
                <h1 className="text-4xl font-semibold mb-4">{BTN_NEW_BLOG}</h1>
                <Form onSubmit={createCourse} className="flex flex-col gap-4">
                    <FormField
                        required
                        label="Title"
                        name="title"
                        value={title}
                        onChange={(e: any) => setTitle(e.target.value)}
                        placeholder={FORM_NEW_PRODUCT_TITLE_PLC}
                    />
                    <div className="flex gap-2">
                        <Button
                            disabled={!title || (!!title && loading)}
                            onClick={createCourse}
                        >
                            {BTN_CONTINUE}
                        </Button>
                        <Link href={`/dashboard/blogs`} legacyBehavior>
                            <Button variant="soft">{BUTTON_CANCEL_TEXT}</Button>
                        </Link>
                    </div>
                </Form>
            </div>
        </div>
    );
}

export default NewBlog;