"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Switch } from "@workspace/ui/components/switch";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Loader2,
  Database,
  AlertTriangle,
  CheckCircle,
  Settings,
  Wrench,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@workspace/components-library";
import { clearDomainManagerCache } from "@/server/actions/domain";

interface SyncReport {
  timestamp: string;
  summary: {
    courses?: {
      totalCourses: number;
      totalLessons: number;
      totalIssues: number;
      orphanedLessons: number;
      missingLessons: number;
      invalidLessonOrders: number;
    };
    memberships?: {
      totalMemberships: number;
      totalIssues: number;
      invalidUserReferences: number;
      invalidEntityReferences: number;
      orphanedMemberships: number;
    };
    lessons?: {
      totalLessons: number;
      totalIssues: number;
      invalidCourseReferences: number;
      invalidGroupReferences: number;
    };
  };
  details: {
    courses?: any[];
    memberships?: any[];
    lessons?: any[];
  };
  recommendations: string[];
}

interface SyncResults {
  timestamp: string;
  actions: any;
  dryRun: boolean;
  results: any;
  errors: any[];
}

export default function DatabaseManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [report, setReport] = useState<SyncReport | null>(null);
  const [results, setResults] = useState<SyncResults | null>(null);
  const [entityType, setEntityType] = useState<
    "all" | "courses" | "lessons" | "memberships"
  >("all");
  const [detailed, setDetailed] = useState(false);
  const [actions, setActions] = useState({
    removeOrphanedLessons: false,
    fixLessonOrder: false,
    removeInvalidMemberships: false,
    fixCourseReferences: false,
  });
  const [dryRun, setDryRun] = useState(true);
  const { toast } = useToast();

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      const result = await clearDomainManagerCache();
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear domain cache",
        variant: "destructive",
      });
    } finally {
      setClearingCache(false);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        entityType,
        detailed: detailed.toString(),
      });

      const response = await fetch(`/api/services/clean-sync?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Error generating report. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const executeSync = async () => {
    setExecuting(true);
    try {
      const response = await fetch("/api/services/clean-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entityType,
          actions,
          dryRun,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);

      if (data.errors && data.errors.length > 0) {
        alert("Sync completed with errors. Check results for details.");
      } else if (!dryRun) {
        alert("Sync completed successfully!");
        // Refresh report after successful sync
        generateReport();
      } else {
        alert("Dry run completed. Check results for what would be changed.");
      }
    } catch (error) {
      console.error("Error executing sync:", error);
      alert("Error executing sync. Check console for details.");
    } finally {
      setExecuting(false);
    }
  };

  const getTotalIssues = () => {
    if (!report) return 0;
    let total = 0;
    if (report.summary.courses) total += report.summary.courses.totalIssues;
    if (report.summary.memberships)
      total += report.summary.memberships.totalIssues;
    if (report.summary.lessons) total += report.summary.lessons.totalIssues;
    return total;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Database className="h-8 w-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-semibold">Database Management</h2>
          <p className="text-muted-foreground">
            Monitor and maintain database integrity across your LMS system
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clear Domain Cache Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              Clear Domain Cache
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Clear the domain manager cache to refresh domain data
              </p>
              <Button
                onClick={handleClearCache}
                disabled={clearingCache}
                className="w-full"
                variant="outline"
              >
                {clearingCache ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Clearing Cache...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Domain Cache
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clean & Sync Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              Clean & Sync
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Analyze and fix database integrity issues
              </p>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    <Wrench className="h-4 w-4 mr-2" />
                    Open Clean & Sync
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      Database Clean & Sync
                    </DialogTitle>
                    <DialogDescription>
                      Analyze and fix database integrity issues across courses,
                      lessons, and memberships
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Report Generation Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5" />
                          Generate Analysis Report
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="entityType">Entity Type</Label>
                            <select
                              id="entityType"
                              value={entityType}
                              onChange={(e) =>
                                setEntityType(e.target.value as any)
                              }
                              className="w-full mt-1 p-2 border rounded-md"
                            >
                              <option value="all">All Entities</option>
                              <option value="courses">Courses Only</option>
                              <option value="lessons">Lessons Only</option>
                              <option value="memberships">
                                Memberships Only
                              </option>
                            </select>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="detailed"
                              checked={detailed}
                              onCheckedChange={setDetailed}
                            />
                            <Label htmlFor="detailed">Detailed Report</Label>
                          </div>
                        </div>

                        <Button
                          onClick={generateReport}
                          disabled={loading}
                          className="w-full"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating Report...
                            </>
                          ) : (
                            "Generate Report"
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Report Display */}
                    {report && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            Analysis Report
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Generated at:{" "}
                            {new Date(report.timestamp).toLocaleString()}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Summary Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {report.summary.courses && (
                              <div className="p-4 border rounded-lg">
                                <h3 className="font-semibold text-lg mb-2">
                                  Courses
                                </h3>
                                <div className="space-y-1 text-sm">
                                  <div>
                                    Total: {report.summary.courses.totalCourses}
                                  </div>
                                  <div>
                                    Lessons:{" "}
                                    {report.summary.courses.totalLessons}
                                  </div>
                                  <div className="text-red-600">
                                    Issues: {report.summary.courses.totalIssues}
                                  </div>
                                </div>
                              </div>
                            )}

                            {report.summary.lessons && (
                              <div className="p-4 border rounded-lg">
                                <h3 className="font-semibold text-lg mb-2">
                                  Lessons
                                </h3>
                                <div className="space-y-1 text-sm">
                                  <div>
                                    Total: {report.summary.lessons.totalLessons}
                                  </div>
                                  <div className="text-red-600">
                                    Issues: {report.summary.lessons.totalIssues}
                                  </div>
                                </div>
                              </div>
                            )}

                            {report.summary.memberships && (
                              <div className="p-4 border rounded-lg">
                                <h3 className="font-semibold text-lg mb-2">
                                  Memberships
                                </h3>
                                <div className="space-y-1 text-sm">
                                  <div>
                                    Total:{" "}
                                    {
                                      report.summary.memberships
                                        .totalMemberships
                                    }
                                  </div>
                                  <div className="text-red-600">
                                    Issues:{" "}
                                    {report.summary.memberships.totalIssues}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Issues Summary */}
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h3 className="font-semibold text-red-800 mb-2">
                              Total Issues Found: {getTotalIssues()}
                            </h3>
                            {report.recommendations.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-red-700 font-medium">
                                  Recommendations:
                                </p>
                                <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
                                  {report.recommendations.map((rec, index) => (
                                    <li key={index}>{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Detailed Issues */}
                          {detailed && (
                            <div className="space-y-4">
                              <Separator />
                              <h3 className="font-semibold">Detailed Issues</h3>

                              {report.details.courses &&
                                report.details.courses.length > 0 && (
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Course Issues:
                                    </h4>
                                    <div className="space-y-2">
                                      {report.details.courses.map(
                                        (course, index) => (
                                          <div
                                            key={index}
                                            className="p-3 bg-yellow-50 border border-yellow-200 rounded"
                                          >
                                            <p className="font-medium">
                                              {course.title} ({course.courseId})
                                            </p>
                                            {course.issues &&
                                              course.issues.length > 0 && (
                                                <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                                                  {course.issues.map(
                                                    (
                                                      issue: string,
                                                      i: number,
                                                    ) => (
                                                      <li key={i}>{issue}</li>
                                                    ),
                                                  )}
                                                </ul>
                                              )}
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}

                              {report.details.lessons &&
                                report.details.lessons.length > 0 && (
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Lesson Issues:
                                    </h4>
                                    <div className="space-y-2">
                                      {report.details.lessons.map(
                                        (lesson, index) => (
                                          <div
                                            key={index}
                                            className="p-3 bg-red-50 border border-red-200 rounded"
                                          >
                                            <p className="font-medium">
                                              {lesson.title} ({lesson.lessonId})
                                            </p>
                                            {lesson.issues &&
                                              lesson.issues.length > 0 && (
                                                <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                                                  {lesson.issues.map(
                                                    (
                                                      issue: string,
                                                      i: number,
                                                    ) => (
                                                      <li key={i}>{issue}</li>
                                                    ),
                                                  )}
                                                </ul>
                                              )}
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Sync Actions Section */}
                    {report && getTotalIssues() > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-4 text-green-600" />
                            Fix Issues
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="entityType">Entity Type</Label>
                              <select
                                id="entityType"
                                value={entityType}
                                onChange={(e) =>
                                  setEntityType(e.target.value as any)
                                }
                                className="w-full mt-1 p-2 border rounded-md"
                              >
                                <option value="all">All Entities</option>
                                <option value="courses">Courses Only</option>
                                <option value="lessons">Lessons Only</option>
                                <option value="memberships">
                                  Memberships Only
                                </option>
                              </select>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                id="dryRun"
                                checked={dryRun}
                                onCheckedChange={setDryRun}
                              />
                              <Label htmlFor="dryRun">
                                Dry Run (Preview Only)
                              </Label>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <h4 className="font-medium">Course Actions:</h4>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="fixLessonOrder"
                                    checked={actions.fixLessonOrder}
                                    onCheckedChange={(checked) =>
                                      setActions((prev) => ({
                                        ...prev,
                                        fixLessonOrder: checked,
                                      }))
                                    }
                                  />
                                  <Label htmlFor="fixLessonOrder">
                                    Fix Lesson Order
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="fixCourseReferences"
                                    checked={actions.fixCourseReferences}
                                    onCheckedChange={(checked) =>
                                      setActions((prev) => ({
                                        ...prev,
                                        fixCourseReferences: checked,
                                      }))
                                    }
                                  />
                                  <Label htmlFor="fixCourseReferences">
                                    Fix Course References
                                  </Label>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="font-medium">Cleanup Actions:</h4>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="removeOrphanedLessons"
                                    checked={actions.removeOrphanedLessons}
                                    onCheckedChange={(checked) =>
                                      setActions((prev) => ({
                                        ...prev,
                                        removeOrphanedLessons: checked,
                                      }))
                                    }
                                  />
                                  <Label htmlFor="removeOrphanedLessons">
                                    Remove Orphaned Lessons
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="removeInvalidMemberships"
                                    checked={actions.removeInvalidMemberships}
                                    onCheckedChange={(checked) =>
                                      setActions((prev) => ({
                                        ...prev,
                                        removeInvalidMemberships: checked,
                                      }))
                                    }
                                  />
                                  <Label htmlFor="removeInvalidMemberships">
                                    Remove Invalid Memberships
                                  </Label>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <Button
                              onClick={executeSync}
                              disabled={executing}
                              variant="default"
                              className="flex-1"
                            >
                              {executing ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Executing...
                                </>
                              ) : (
                                <>
                                  {dryRun ? "Preview Changes" : "Execute Fixes"}
                                </>
                              )}
                            </Button>
                          </div>

                          {!dryRun && (
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Warning:</strong> This will make
                                permanent changes to your database. Make sure
                                you have a backup before proceeding.
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Results Display */}
                    {results && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-4 text-green-600" />
                            Sync Results
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {results.dryRun
                              ? "Dry Run Results"
                              : "Execution Results"}{" "}
                            - {new Date(results.timestamp).toLocaleString()}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                            {JSON.stringify(results, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
