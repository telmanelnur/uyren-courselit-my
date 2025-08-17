"use client";

import DashboardContent from "@/components/admin/dashboard-content";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { ClipboardList, FileText, Plus, Users, Target } from "lucide-react";
import Link from "next/link";

export default function LMSPage() {
    const breadcrumbs = [{ label: "LMS", href: "#" }];

    const lmsModules = [
        {
            title: "Quizzes",
            description: "Create and manage interactive quizzes to test student knowledge",
            icon: ClipboardList,
            href: "/dashboard/lms/quizzes",
            stats: {
                total: 0,
                active: 0,
                draft: 0
            }
        },
        {
            title: "Assignments",
            description: "Track student progress with structured assignments and submissions",
            icon: FileText,
            href: "/dashboard/lms/assignments",
            stats: {
                total: 0,
                active: 0,
                overdue: 0
            }
        }
    ];

    return (
        <DashboardContent breadcrumbs={breadcrumbs}>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-semibold">Learning Management System</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your educational content, assessments, and student progress
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {lmsModules.map((module) => (
                        <Card key={module.title} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <module.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle>{module.title}</CardTitle>
                                            <CardDescription>{module.description}</CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-primary">
                                                {module.stats.total}
                                            </div>
                                            <div className="text-muted-foreground">Total</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {module.stats.active}
                                            </div>
                                            <div className="text-muted-foreground">Active</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-orange-600">
                                                {module.stats.draft || module.stats.overdue}
                                            </div>
                                            <div className="text-muted-foreground">
                                                {module.title === "Quizzes" ? "Draft" : "Overdue"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={module.href} className="flex-1">
                                            <Button variant="outline" className="w-full">
                                                View All
                                            </Button>
                                        </Link>
                                        <Link href={`${module.href}/new`}>
                                            <Button size="sm">
                                                <Plus className="h-4 w-4 mr-2" />
                                                New
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">
                                Enrolled across all courses
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0%</div>
                            <p className="text-xs text-muted-foreground">
                                Average across all assessments
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Assessments</CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">
                                Currently active quizzes & assignments
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardContent>
    );
}
