import { ThemeModel } from "@/models/lms";
import { connectToDatabase } from "@workspace/common-logic";
import ThemeClientWrapper from "./_components/theme-client-wrapper";

async function getThemeData(id: string) {
  if (id === "new") {
    return null;
  }

  try {
    await connectToDatabase();
    const theme = await ThemeModel.findById(id).lean();
    return theme
      ? JSON.parse(
          JSON.stringify({
            ...theme,
          }),
        )
      : null;
  } catch (error) {
    console.error("Error fetching theme:", error);
    return null;
  }
}

export default async function EditThemePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const themeId = params.id !== "new" ? params.id : null;
  const initialMode = themeId !== null ? "edit" : "create";
  const initialThemeData = themeId ? await getThemeData(params.id) : null;

  return (
    <ThemeClientWrapper
      initialMode={initialMode}
      initialThemeData={initialThemeData}
    />
  );
}
