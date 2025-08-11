import { Theme, ThemeStyle } from "@workspace/page-models";

export type ThemeWithDraftState = Theme & {
    draftTheme?: ThemeStyle;
};
