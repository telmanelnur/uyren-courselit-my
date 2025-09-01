"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { X, Upload, CheckCircle, Loader2 } from "lucide-react";

interface GrantApplicationFormProps {
  onClose: () => void;
}

export function GrantApplicationForm({ onClose }: GrantApplicationFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    educationStatus: "",
    intendedTrack: "",
    aidType: "",
    motivation: "",
    achievements: "",
    consent: false,
  });
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    id: null,
    proofOfNeed: null,
    portfolio: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.educationStatus)
      newErrors.educationStatus = "Education status is required";
    if (!formData.intendedTrack)
      newErrors.intendedTrack = "Intended track is required";
    if (!formData.aidType) newErrors.aidType = "Aid type is required";
    if (!formData.motivation.trim())
      newErrors.motivation = "Motivation statement is required";
    if (formData.motivation.length < 100)
      newErrors.motivation = "Motivation must be at least 100 characters";
    if (!formData.consent)
      newErrors.consent = "You must agree to the privacy policy";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleFileUpload = (key: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-black">
              Application Submitted!
            </CardTitle>
            <CardDescription>
              Thank you for applying. We'll review your application and get back
              to you within 7-10 business days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={onClose}
              className="w-full bg-brand-primary hover:bg-brand-primary-hover"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-black">
                Grant Application
              </CardTitle>
              <CardDescription>
                Fill out this form to apply for financial aid. All fields marked
                with * are required.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">
                Personal Information
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    className={errors.fullName ? "border-red-500" : ""}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, age: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Education & Program */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">
                Education & Program
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="educationStatus">Education Status *</Label>
                  <Select
                    value={formData.educationStatus}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        educationStatus: value,
                      }))
                    }
                  >
                    <SelectTrigger
                      className={errors.educationStatus ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select your education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-school-9">
                        High School Grade 9
                      </SelectItem>
                      <SelectItem value="high-school-10">
                        High School Grade 10
                      </SelectItem>
                      <SelectItem value="high-school-11">
                        High School Grade 11
                      </SelectItem>
                      <SelectItem value="high-school-12">
                        High School Grade 12
                      </SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.educationStatus && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.educationStatus}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="intendedTrack">Intended Track *</Label>
                  <Select
                    value={formData.intendedTrack}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, intendedTrack: value }))
                    }
                  >
                    <SelectTrigger
                      className={errors.intendedTrack ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select your track" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="programming">Programming</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="ai">
                        Artificial Intelligence
                      </SelectItem>
                      <SelectItem value="data-science">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.intendedTrack && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.intendedTrack}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="aidType">Aid Type Requested *</Label>
                <Select
                  value={formData.aidType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, aidType: value }))
                  }
                >
                  <SelectTrigger
                    className={errors.aidType ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select aid type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100-percent">100% Grant</SelectItem>
                    <SelectItem value="50-percent">
                      Up to 50% Discount
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.aidType && (
                  <p className="text-sm text-red-500 mt-1">{errors.aidType}</p>
                )}
              </div>
            </div>

            {/* Motivation & Achievements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">
                Motivation & Achievements
              </h3>

              <div>
                <Label htmlFor="motivation">
                  Motivation Statement * (500-1000 characters)
                </Label>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      motivation: e.target.value,
                    }))
                  }
                  placeholder="Tell us why you want to learn AI and how this grant would help you..."
                  className={`min-h-[120px] ${errors.motivation ? "border-red-500" : ""}`}
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.motivation && (
                    <p className="text-sm text-red-500">{errors.motivation}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {formData.motivation.length}/1000
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="achievements">
                  Achievements & Portfolio (Optional)
                </Label>
                <Textarea
                  id="achievements"
                  value={formData.achievements}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      achievements: e.target.value,
                    }))
                  }
                  placeholder="List any relevant achievements, projects, olympiads, or portfolio items..."
                  className="min-h-[100px]"
                />
              </div>
            </div>

            {/* Document Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">
                Required Documents
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>ID or Student Card *</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-brand-primary transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) =>
                        handleFileUpload("id", e.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                  </div>
                  {files.id && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ {files.id.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Proof of Need</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-brand-primary transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Income statement, benefits letter, etc.
                    </p>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) =>
                        handleFileUpload(
                          "proofOfNeed",
                          e.target.files?.[0] || null,
                        )
                      }
                      className="hidden"
                    />
                  </div>
                  {files.proofOfNeed && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ {files.proofOfNeed.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Consent */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="consent"
                checked={formData.consent}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    consent: checked as boolean,
                  }))
                }
                className={errors.consent ? "border-red-500" : ""}
              />
              <Label htmlFor="consent" className="text-sm leading-relaxed">
                I confirm that the information provided is accurate and agree to
                the privacy policy. I understand that false information may
                result in application rejection.
              </Label>
            </div>
            {errors.consent && (
              <p className="text-sm text-red-500">{errors.consent}</p>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Apply for a Grant"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
