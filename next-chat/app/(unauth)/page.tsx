import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { AuthMode, queryParamsDefault } from "@/types/home-page-params.ts";
import AuthForm from "@/components/auth-form/auth-form.tsx";

export default async function Home(props: PageProps<'/'>): Promise<React.ReactElement> {
  const { searchParams } = props;
  const query = await searchParams;
  const hasMode = 'authmode' in query ? 'authmode' : redirect(`/${queryParamsDefault}`);
  const authmode: AuthMode = query[hasMode] as AuthMode;
  const cookie = (await cookies()).get('session');
  if (cookie) {
    redirect('/chat');
  }

  return (
    <div>
      <main>
        <AuthForm authmode={authmode} />
      </main>
    </div>
  );
}
