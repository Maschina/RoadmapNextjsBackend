import { AuthView } from "@daveyplate/better-auth-ui";

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center w-full">
      <div className="max-w-md w-full p-6">
        <AuthView pathname={path} />
      </div>
    </main>
  );
}
