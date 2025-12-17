import UploadPortal from "@/features/report/components/UploadPortal"; // Adjust path if needed

export default function AdminUploadPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">Secure Report Upload Center</p>
      </div>

      {/* We simply render the component here */}
      <UploadPortal />
    </div>
  );
}
