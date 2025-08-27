"use client"

import type React from "react"
import { useState } from "react"
import { useTranslation } from "next-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ExternalLink } from "lucide-react"

export function CommunityJoinForm() {
  const { t } = useTranslation("common")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    track: "",
    country: "",
    contribution: "",
    agreeToRules: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const tracks = [
    t("track_programming"),
    t("track_analytics"),
    t("track_ai"),
    t("track_data_science"),
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = t("error_name_required")
    if (!formData.email.trim()) newErrors.email = t("error_email_required")
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t("error_email_invalid")
    if (!formData.track) newErrors.track = t("error_track_required")
    if (!formData.contribution.trim()) newErrors.contribution = t("error_contribution_required")
    if (!formData.agreeToRules) newErrors.agreeToRules = t("error_agree_rules")

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setIsSubmitted(true)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  if (isSubmitted) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-black mb-4">{t("join_success_title")}</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {t("join_success_desc", { name: formData.name })}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-brand-primary hover:bg-brand-primary-hover text-white"
              onClick={() => window.open("https://discord.gg/", "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {t("join_discord")}
            </Button>
            <Button
              variant="outline"
              className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white bg-transparent"
              onClick={() => window.open("https://t.me/uyrenai", "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {t("join_telegram")}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-black mb-2">
                {t("form_name")} *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`${errors.name ? "border-red-500" : "border-gray-300"} focus:border-brand-primary`}
                placeholder={t("form_name_placeholder")}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-black mb-2">
                {t("form_email")} *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`${errors.email ? "border-red-500" : "border-gray-300"} focus:border-brand-primary`}
                placeholder={t("form_email_placeholder")}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="track" className="block text-sm font-semibold text-black mb-2">
                {t("form_track")} *
              </label>
              <select
                id="track"
                value={formData.track}
                onChange={(e) => handleInputChange("track", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                  errors.track ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">{t("form_track_placeholder")}</option>
                {tracks.map((track) => (
                  <option key={track} value={track}>
                    {track}
                  </option>
                ))}
              </select>
              {errors.track && <p className="text-red-500 text-sm mt-1">{errors.track}</p>}
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-semibold text-black mb-2">
                {t("form_country")}
              </label>
              <Input
                id="country"
                type="text"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                className="border-gray-300 focus:border-brand-primary"
                placeholder={t("form_country_placeholder")}
              />
            </div>
          </div>

          <div>
            <label htmlFor="contribution" className="block text-sm font-semibold text-black mb-2">
              {t("form_contribution")} *
            </label>
            <Textarea
              id="contribution"
              value={formData.contribution}
              onChange={(e) => handleInputChange("contribution", e.target.value)}
              className={`${errors.contribution ? "border-red-500" : "border-gray-300"} focus:border-brand-primary`}
              placeholder={t("form_contribution_placeholder")}
              rows={4}
            />
            {errors.contribution && <p className="text-red-500 text-sm mt-1">{errors.contribution}</p>}
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="agreeToRules"
              checked={formData.agreeToRules}
              onChange={(e) => handleInputChange("agreeToRules", e.target.checked)}
              className="mt-1 w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
            />
            <label htmlFor="agreeToRules" className="text-sm text-gray-700 leading-relaxed">
              {t("form_agree_rules")} *
            </label>
          </div>
          {errors.agreeToRules && <p className="text-red-500 text-sm">{errors.agreeToRules}</p>}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-white py-3"
            >
              {isLoading ? t("form_joining") : t("form_join_community")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white py-3 bg-transparent"
              onClick={() => window.open("https://discord.gg/", "_blank")}
            >
              {t("join_discord")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
