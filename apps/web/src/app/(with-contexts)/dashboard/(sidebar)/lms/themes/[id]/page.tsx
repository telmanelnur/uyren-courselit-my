import { Metadata, ResolvingMetadata } from "next";
import { ThemeModel } from "@/models/lms";
import { connectToDatabase } from "@workspace/common-logic";
import ThemeClientWrapper from "./_components/theme-client-wrapper";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;
  const title = id === "new" ? "New Theme" : `Theme ${id}`;
  return {
    title: `${title} | Themes | LMS | ${(await parent)?.title?.absolute}`,
  };
}

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
