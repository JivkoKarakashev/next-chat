import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { AuthMode, queryParamsDefault } from "@/types/query-params.ts";
import AuthForm from "@/components/auth-form/auth-form.tsx";
import { validateSession } from "@/lib/sessions.ts";

interface KnownSearchParams {
  authmode?: AuthMode
};

type SearchParams = Promise<KnownSearchParams & { [key: string]: string | string[] | undefined }>;

const Home = async ({ searchParams }: { searchParams: SearchParams }): Promise<React.ReactElement> => {
  const { authmode } = await searchParams;
  if (!authmode) {
    redirect(`/${queryParamsDefault}`);
  }

  const cookieStore = await cookies();
  const sId = cookieStore.get('session')?.value;
  if (sId) {
    const session = await validateSession(sId);
    if (session) {
      redirect('/chat');
    }
  }

  return (
    <div>
      <main>
        <AuthForm authmode={authmode} />
      </main>
    </div>
  );
};

export default Home;
