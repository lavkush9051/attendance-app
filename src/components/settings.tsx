// "use client"

// import { useState } from "react"
// import { Bell, Shield, User, Palette, Smartphone, Save, Eye, EyeOff } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Switch } from "@/components/ui/switch"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Separator } from "@/components/ui/separator"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Alert, AlertDescription } from "@/components/ui/alert"

// export function Settings() {
//   const [showPassword, setShowPassword] = useState(false)
//   const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")

//   // Profile settings state
//   const [profileData, setProfileData] = useState({
//     firstName: "John",
//     lastName: "Doe",
//     email: "john.doe@company.com",
//     phone: "+1 (555) 123-4567",
//     department: "Engineering",
//     designation: "Software Engineer",
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   })

//   // Notification settings state
//   const [notifications, setNotifications] = useState({
//     emailNotifications: true,
//     pushNotifications: true,
//     leaveApproval: true,
//     attendanceReminders: true,
//     systemUpdates: false,
//     weeklyReports: true,
//   })

//   // Appearance settings state
//   const [appearance, setAppearance] = useState({
//     theme: "light",
//     language: "en",
//     timezone: "UTC-5",
//     dateFormat: "MM/DD/YYYY",
//     timeFormat: "12h",
//   })

//   // Privacy settings state
//   const [privacy, setPrivacy] = useState({
//     profileVisibility: "team",
//     attendanceVisibility: "managers",
//     twoFactorAuth: false,
//     sessionTimeout: "30",
//   })

//   const handleSave = async (section: string) => {
//     setSaveStatus("saving")
//     // Simulate API call
//     await new Promise((resolve) => setTimeout(resolve, 1000))
//     setSaveStatus("saved")
//     setTimeout(() => setSaveStatus("idle"), 2000)
//   }

//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
//         <p className="text-sm text-gray-600 mt-1">Manage your account preferences and settings</p>
//       </div>

//       <Tabs defaultValue="profile" className="space-y-6">
//         <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
//           <TabsTrigger value="profile" className="flex items-center space-x-2">
//             <User className="h-4 w-4" />
//             <span className="hidden sm:inline">Profile</span>
//           </TabsTrigger>
//           <TabsTrigger value="notifications" className="flex items-center space-x-2">
//             <Bell className="h-4 w-4" />
//             <span className="hidden sm:inline">Notifications</span>
//           </TabsTrigger>
//           <TabsTrigger value="appearance" className="flex items-center space-x-2">
//             <Palette className="h-4 w-4" />
//             <span className="hidden sm:inline">Appearance</span>
//           </TabsTrigger>
//           <TabsTrigger value="privacy" className="flex items-center space-x-2">
//             <Shield className="h-4 w-4" />
//             <span className="hidden sm:inline">Privacy</span>
//           </TabsTrigger>
//         </TabsList>

//         {/* Profile Settings */}
//         <TabsContent value="profile" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <User className="h-5 w-5" />
//                 <span>Personal Information</span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="firstName">First Name</Label>
//                   <Input
//                     id="firstName"
//                     value={profileData.firstName}
//                     onChange={(e) => setProfileData((prev) => ({ ...prev, firstName: e.target.value }))}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="lastName">Last Name</Label>
//                   <Input
//                     id="lastName"
//                     value={profileData.lastName}
//                     onChange={(e) => setProfileData((prev) => ({ ...prev, lastName: e.target.value }))}
//                   />
//                 </div>
//               </div>

//               <div>
//                 <Label htmlFor="email">Email Address</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   value={profileData.email}
//                   onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="phone">Phone Number</Label>
//                 <Input
//                   id="phone"
//                   value={profileData.phone}
//                   onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="department">Department</Label>
//                   <Select
//                     value={profileData.department}
//                     onValueChange={(value) => setProfileData((prev) => ({ ...prev, department: value }))}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="Engineering">Engineering</SelectItem>
//                       <SelectItem value="Marketing">Marketing</SelectItem>
//                       <SelectItem value="Sales">Sales</SelectItem>
//                       <SelectItem value="HR">Human Resources</SelectItem>
//                       <SelectItem value="Finance">Finance</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div>
//                   <Label htmlFor="designation">Designation</Label>
//                   <Input
//                     id="designation"
//                     value={profileData.designation}
//                     onChange={(e) => setProfileData((prev) => ({ ...prev, designation: e.target.value }))}
//                   />
//                 </div>
//               </div>

//               <Button onClick={() => handleSave("profile")} disabled={saveStatus === "saving"}>
//                 <Save className="h-4 w-4 mr-2" />
//                 {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save Changes"}
//               </Button>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <Shield className="h-5 w-5" />
//                 <span>Change Password</span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div>
//                 <Label htmlFor="currentPassword">Current Password</Label>
//                 <div className="relative">
//                   <Input
//                     id="currentPassword"
//                     type={showPassword ? "text" : "password"}
//                     value={profileData.currentPassword}
//                     onChange={(e) => setProfileData((prev) => ({ ...prev, currentPassword: e.target.value }))}
//                   />
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="icon"
//                     className="absolute right-2 top-1/2 transform -translate-y-1/2"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </Button>
//                 </div>
//               </div>

//               <div>
//                 <Label htmlFor="newPassword">New Password</Label>
//                 <Input
//                   id="newPassword"
//                   type={showPassword ? "text" : "password"}
//                   value={profileData.newPassword}
//                   onChange={(e) => setProfileData((prev) => ({ ...prev, newPassword: e.target.value }))}
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="confirmPassword">Confirm New Password</Label>
//                 <Input
//                   id="confirmPassword"
//                   type={showPassword ? "text" : "password"}
//                   value={profileData.confirmPassword}
//                   onChange={(e) => setProfileData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
//                 />
//               </div>

//               <Button onClick={() => handleSave("password")} disabled={saveStatus === "saving"}>
//                 <Save className="h-4 w-4 mr-2" />
//                 Update Password
//               </Button>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Notification Settings */}
//         <TabsContent value="notifications" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <Bell className="h-5 w-5" />
//                 <span>Notification Preferences</span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <Label htmlFor="emailNotifications">Email Notifications</Label>
//                     <p className="text-sm text-gray-600">Receive notifications via email</p>
//                   </div>
//                   <Switch
//                     id="emailNotifications"
//                     checked={notifications.emailNotifications}
//                     onCheckedChange={(checked) =>
//                       setNotifications((prev) => ({ ...prev, emailNotifications: checked }))
//                     }
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <Label htmlFor="pushNotifications">Push Notifications</Label>
//                     <p className="text-sm text-gray-600">Receive push notifications on your device</p>
//                   </div>
//                   <Switch
//                     id="pushNotifications"
//                     checked={notifications.pushNotifications}
//                     onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, pushNotifications: checked }))}
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <Label htmlFor="leaveApproval">Leave Approval Updates</Label>
//                     <p className="text-sm text-gray-600">Get notified about leave request status changes</p>
//                   </div>
//                   <Switch
//                     id="leaveApproval"
//                     checked={notifications.leaveApproval}
//                     onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, leaveApproval: checked }))}
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <Label htmlFor="attendanceReminders">Attendance Reminders</Label>
//                     <p className="text-sm text-gray-600">Reminders for clock in/out and regularization</p>
//                   </div>
//                   <Switch
//                     id="attendanceReminders"
//                     checked={notifications.attendanceReminders}
//                     onCheckedChange={(checked) =>
//                       setNotifications((prev) => ({ ...prev, attendanceReminders: checked }))
//                     }
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <Label htmlFor="systemUpdates">System Updates</Label>
//                     <p className="text-sm text-gray-600">Notifications about system maintenance and updates</p>
//                   </div>
//                   <Switch
//                     id="systemUpdates"
//                     checked={notifications.systemUpdates}
//                     onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, systemUpdates: checked }))}
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <Label htmlFor="weeklyReports">Weekly Reports</Label>
//                     <p className="text-sm text-gray-600">Receive weekly attendance and leave summary</p>
//                   </div>
//                   <Switch
//                     id="weeklyReports"
//                     checked={notifications.weeklyReports}
//                     onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, weeklyReports: checked }))}
//                   />
//                 </div>
//               </div>

//               <Button onClick={() => handleSave("notifications")} disabled={saveStatus === "saving"}>
//                 <Save className="h-4 w-4 mr-2" />
//                 Save Preferences
//               </Button>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Appearance Settings */}
//         <TabsContent value="appearance" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <Palette className="h-5 w-5" />
//                 <span>Appearance & Localization</span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="theme">Theme</Label>
//                   <Select
//                     value={appearance.theme}
//                     onValueChange={(value) => setAppearance((prev) => ({ ...prev, theme: value }))}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="light">Light</SelectItem>
//                       <SelectItem value="dark">Dark</SelectItem>
//                       <SelectItem value="system">System</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <Label htmlFor="language">Language</Label>
//                   <Select
//                     value={appearance.language}
//                     onValueChange={(value) => setAppearance((prev) => ({ ...prev, language: value }))}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="en">English</SelectItem>
//                       <SelectItem value="es">Spanish</SelectItem>
//                       <SelectItem value="fr">French</SelectItem>
//                       <SelectItem value="de">German</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="timezone">Timezone</Label>
//                   <Select
//                     value={appearance.timezone}
//                     onValueChange={(value) => setAppearance((prev) => ({ ...prev, timezone: value }))}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
//                       <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
//                       <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
//                       <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
//                       <SelectItem value="UTC+0">GMT (UTC+0)</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <Label htmlFor="dateFormat">Date Format</Label>
//                   <Select
//                     value={appearance.dateFormat}
//                     onValueChange={(value) => setAppearance((prev) => ({ ...prev, dateFormat: value }))}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
//                       <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
//                       <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div>
//                 <Label htmlFor="timeFormat">Time Format</Label>
//                 <Select
//                   value={appearance.timeFormat}
//                   onValueChange={(value) => setAppearance((prev) => ({ ...prev, timeFormat: value }))}
//                 >
//                   <SelectTrigger className="w-full md:w-48">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
//                     <SelectItem value="24h">24 Hour</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <Button onClick={() => handleSave("appearance")} disabled={saveStatus === "saving"}>
//                 <Save className="h-4 w-4 mr-2" />
//                 Save Preferences
//               </Button>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Privacy Settings */}
//         <TabsContent value="privacy" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <Shield className="h-5 w-5" />
//                 <span>Privacy & Security</span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-4">
//                 <div>
//                   <Label htmlFor="profileVisibility">Profile Visibility</Label>
//                   <Select
//                     value={privacy.profileVisibility}
//                     onValueChange={(value) => setPrivacy((prev) => ({ ...prev, profileVisibility: value }))}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="public">Everyone</SelectItem>
//                       <SelectItem value="team">Team Members Only</SelectItem>
//                       <SelectItem value="managers">Managers Only</SelectItem>
//                       <SelectItem value="private">Private</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <p className="text-sm text-gray-600 mt-1">Who can see your profile information</p>
//                 </div>

//                 <div>
//                   <Label htmlFor="attendanceVisibility">Attendance Visibility</Label>
//                   <Select
//                     value={privacy.attendanceVisibility}
//                     onValueChange={(value) => setPrivacy((prev) => ({ ...prev, attendanceVisibility: value }))}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="team">Team Members</SelectItem>
//                       <SelectItem value="managers">Managers Only</SelectItem>
//                       <SelectItem value="hr">HR Only</SelectItem>
//                       <SelectItem value="private">Private</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <p className="text-sm text-gray-600 mt-1">Who can see your attendance records</p>
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
//                     <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
//                   </div>
//                   <Switch
//                     id="twoFactorAuth"
//                     checked={privacy.twoFactorAuth}
//                     onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, twoFactorAuth: checked }))}
//                   />
//                 </div>

//                 <Separator />

//                 <div>
//                   <Label htmlFor="sessionTimeout">Session Timeout</Label>
//                   <Select
//                     value={privacy.sessionTimeout}
//                     onValueChange={(value) => setPrivacy((prev) => ({ ...prev, sessionTimeout: value }))}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="15">15 minutes</SelectItem>
//                       <SelectItem value="30">30 minutes</SelectItem>
//                       <SelectItem value="60">1 hour</SelectItem>
//                       <SelectItem value="120">2 hours</SelectItem>
//                       <SelectItem value="never">Never</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <p className="text-sm text-gray-600 mt-1">Automatically log out after inactivity</p>
//                 </div>
//               </div>

//               <Button onClick={() => handleSave("privacy")} disabled={saveStatus === "saving"}>
//                 <Save className="h-4 w-4 mr-2" />
//                 Save Settings
//               </Button>
//             </CardContent>
//           </Card>

//           {privacy.twoFactorAuth && (
//             <Alert>
//               <Smartphone className="h-4 w-4" />
//               <AlertDescription>
//                 Two-factor authentication is enabled. You'll need to use your authenticator app to sign in.
//               </AlertDescription>
//             </Alert>
//           )}
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }

"use client"

import { useEffect, useState } from "react"
import { User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { authApi } from "@/lib/api"

type EmpUser = {
  emp_id: number
  emp_name: string
  emp_department: string
  emp_designation: string
  emp_gender: string
  emp_address: string
  emp_joining_date: string
  emp_email: string
  emp_contact: string
  emp_marital_status: string
  emp_nationality: string
  emp_pan_no: string
  emp_weekoff: string
  emp_l1: number
  emp_l2: number
  emp_l1_name: string // added this
  emp_l2_name: string // added this
}

export function Settings() {
  const [emp, setEmp] = useState<EmpUser | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = localStorage.getItem("user_data")
      if (raw) setEmp(JSON.parse(raw) as EmpUser)
    } catch {
      setEmp(null)
    }
  }, [])

return (
  <div className="space-y-6">
    {/* Page Header */}
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <p className="text-sm text-gray-600 mt-1">Manage your account preferences and settings</p>
    </div>

    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
        <TabsTrigger value="profile" className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Profile</span>
        </TabsTrigger>
      </TabsList>

      {/* Profile Settings */}
      <TabsContent value="profile" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="empId">Employee ID</Label>
                <Input id="empId" value={emp?.emp_id ?? ""} readOnly className="text-gray-600" />
              </div>
              <div>
                <Label htmlFor="empName">Employee Name</Label>
                <Input id="empName" value={emp?.emp_name ?? ""} readOnly className="text-gray-600" />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={emp?.emp_department ?? ""} readOnly className="text-gray-600" />
              </div>
              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input id="designation" value={emp?.emp_designation ?? ""} readOnly className="text-gray-600" />
              </div>
            </div>

            {/* Row 3 */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
              {/* <div> */}
                {/* <Label htmlFor="managerL1">L1-Immediate Reporting officer</Label> */}
                {/* <Input id="managerL1" value={emp?.emp_l1 ?? ""} readOnly className="text-gray-600" /> */}
                {/* <Input id="managerL1" value={`${emp?.emp_l1} - ${emp?.emp_l1_name}`} readOnly className="text-gray-600" />
              </div> */}
              {/* <div> */}
                {/* <Label htmlFor="managerL2">L2-Next Reporting officer</Label> */}
                {/* <Input id="managerL2" value={emp?.emp_l2 ?? ""} readOnly className="text-gray-600" /> */}
                {/* <Input id="managerL2" value={`${emp?.emp_l2} - ${emp?.emp_l2_name}`} readOnly className="text-gray-600" />
              </div> */}
            {/* </div> */}

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Input id="gender" value={emp?.emp_gender ?? ""} readOnly className="text-gray-600" />
              </div>
              <div>
                <Label htmlFor="weekoff">Week Off</Label>
                <Input id="weekoff" value={emp?.emp_weekoff ?? ""} readOnly className="text-gray-600" />
              </div>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="joiningDate">Joining Date</Label>
                <Input id="joiningDate" value={emp?.emp_joining_date ?? ""} readOnly className="text-gray-600" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={emp?.emp_email ?? ""} readOnly className="text-gray-600" />
              </div>
            </div>

            {/* Row 6 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact">Contact Number</Label>
                <Input id="contact" value={emp?.emp_contact ?? ""} readOnly className="text-gray-600" />
              </div>
              <div>
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <Input id="maritalStatus" value={emp?.emp_marital_status ?? ""} readOnly className="text-gray-600" />
              </div>
            </div>

            {/* Row 7 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Input id="nationality" value={emp?.emp_nationality ?? ""} readOnly className="text-gray-600" />
              </div>
              <div>
                <Label htmlFor="pan">PAN Number</Label>
                <Input id="pan" value={emp?.emp_pan_no ?? ""} readOnly className="text-gray-600" />
              </div>
            </div>

            {/* Row 8 (Full width) */}
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={emp?.emp_address ?? ""} readOnly className="text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
)

}
