"use client";

import React, { useState } from "react";
import { useProfile } from "@/components/contexts/profile-context";
import { useAddress } from "@/components/contexts/address-context";
import DashboardContent from "@/components/admin/dashboard-content";
import dynamic from "next/dynamic";



import "@workspace/text-editor/tiptap/styles/_variables.scss";
import "@workspace/text-editor/tiptap/styles/_keyframe-animations.scss";


const ContentEditor = dynamic(() =>
    import("@workspace/text-editor/tiptap").then((mod) => ({ default: mod.ContentEditor })),
);
// const NotionEditor = dynamic(() =>
//     import("@workspace/text-editor/tiptap").then((mod) => ({ default: mod.NotionEditor })),
// );
// const SimpleEditor = dynamic(() =>
//     import("@workspace/text-editor/tiptap").then((mod) => ({ default: mod.SimpleEditor })),
// );


// Dynamically import UI components
const Card = dynamic(() =>
    import("@workspace/ui/components/card").then((mod) => ({ default: mod.Card })),
);
const CardContent = dynamic(() =>
    import("@workspace/ui/components/card").then((mod) => ({ default: mod.CardContent })),
);
const CardDescription = dynamic(() =>
    import("@workspace/ui/components/card").then((mod) => ({ default: mod.CardDescription })),
);
const CardHeader = dynamic(() =>
    import("@workspace/ui/components/card").then((mod) => ({ default: mod.CardHeader })),
);
const CardTitle = dynamic(() =>
    import("@workspace/ui/components/card").then((mod) => ({ default: mod.CardTitle })),
);
const Button = dynamic(() =>
    import("@workspace/ui/components/button").then((mod) => ({ default: mod.Button })),
);
const Badge = dynamic(() =>
    import("@workspace/ui/components/badge").then((mod) => ({ default: mod.Badge })),
);

// Dynamically import icons
const Edit3 = dynamic(() =>
    import("lucide-react").then((mod) => ({ default: mod.Edit3 })),
);
const FileText = dynamic(() =>
    import("lucide-react").then((mod) => ({ default: mod.FileText })),
);
const Save = dynamic(() =>
    import("lucide-react").then((mod) => ({ default: mod.Save })),
);
const Sparkles = dynamic(() =>
    import("lucide-react").then((mod) => ({ default: mod.Sparkles })),
);

const breadcrumbs = [{ label: "Demo", href: "#" }];

export default function DemoPage() {
    const { profile } = useProfile();
    const { address } = useAddress();
    const [content, setContent] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = () => {
        console.log("Content saved:", content); 
        setIsEditing(false);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    return (
        <DashboardContent breadcrumbs={breadcrumbs}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-semibold mb-2">
                        TipTap Editor Demo
                    </h1>
                    <p className="text-muted-foreground">
                        Experience the new TipTap editor with rich text editing capabilities
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        TipTap Powered
                    </Badge>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Editor Status
                        </CardTitle>
                        <Edit3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isEditing ? "Editing" : "Ready"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {isEditing ? "Make your changes" : "Click edit to start"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Content Length
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {content.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Characters in document
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            User
                        </CardTitle>
                        <div className="h-4 w-4 rounded-full bg-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {profile?.name?.split(" ")[0] || "Guest"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Currently editing
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Editor Card */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Edit3 className="h-5 w-5" />
                                Rich Text Editor
                            </CardTitle>
                            <CardDescription>
                                Use the TipTap simple editor to create and format your content
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            {!isEditing ? (
                                <Button onClick={handleEdit} variant="default">
                                    Start Editing
                                </Button>
                            ) : (
                                <Button onClick={handleSave} className="flex items-center gap-2">
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ContentEditor 
                        // content={content}
                        // onChange={(newContent) => setContent(newContent)}
                        // placeholder="Start writing your content here... Select text and use the AI button for intelligent assistance!"
                        // editable={true}
                        // className="border-0 shadow-none"
                    />
                    {/* <SimpleEditor /> */}
                    {/* <NotionEditor /> */}
                </CardContent>
            </Card>
        </DashboardContent>
    );
}
