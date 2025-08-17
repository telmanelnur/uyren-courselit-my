import { mergeAttributes, Node, ReactNodeViewRenderer } from "@tiptap/react"
import { AssignmentLinkAttrs, AssignmentLinkNodeComponent } from "./assignment-link-node-component"

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        assignmentLink: {
            insertAssignmentLink: (attrs: AssignmentLinkAttrs) => ReturnType
        }
    }
}

export const AssignmentLinkNodeExtension = Node.create({
    name: "assignmentLink",
    group: "block",
    atom: true, // self-contained

    addAttributes() {
        return {
          data: {
            default: {} as AssignmentLinkAttrs,
            parseHTML: (element) => {
              try {
                return JSON.parse(element.getAttribute("data-json") || "{}")
              } catch {
                return {}
              }
            },
            renderHTML: (attrs) => ({
              "data-json": JSON.stringify(attrs.data ?? {}),
            }),
          },
        }
      },

    parseHTML() {
        return [{ tag: "assignment-link" }]
    },

    renderHTML({ HTMLAttributes }) {
        return ["assignment-link", mergeAttributes(HTMLAttributes)]
    },

    addNodeView() {
        return ReactNodeViewRenderer(AssignmentLinkNodeComponent as any)
    },

    addCommands() {
        return {
            insertAssignmentLink: (options) => ({ commands }) => {
                return commands.insertContent({
                    type: "assignmentLink",
                    attrs: {
                        data: options,
                    },
                })
            }
        }
    }
})
