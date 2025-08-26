"use client";

import { trpc } from "@/utils/trpc";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { useAssignmentContext } from "./assignment-context";
import { Settings, Star, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";

export default function AssignmentGrading() {
  const { assignment } = useAssignmentContext();
  const [showRubricBuilder, setShowRubricBuilder] = useState(false);

  const submissionsQuery =
    trpc.lmsModule.assignmentModule.assignmentSubmission.listSubmissions.useQuery(
      {
        filter: {
          assignmentId: assignment?._id,
        },
        pagination: {
          take: 50,
          skip: 0,
        },
      },
    );

  const submissions = submissionsQuery.data?.items || [];
  const gradedCount = submissions.filter((s) => s.status === "graded").length;
  const pendingCount = submissions.filter(
    (s) => s.status === "submitted",
  ).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grading Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{gradedCount}</div>
                <div className="text-sm text-muted-foreground">Graded</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{pendingCount}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Star className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">
                  {assignment?.totalPoints || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Points
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grading Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Rubric</div>
                <div className="text-sm text-muted-foreground">
                  {assignment?.rubric && assignment.rubric.length > 0
                    ? `${assignment.rubric.length} criteria defined`
                    : "No rubric defined"}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowRubricBuilder(!showRubricBuilder)}
              >
                <Settings className="h-4 w-4 mr-2" />
                {assignment?.rubric && assignment.rubric.length > 0
                  ? "Edit"
                  : "Create"}{" "}
                Rubric
              </Button>
            </div>

            {assignment?.rubric && assignment.rubric.length > 0 && (
              <div className="space-y-2">
                {assignment.rubric.map((criterion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{criterion.criterion}</div>
                      {criterion.description && (
                        <div className="text-sm text-muted-foreground">
                          {criterion.description}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline">{criterion.points} pts</Badge>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Late Submission Policy</div>
                <div className="text-sm text-muted-foreground">
                  {assignment?.allowLateSubmission
                    ? `Late penalty: ${assignment.latePenalty}%`
                    : "Late submissions not allowed"}
                </div>
              </div>
              <Badge
                variant={
                  assignment?.allowLateSubmission ? "default" : "secondary"
                }
              >
                {assignment?.allowLateSubmission ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Peer Review</div>
                <div className="text-sm text-muted-foreground">
                  {assignment?.peerReviewEnabled
                    ? "Students can review each other's work"
                    : "Peer review not enabled"}
                </div>
              </div>
              <Badge
                variant={
                  assignment?.peerReviewEnabled ? "default" : "secondary"
                }
              >
                {assignment?.peerReviewEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
