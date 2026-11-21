import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Camera,
  CameraOff,
  CheckCircle2,
  Clock,
  Loader2,
  ScanFace,
  Search,
  Sparkles,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetFaceProfilesQuery,
  useEnrollFaceMutation,
  useClearFaceEnrollmentMutation,
  useMarkFaceAttendanceMutation,
  useGetFaceLogsQuery,
} from "@/services/private/faceAttendanceService";
import {
  loadFaceModels,
  detectSingleFaceDescriptor,
  findBestFaceMatch,
  captureVideoSnapshot,
} from "@/utils/faceRecognition";

function getInitials(name = "") {
  return String(name)
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function FaceAttendancePage() {
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [activeTab, setActiveTab] = useState("kiosk"); // "kiosk" | "enroll"

  // Models & Kiosk Camera state
  const [modelsReady, setModelsReady] = useState(false);
  const [modelsError, setModelsError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [autoScan, setAutoScan] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [targetFilter, setTargetFilter] = useState("all"); // "all" | "student" | "teacher"
  const [lastMatch, setLastMatch] = useState(null);
  const [scanStatusText, setScanStatusText] = useState("Camera is off. Click Start Camera to begin.");

  // Enrollment tab filters
  const [enrollRoleFilter, setEnrollRoleFilter] = useState("all");
  const [enrollClassFilter, setEnrollClassFilter] = useState("all");
  const [enrollStatusFilter, setEnrollStatusFilter] = useState("all");
  const [enrollSearch, setEnrollSearch] = useState("");

  // Enrollment modal state
  const [enrollTarget, setEnrollTarget] = useState(null);
  const [enrollCameraReady, setEnrollCameraReady] = useState(false);
  const [enrollFaceDetected, setEnrollFaceDetected] = useState(false);
  const [enrollCameraError, setEnrollCameraError] = useState("");
  const [isCapturingEnroll, setIsCapturingEnroll] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const cooldownRef = useRef(new Map()); // key -> timestamp

  const enrollVideoRef = useRef(null);
  const enrollStreamRef = useRef(null);

  // API
  const { data: profilesRes, isLoading: profilesLoading } = useGetFaceProfilesQuery();
  const { data: logsRes } = useGetFaceLogsQuery(selectedDate);
  const [enrollFace, { isLoading: isSavingEnroll }] = useEnrollFaceMutation();
  const [clearFaceEnrollment] = useClearFaceEnrollmentMutation();
  const [markFaceAttendance] = useMarkFaceAttendanceMutation();

  const profiles = useMemo(() => profilesRes?.profiles || [], [profilesRes]);
  const logs = useMemo(() => logsRes?.logs || [], [logsRes]);

  const enrolledProfiles = useMemo(() => {
    return profiles.filter((p) => {
      if (!p.hasFaceEnrolled) return false;
      if (targetFilter !== "all" && p.personType !== targetFilter) return false;
      return true;
    });
  }, [profiles, targetFilter]);

  const classOptions = useMemo(() => {
    const set = new Set();
    profiles.forEach((p) => {
      if (p.personType === "student" && p.className) set.add(p.className);
    });
    return Array.from(set);
  }, [profiles]);

  const filteredEnrollList = useMemo(() => {
    const q = enrollSearch.trim().toLowerCase();
    return profiles.filter((p) => {
      if (enrollRoleFilter !== "all" && p.personType !== enrollRoleFilter) return false;
      if (
        enrollClassFilter !== "all" &&
        p.personType === "student" &&
        String(p.className || "").toLowerCase() !== enrollClassFilter.toLowerCase()
      ) {
        return false;
      }
      if (enrollClassFilter !== "all" && p.personType !== "student") return false;
      if (enrollStatusFilter === "enrolled" && !p.hasFaceEnrolled) return false;
      if (enrollStatusFilter === "unenrolled" && p.hasFaceEnrolled) return false;
      if (q) {
        const hay = `${p.name} ${p.subtitle} ${p.code}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [profiles, enrollRoleFilter, enrollClassFilter, enrollStatusFilter, enrollSearch]);

  // Load face recognition models once
  useEffect(() => {
    let mounted = true;
    loadFaceModels()
      .then(() => {
        if (mounted) setModelsReady(true);
      })
      .catch((err) => {
        if (mounted) setModelsError(err?.message || "Failed to load face recognition models.");
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Stop kiosk camera helper
  const stopKioskCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setScanStatusText("Camera is off. Click Start Camera to begin.");
  };

  // Start kiosk camera
  const startKioskCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setScanStatusText("Scanning for enrolled faces...");
    } catch (err) {
      setCameraError(
        err?.message || "Could not access laptop camera. Please allow camera permission."
      );
      setCameraActive(false);
    }
  };

  // Cleanup kiosk camera on unmount or tab switch
  useEffect(() => {
    if (activeTab !== "kiosk" && cameraActive) {
      stopKioskCamera();
    }
    return () => {
      stopKioskCamera();
    };
  }, [activeTab]);

  // Draw bounding box on overlay canvas
  const drawOverlay = (box, label, matched) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !video.videoWidth) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!box) return;
    ctx.strokeStyle = matched ? "#10b981" : "#f59e0b";
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    if (label) {
      ctx.font = "bold 14px sans-serif";
      const textWidth = ctx.measureText(label).width;
      ctx.fillStyle = matched ? "#10b981" : "#f59e0b";
      ctx.fillRect(box.x, Math.max(0, box.y - 26), textWidth + 16, 24);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, box.x + 8, Math.max(16, box.y - 9));
    }
  };

  const runSingleScan = async (manual = false) => {
    if (!cameraActive || !modelsReady || !videoRef.current || isScanning) return;
    if (videoRef.current.readyState < 2) return;

    setIsScanning(true);
    try {
      const detected = await detectSingleFaceDescriptor(videoRef.current);
      if (!detected) {
        drawOverlay(null, "", false);
        setScanStatusText("No face detected. Please face the camera clearly.");
        if (manual) toast.info("No face detected in frame.");
        return;
      }

      if (enrolledProfiles.length === 0) {
        drawOverlay(detected.box, "No enrolled faces", false);
        setScanStatusText("Face detected, but no enrolled students/teachers yet.");
        if (manual) toast.warning("Enroll at least one face in the Face Enrollment tab first.");
        return;
      }

      const match = findBestFaceMatch(detected.descriptor, enrolledProfiles, 0.52);
      if (!match) {
        drawOverlay(detected.box, "Unknown Face", false);
        setScanStatusText("Face detected — not recognized. Enroll this person first.");
        if (manual) toast.error("Face not recognized.");
        return;
      }

      const { profile, confidence } = match;
      drawOverlay(detected.box, `${profile.name} (${confidence}%)`, true);
      setScanStatusText(`Recognized ${profile.name} (${confidence}% match)`);

      const now = Date.now();
      const lastTime = cooldownRef.current.get(profile.key) || 0;
      if (!manual && now - lastTime < 15000) {
        return;
      }
      cooldownRef.current.set(profile.key, now);

      const res = await markFaceAttendance({
        personType: profile.personType,
        personId: profile.id,
        confidence,
        date: selectedDate,
      }).unwrap();

      setLastMatch(res?.record || { ...profile, confidence, scanTime: "Just now" });
      toast.success(res?.message || `${profile.name} marked Present!`);
    } catch (err) {
      if (manual) {
        toast.error(err?.data?.message || "Face scan failed");
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Auto-scan interval
  useEffect(() => {
    if (!cameraActive || !autoScan || !modelsReady || activeTab !== "kiosk") return;
    const timer = setInterval(() => {
      runSingleScan(false);
    }, 950);
    return () => clearInterval(timer);
  });

  // Enrollment modal camera lifecycle
  useEffect(() => {
    if (!enrollTarget) {
      if (enrollStreamRef.current) {
        enrollStreamRef.current.getTracks().forEach((t) => t.stop());
        enrollStreamRef.current = null;
      }
      setEnrollCameraReady(false);
      setEnrollFaceDetected(false);
      setEnrollCameraError("");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        enrollStreamRef.current = stream;
        if (enrollVideoRef.current) {
          enrollVideoRef.current.srcObject = stream;
          await enrollVideoRef.current.play();
          setEnrollCameraReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setEnrollCameraError(err?.message || "Could not open camera for enrollment.");
        }
      }
    })();

    return () => {
      cancelled = true;
      if (enrollStreamRef.current) {
        enrollStreamRef.current.getTracks().forEach((t) => t.stop());
        enrollStreamRef.current = null;
      }
    };
  }, [enrollTarget]);

  // Live face-presence indicator in enrollment modal
  useEffect(() => {
    if (!enrollTarget || !enrollCameraReady || !modelsReady) return;
    const timer = setInterval(async () => {
      if (!enrollVideoRef.current || enrollVideoRef.current.readyState < 2) return;
      try {
        const det = await detectSingleFaceDescriptor(enrollVideoRef.current);
        setEnrollFaceDetected(Boolean(det));
      } catch {
        setEnrollFaceDetected(false);
      }
    }, 700);
    return () => clearInterval(timer);
  }, [enrollTarget, enrollCameraReady, modelsReady]);

  const handleCaptureAndEnroll = async () => {
    if (!enrollTarget || !enrollVideoRef.current) return;
    setIsCapturingEnroll(true);
    try {
      const det = await detectSingleFaceDescriptor(enrollVideoRef.current);
      if (!det) {
        toast.error("No clear face detected. Please look directly into the camera.");
        return;
      }
      const snapshot = captureVideoSnapshot(enrollVideoRef.current);
      const res = await enrollFace({
        personType: enrollTarget.personType,
        personId: enrollTarget.id,
        faceDescriptor: det.descriptor,
        snapshot,
      }).unwrap();
      toast.success(res?.message || `Face enrolled for ${enrollTarget.name}`);
      setEnrollTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save face enrollment");
    } finally {
      setIsCapturingEnroll(false);
    }
  };

  const handleClearEnrollment = async (profile) => {
    if (!window.confirm(`Remove face enrollment for ${profile.name}?`)) return;
    try {
      await clearFaceEnrollment({
        personType: profile.personType,
        personId: profile.id,
      }).unwrap();
      toast.success(`Cleared face data for ${profile.name}`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to clear enrollment");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        eyebrow="Biometric Camera Attendance"
        title="Face Scan Attendance"
        description="Use your laptop webcam to enroll faces and mark Students & Teachers Present automatically."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="gap-1.5">
              <Link to="/attendance">
                <ArrowLeft className="h-4 w-4" /> Back to Attendance
              </Link>
            </Button>
          </div>
        }
      />

      {/* KPI Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Profiles"
          value={profilesLoading ? "..." : profiles.length}
          icon={Users}
          variant="primary"
        />
        <StatCard
          label="Faces Enrolled"
          value={profilesLoading ? "..." : profilesRes?.enrolledCount ?? 0}
          icon={ScanFace}
          variant="info"
        />
        <StatCard
          label="Checked In Today"
          value={logs.length}
          icon={UserCheck}
          variant="success"
        />
        <StatCard
          label="AI Vision Engine"
          value={modelsError ? "Error" : modelsReady ? "Ready" : "Loading..."}
          icon={Sparkles}
          variant="warning"
        />
      </div>

      {modelsError && (
        <Card className="p-4 border-destructive/40 bg-destructive/10 text-destructive text-sm">
          {modelsError}
        </Card>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "kiosk" ? "default" : "outline"}
            onClick={() => setActiveTab("kiosk")}
            className={
              activeTab === "kiosk"
                ? "gradient-primary text-primary-foreground border-0 shadow-glow gap-2"
                : "gap-2"
            }
          >
            <Video className="h-4 w-4" /> Live Face Check-In Kiosk
          </Button>
          <Button
            variant={activeTab === "enroll" ? "default" : "outline"}
            onClick={() => setActiveTab("enroll")}
            className={
              activeTab === "enroll"
                ? "gradient-primary text-primary-foreground border-0 shadow-glow gap-2"
                : "gap-2"
            }
          >
            <UserPlus className="h-4 w-4" /> Face Enrollment ({profilesRes?.enrolledCount ?? 0}/
            {profiles.length})
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Attendance Date:</span>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value || today)}
            className="h-9 w-40"
          />
        </div>
      </div>

      {/* TAB 1: LIVE KIOSK */}
      {activeTab === "kiosk" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Camera Feed */}
          <Card className="lg:col-span-7 shadow-card overflow-hidden">
            <CardHeader className="border-b pb-4 flex flex-row flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Camera className="h-4 w-4 text-primary" /> Laptop Camera Scanner
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{scanStatusText}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={targetFilter} onValueChange={setTargetFilter}>
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All (Students &amp; Staff)</SelectItem>
                    <SelectItem value="student">Students Only</SelectItem>
                    <SelectItem value="teacher">Teachers Only</SelectItem>
                  </SelectContent>
                </Select>
                {!cameraActive ? (
                  <Button
                    size="sm"
                    disabled={!modelsReady}
                    onClick={startKioskCamera}
                    className="gradient-primary text-primary-foreground border-0 shadow-glow gap-1.5"
                  >
                    <Camera className="h-4 w-4" /> Start Camera
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={stopKioskCamera}
                    className="gap-1.5"
                  >
                    <CameraOff className="h-4 w-4" /> Stop Camera
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
                />
                <canvas
                  ref={canvasRef}
                  className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${
                    cameraActive ? "block" : "hidden"
                  }`}
                />
                {!cameraActive && (
                  <div className="text-center p-6 text-slate-300 space-y-3">
                    <div className="h-14 w-14 rounded-2xl bg-white/10 mx-auto flex items-center justify-center">
                      <ScanFace className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-sm font-medium">
                      {modelsReady
                        ? "Ready to scan with your laptop webcam"
                        : "Loading face recognition AI models..."}
                    </div>
                    {cameraError && (
                      <p className="text-xs text-rose-400 max-w-sm mx-auto">{cameraError}</p>
                    )}
                    <Button
                      disabled={!modelsReady}
                      onClick={startKioskCamera}
                      className="gradient-primary text-primary-foreground border-0 shadow-glow gap-2"
                    >
                      {!modelsReady ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                      {modelsReady ? "Turn On Laptop Camera" : "Loading Models..."}
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoScan}
                    onChange={(e) => setAutoScan(e.target.checked)}
                    className="rounded border-border"
                  />
                  Auto-Scan continuously (15s cooldown per person)
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!cameraActive || !modelsReady || isScanning}
                  onClick={() => runSingleScan(true)}
                  className="gap-1.5"
                >
                  {isScanning ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ScanFace className="h-3.5 w-3.5" />
                  )}
                  Scan Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel: Last Recognized + Today's Logs */}
          <div className="lg:col-span-5 space-y-5">
            <Card className="shadow-card">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Latest Recognition
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {lastMatch ? (
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 ring-2 ring-emerald-500/40">
                      <AvatarImage src={lastMatch.photo} />
                      <AvatarFallback className="gradient-primary text-primary-foreground font-bold text-lg">
                        {getInitials(lastMatch.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-lg truncate">{lastMatch.name}</h3>
                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-0 text-[11px]">
                          Marked Present
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{lastMatch.subtitle}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Confidence: {Math.round(lastMatch.confidence || 0)}%
                        </span>
                        <span>•</span>
                        <span>Time: {lastMatch.scanTime}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    Stand in front of the laptop camera to automatically mark attendance.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="border-b pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Face Check-Ins ({logs.length})
                </CardTitle>
                <Badge variant="secondary" className="text-[11px]">
                  {selectedDate}
                </Badge>
              </CardHeader>
              <CardContent className="p-0 max-h-[320px] overflow-y-auto divide-y">
                {logs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    No face scan check-ins recorded for {selectedDate} yet.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm truncate">{log.name}</span>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {log.personType}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{log.subtitle}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {log.status}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{log.scanTime}</div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: FACE ENROLLMENT */}
      {activeTab === "enroll" && (
        <div className="space-y-4">
          <Card className="p-4 shadow-card">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="relative">
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={enrollSearch}
                  onChange={(e) => setEnrollSearch(e.target.value)}
                  placeholder="Search name, roll no, ID..."
                  className="pl-9"
                />
              </div>
              <Select value={enrollRoleFilter} onValueChange={setEnrollRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Students &amp; Teachers</SelectItem>
                  <SelectItem value="student">Students Only</SelectItem>
                  <SelectItem value="teacher">Teachers Only</SelectItem>
                </SelectContent>
              </Select>
              <Select value={enrollClassFilter} onValueChange={setEnrollClassFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      Class {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={enrollStatusFilter} onValueChange={setEnrollStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="enrolled">Enrolled Only</SelectItem>
                  <SelectItem value="unenrolled">Not Enrolled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEnrollList.map((p) => (
              <Card key={p.key} className="p-4 shadow-card flex flex-col justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={p.photo} />
                    <AvatarFallback className="gradient-primary text-primary-foreground font-semibold">
                      {getInitials(p.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm truncate">{p.name}</h4>
                      <Badge
                        variant={p.hasFaceEnrolled ? "default" : "secondary"}
                        className={
                          p.hasFaceEnrolled
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-0 text-[10px]"
                            : "text-[10px]"
                        }
                      >
                        {p.hasFaceEnrolled ? "Enrolled" : "Not Enrolled"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{p.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t gap-2">
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {p.personType}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    {p.hasFaceEnrolled && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleClearEnrollment(p)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Clear Face Enrollment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      disabled={!modelsReady}
                      onClick={() => setEnrollTarget(p)}
                      className="h-8 text-xs gap-1.5 gradient-primary text-primary-foreground border-0"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      {p.hasFaceEnrolled ? "Re-Enroll Face" : "Enroll Face"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* FACE ENROLLMENT MODAL */}
      <Dialog open={!!enrollTarget} onOpenChange={(o) => !o && setEnrollTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanFace className="h-5 w-5 text-primary" />
              Enroll Face — {enrollTarget?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{enrollTarget?.subtitle}</p>
            <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border">
              <video
                ref={enrollVideoRef}
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {enrollCameraError && (
                <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-rose-400 bg-slate-950/90">
                  {enrollCameraError}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span
                className={`inline-flex items-center gap-1.5 font-medium ${
                  enrollFaceDetected ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    enrollFaceDetected ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                {enrollFaceDetected
                  ? "Clear face detected — ready to save!"
                  : "Look directly at the laptop camera..."}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEnrollTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!enrollCameraReady || !enrollFaceDetected || isCapturingEnroll || isSavingEnroll}
              onClick={handleCaptureAndEnroll}
              className="gradient-primary text-primary-foreground border-0 shadow-glow gap-1.5"
            >
              {(isCapturingEnroll || isSavingEnroll) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Capture &amp; Save Face
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
