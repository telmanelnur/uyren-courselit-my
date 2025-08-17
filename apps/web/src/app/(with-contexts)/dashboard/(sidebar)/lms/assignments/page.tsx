"use client";

import DashboardContent from "@/components/admin/dashboard-content";
import { SkeletonCard } from "@/components/skeleton-card";
import { Button } from "@workspace/ui/components/button";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import { 
    ContentCard,
    ContentCardContent,
    ContentCardHeader,
    ContentCardImage,
} from "@workspace/components-library";
import { Badge } from "@workspace/ui/components/badge";
import { FileText, Plus, Search, Calendar, Users } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import Link from "next/link";

const ITEMS_PER_PAGE = 9;

function AssignmentCard({ assignment }: { assignment: any }) {
    return (
        <ContentCard href={`/dashboard/lms/assignments/${assignment.id}`}>
            <ContentCardImage
                src={assignment.featuredImage?.url || "/courselit_backdrop_square.webp"}
                alt={assignment.title}
            />
            <ContentCardContent>
                <ContentCardHeader>{assignment.title || "Untitled Assignment"}</ContentCardHeader>
                <div className="flex items-center justify-between gap-2 mb-4">
                    <Badge variant="outline">
                        <FileText className="h-4 w-4 mr-1" />
                        Assignment
                    </Badge>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {assignment.dueDate || "No due date"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{assignment.submissionsCount || 0} submissions</span>
                    </div>
                </div>
            </ContentCardContent>
        </ContentCard>
    );
}

function SkeletonGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </div>
    );
}

export default function AssignmentsPage() {
    const breadcrumbs = [{ label: "LMS", href: "#" }, { label: "Assignments", href: "#" }];

    return (
        <DashboardContent breadcrumbs={breadcrumbs}>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-4xl font-semibold">Assignments</h1>
                    <Link href="/dashboard/lms/assignments/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Assignment
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search assignments..."
                            className="pl-10"
                        />
                    </div>
                    <Select defaultValue="all">
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <SkeletonGrid />

                <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
                    <p className="mb-4">Create your first assignment to track student progress</p>
                    <Link href="/dashboard/lms/assignments/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Assignment
                        </Button>
                    </Link>
                </div>
            </div>
        </DashboardContent>
    );
}
