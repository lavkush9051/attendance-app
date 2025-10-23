// src/lib/api/face.ts
export async function registerFacesApi({
  baseUrl,
  empId,
  name,
  files,        // File[]
}: {
  baseUrl: string; // e.g. process.env.NEXT_PUBLIC_API_BASE_URL
  empId: number;
  name: string;
  files: File[];
}) {
  if (files.length !== 4) throw new Error("Exactly 4 images are required.");
  console.log("Register API: function called");
  //sandeep added token
  const token = localStorage.getItem("token"); // 👈 Get token
  console.log("Token being sent:", token);
 
  if (!token) {
    throw new Error("User not authenticated. Please log in again.");
  }
// sandeep End

  const fd = new FormData();
  fd.append("emp_id", String(empId));
  fd.append("name", name);
  files.forEach((f) => fd.append("files", f)); // field name must be 'files'

  const res = await fetch(`${baseUrl}/api/register`, {
    method: "POST",
    body: fd,
    headers: {
      Authorization: `Bearer ${token}`, // 👈 Attach JWT token
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.status === "failed") {
    const reason = json?.reason || json?.error || `HTTP ${res.status}`;
    throw new Error(reason);
  }
  return json; // {status:'success', ...}
}
