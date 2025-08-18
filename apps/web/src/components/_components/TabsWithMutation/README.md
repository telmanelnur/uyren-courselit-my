# Tabs With Mutation Components

This package provides a set of components for creating tabbed interfaces with integrated mutation handling.

## Components

### TabsWithMutation

A tabbed interface component that handles tab switching and content rendering.

```tsx
import { TabsWithMutation } from "@/components/_components";

const tabs = [
  {
    id: "tab1",
    label: "Tab 1",
    content: <div>Tab 1 content</div>
  },
  {
    id: "tab2",
    label: "Tab 2",
    content: <div>Tab 2 content</div>
  }
];

<TabsWithMutation 
  tabs={tabs} 
  defaultTabId="tab1" 
  onChange={(tabId) => console.log(`Tab changed to ${tabId}`)}
/>
```

### TabContent

A component for rendering tab content with loading and error states.

```tsx
import { TabContent } from "@/components/_components";

<TabContent 
  isLoading={isLoading}
  error={error?.message}
  onRetry={handleRetry}
>
  <div>Your tab content here</div>
</TabContent>
```

### TabForm

A form component for tab content with submit and cancel actions.

```tsx
import { TabForm } from "@/components/_components";

<TabForm
  onSubmit={handleSubmit}
  isLoading={isLoading}
  isValid={isFormValid}
  submitLabel="Save Changes"
  onCancel={handleCancel}
>
  <div>Your form fields here</div>
</TabForm>
```

### useTabMutation

A custom hook for handling mutations within tabs.

```tsx
import { useTabMutation } from "@/components/_components";

const mutation = useTabMutation(
  async (data) => {
    // Perform your API call or mutation here
    const response = await api.updateData(data);
    return response;
  },
  {
    onSuccess: (data) => {
      console.log("Success!", data);
    },
    onError: (error) => {
      console.error("Error:", error);
    }
  }
);

// Use the mutation
const handleSubmit = async (e) => {
  e.preventDefault();
  await mutation.mutate({ id: 1, name: "Example" });
};
```

## Integration with tRPC

These components work well with tRPC mutations. Here's an example:

```tsx
import { trpc } from "@/utils/trpc";
import { TabForm, TabContent } from "@/components/_components";

// Using tRPC mutation
const updateMutation = trpc.someModule.update.useMutation({
  onSuccess: () => {
    // Handle success
  }
});

// In your component
<TabContent isLoading={updateMutation.isLoading}>
  <TabForm
    onSubmit={(e) => {
      e.preventDefault();
      updateMutation.mutate({ id: 1, data: formData });
    }}
    isLoading={updateMutation.isLoading}
  >
    {/* Form fields */}
  </TabForm>
</TabContent>
```

## Examples

Check out the example implementations in the `example` directory:

1. `ProfileTabs.tsx` - A profile settings UI with multiple tabs
2. `SettingsTabs.tsx` - A site settings UI with form state management

## Benefits

- Clean separation of concerns between tabs
- Consistent loading and error states
- Reusable form components
- Integrated mutation handling
- Type-safe APIs
