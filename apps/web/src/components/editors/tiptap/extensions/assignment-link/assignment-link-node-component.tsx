// EntityCardComponent.tsx
import React, { useCallback, useState } from "react"
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react"
import { ComboBox, ComboBox2, NiceModal } from "@workspace/components-library"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"
import { trpc } from "@/utils/trpc"

export interface AssignmentLinkAttrs {
    label: string
    entityId: string | null
}

export function AssignmentLinkNodeComponent({ node, updateAttributes }: NodeViewProps & {
    data: {
        label: string
        entityId: string
    }
}) {
    console.log("node", node)
    const { label, entityId } = node.attrs.data

    const handleSelectDialog = useCallback(() => {
        console.log("handleSelectDialog")
        NiceModal.show(AssignmentSelectNiceDialog, {
            open: true,
            onClose: () => {
            }
        })
    }, [])

    return (
        <NodeViewWrapper as="div" className="entity-card border rounded p-3 bg-white shadow">
            <div
                className="cursor-pointer text-blue-600 underline"
                onClick={handleSelectDialog}
            >
                {label}
            </div>
        </NodeViewWrapper>
    )
}

type SelectItemType = {
    key: string;
    title: string;
    type: string;
};


const AssignmentSelectNiceDialog = NiceModal.create(
    (args: any) => {
        console.log("args", args)
        const { visible, hide, resolve, } = NiceModal.useModal()

        const handleClose = () => {
            resolve({ reason: 'cancel', data: null });
            hide();
        };

        // const handleSubmit = useCallback((media: Media) => {
        //     resolve({ reason: 'submit', data: media });
        //     hide();
        // }, [hide]);

        const [options, setOptions] = useState<SelectItemType[]>([])
        const [selectedOptions, setSelectedOptions] = useState<SelectItemType | null>(null)
        const updateTags = (options: SelectItemType) => {
            setSelectedOptions(options);
        };
        const trpcUtils = trpc.useUtils()
        const getAssignments = useCallback(async (search: string) => {
            const response = await trpcUtils.lmsModule.courseModule.lesson.searchAssignmentEntities.fetch({
                search: search,
            })
            console.log("data", response)
            const data: SelectItemType[] = [];
            response.assignments.forEach((assignment) => {
                data.push({
                    key: assignment.id,
                    title: assignment.title,
                    type: "assignment",
                })
            })
            response.quizzes.forEach((quiz) => {
                data.push({
                    key: quiz.id.toString(),
                    title: quiz.title,
                    type: "quiz",
                })
            })
            return data;
        }, [])

        return (
            <Dialog open={visible} onOpenChange={(v) => {
                if (!v) {
                    handleClose();
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Select Assignment
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        <ComboBox2<SelectItemType>
                            title="Assignment"
                            valueKey="key"
                            value={selectedOptions || undefined}
                            searchFn={getAssignments}
                            renderText={(book) => `${book.title}`}
                            onChange={updateTags}
                            multiple={false}
                        />
                    </DialogDescription>
                </DialogContent>
            </Dialog>
        )
    }
)