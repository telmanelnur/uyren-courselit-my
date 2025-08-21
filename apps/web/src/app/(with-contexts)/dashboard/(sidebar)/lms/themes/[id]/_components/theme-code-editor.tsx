"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import { Upload, Plus, Trash2, FileText, Code, Image, FileCode, ALargeSmall } from "lucide-react";
import { useThemeContext } from "./theme-context";
import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { useToast } from "@workspace/components-library";

// Simple Monaco-like editor component (you can replace this with actual Monaco editor)
function MonacoEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    return (
        <div className="border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-900">
            <div className="bg-gray-200 dark:bg-gray-800 px-3 py-2 border-b border-gray-300 dark:border-gray-700">
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">CSS</span>
            </div>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-96 p-4 font-mono text-sm bg-transparent border-none outline-none resize-none"
                placeholder="/* Enter your CSS code here */"
            />
        </div>
    );
}

export default function ThemeCodeEditor() {
    const { theme } = useThemeContext();
    
    const [stylesCss, setStylesCss] = useState("");
    const [assets, setAssets] = useState<Array<{
        assetType: "stylesheet" | "font" | "script" | "image";
        url: string;
        preload?: boolean;
        async?: boolean;
        defer?: boolean;
        media?: string;
        crossorigin?: string;
        integrity?: string;
        rel?: string;
        sizes?: string;
        mimeType?: string;
        name?: string;
        description?: string;
    }>>([]);

    const [newAsset, setNewAsset] = useState({
        assetType: "stylesheet" as const,
        url: "",
        name: "",
        description: "",
        preload: false,
    });

    const { toast } = useToast();

    const updateMutation = trpc.lmsModule.themeModule.theme.update.useMutation({
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Theme updated successfully",
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    useEffect(() => {
        if (theme) {
            setStylesCss(theme.stylesCss || "");
            setAssets(theme.assets || []);
        }
    }, [theme]);

    const handleSaveCSS = () => {
        if (!theme?._id) return;
        
        updateMutation.mutate({
            id: `${theme._id}`,
            data: { stylesCss },
        });
    };

    const handleAddAsset = () => {
        if (!newAsset.url.trim()) return;
        
        const asset = {
            ...newAsset,
            rel: newAsset.assetType === "stylesheet" ? "stylesheet" : undefined,
        };
        
        setAssets([...assets, asset]);
        setNewAsset({
            assetType: "stylesheet",
            url: "",
            name: "",
            description: "",
            preload: false,
        });
    };

    const handleRemoveAsset = (index: number) => {
        setAssets(assets.filter((_, i) => i !== index));
    };

    const handleSaveAssets = () => {
        if (!theme?._id) return;
        
        updateMutation.mutate({
            id: `${theme._id}`,
            data: { assets },
        });
    };

    const getAssetIcon = (assetType: string) => {
        switch (assetType) {
            case "stylesheet":
                return <FileCode className="h-4 w-4" />;
            case "font":
                return <ALargeSmall className="h-4 w-4" />;
            case "script":
                return <Code className="h-4 w-4" />;
            case "image":
                return <Image className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Assets Explorer */}
            <div className="lg:col-span-1 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Assets Explorer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Add New Asset */}
                        <div className="space-y-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                            <div className="space-y-2">
                                <Label>Asset Type</Label>
                                <select
                                    value={newAsset.assetType}
                                    onChange={(e) => setNewAsset({ ...newAsset, assetType: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="stylesheet">Stylesheet</option>
                                    <option value="font">Font</option>
                                    <option value="script">Script</option>
                                    <option value="image">Image</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>URL *</Label>
                                <Input
                                    value={newAsset.url}
                                    onChange={(e) => setNewAsset({ ...newAsset, url: e.target.value })}
                                    placeholder="https://example.com/asset.css"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    value={newAsset.name}
                                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                                    placeholder="Asset name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    value={newAsset.description}
                                    onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                                    placeholder="Asset description"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="preload"
                                    checked={newAsset.preload}
                                    onChange={(e) => setNewAsset({ ...newAsset, preload: e.target.checked })}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="preload" className="text-sm">Preload</Label>
                            </div>

                            <Button onClick={handleAddAsset} className="w-full" size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Asset
                            </Button>
                        </div>

                        {/* Assets List */}
                        <div className="space-y-2">
                            <Label>Current Assets ({assets.length})</Label>
                            {assets.length === 0 ? (
                                <div className="text-sm text-muted-foreground text-center py-4">
                                    No assets added yet
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {assets.map((asset, index) => (
                                        <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    {getAssetIcon(asset.assetType)}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium truncate">
                                                            {asset.name || asset.url}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground truncate">
                                                            {asset.url}
                                                        </div>
                                                        {asset.description && (
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                {asset.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveAsset(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {asset.assetType}
                                                </Badge>
                                                {asset.preload && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Preload
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {assets.length > 0 && (
                            <Button onClick={handleSaveAssets} className="w-full" variant="outline">
                                <Upload className="h-4 w-4 mr-2" />
                                Save Assets
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Code Editor */}
            <div className="lg:col-span-2 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Code className="h-5 w-5" />
                                CSS Code Editor
                            </div>
                            <Button onClick={handleSaveCSS} variant="outline" size="sm">
                                <Upload className="h-4 w-4 mr-2" />
                                Save CSS
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MonacoEditor
                            value={stylesCss}
                            onChange={setStylesCss}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>CSS Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            <p>CSS preview functionality will be implemented here to show how the theme looks when applied.</p>
                            <p className="mt-2">Current CSS length: {stylesCss.length} characters</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
