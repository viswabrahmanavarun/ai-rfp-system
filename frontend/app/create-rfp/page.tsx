"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { ArrowLeft } from "lucide-react";

export default function CreateRFPPage() {
  const router = useRouter();

  const [requirements, setRequirements] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [generatedRFP, setGeneratedRfp] = useState<any>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    objectives: "",
    scope: "",
    timeline: "",
  });

  // ----------------------------
  // Requirements Handlers
  // ----------------------------
  function updateRequirement(i: number, value: string) {
    const copy = [...requirements];
    copy[i] = value;
    setRequirements(copy);
  }

  function addRequirement() {
    setRequirements([...requirements, ""]);
  }

  function removeRequirement(i: number) {
    if (requirements.length === 1) return;
    setRequirements(requirements.filter((_, idx) => idx !== i));
  }

  // ----------------------------
  // Generate RFP (AI)
  // ----------------------------
  async function generateRFP() {
    try {
      setLoading(true);

      const mergedRequirements = requirements
        .filter((r) => r.trim() !== "")
        .join("; ");

      const payload = {
        title: form.title,
        description: `${form.description}\nObjectives: ${form.objectives}\nScope: ${form.scope}`,
        requirements: mergedRequirements,
      };

      console.log("📤 Payload to backend:", payload);

      const ai = await api.post("/api/rfp/generate", payload);

      if (!ai.data?.data) {
        throw new Error("Backend did not return data field");
      }

      setGeneratedRfp(ai.data.data);
    } catch (err: any) {
      alert("Error generating RFP: " + err.message);
      console.error(err);
    }
    setLoading(false);
  }

  // ----------------------------
  // Save RFP to DB
  // ----------------------------
  async function saveRFP() {
    if (!generatedRFP) return alert("Generate RFP first!");

    try {
      await api.post("/api/rfp/create", {
        ...generatedRFP,
        raw_text: JSON.stringify({ ...form, requirements }),
      });

      router.push("/rfp/list");
    } catch (err: any) {
      alert("Save failed: " + err.message);
    }
  }

  // ----------------------------
  // UI Rendering
  // ----------------------------
  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* BACK BUTTON */}
      <Button
        variant="ghost"
        onClick={() => router.push("/")}
        className="mb-6 flex items-center gap-2 text-gray-700 hover:bg-gray-200 hover:text-black transition-all"
      >
        <ArrowLeft size={18} />
        Back
      </Button>

      {/* Animated Heading */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-10 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text"
      >
        Create New RFP
      </motion.h1>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* LEFT FORM */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-lg border bg-white/80 backdrop-blur-md rounded-2xl">
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-700">
                RFP Information
              </h2>
            </CardHeader>

            <CardContent className="space-y-5">

              <Input
                placeholder="RFP Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <Textarea
                placeholder="Project Description"
                className="h-24"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <Textarea
                placeholder="Objectives"
                className="h-20"
                value={form.objectives}
                onChange={(e) =>
                  setForm({ ...form, objectives: e.target.value })
                }
              />

              <Textarea
                placeholder="Scope of Work"
                className="h-20"
                value={form.scope}
                onChange={(e) => setForm({ ...form, scope: e.target.value })}
              />

              <Textarea
                placeholder="Timeline (e.g., Q4 2025)"
                className="h-16"
                value={form.timeline}
                onChange={(e) => setForm({ ...form, timeline: e.target.value })}
              />

              <Separator />

              <h3 className="text-lg font-medium text-gray-700">
                Requirements
              </h3>

              {requirements.map((req, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder={`Requirement ${index + 1}`}
                    value={req}
                    onChange={(e) =>
                      updateRequirement(index, e.target.value)
                    }
                    className="flex-1"
                  />

                  {requirements.length > 1 && (
                    <Button
                      variant="destructive"
                      onClick={() => removeRequirement(index)}
                    >
                      X
                    </Button>
                  )}
                </motion.div>
              ))}

              <Button
                onClick={addRequirement}
                className="bg-gray-900 text-white"
              >
                + Add Requirement
              </Button>

              <Button
                onClick={generateRFP}
                disabled={loading}
                className="w-full bg-blue-600 text-white h-12 text-lg rounded-xl"
              >
                {loading ? "Generating..." : "Generate RFP"}
              </Button>

            </CardContent>
          </Card>
        </motion.div>

        {/* RIGHT PREVIEW */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-lg border bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-700">
                Generated RFP Preview
              </h2>
            </CardHeader>

            <CardContent>
              {!generatedRFP ? (
                <p className="text-gray-500">
                  Fill the form and click <strong>Generate RFP</strong> to preview.
                </p>
              ) : (
                <motion.pre
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7 }}
                  className="bg-white p-4 rounded-lg text-sm border h-[520px] overflow-auto shadow-inner"
                >
                  {JSON.stringify(generatedRFP, null, 2)}
                </motion.pre>
              )}

              {generatedRFP && (
                <Button
                  onClick={saveRFP}
                  className="w-full bg-green-600 text-white mt-4 h-12 rounded-xl text-lg"
                >
                  Save RFP
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
