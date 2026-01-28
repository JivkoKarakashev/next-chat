import { redirect } from "next/navigation";

// import styles from "@/page.module.scss";

import { AuthMode, queryParamsDefault } from "@/types/home-page-params.ts";
import AuthForm from "@/components/auth-form.tsx";

export default async function Home(props: PageProps<'/'>): Promise<React.ReactElement> {
  const { searchParams } = props;
  const query = await searchParams;
  const hasMode = 'authmode' in query ? 'authmode' : redirect(`/${queryParamsDefault}`);
  const authmode: AuthMode = query[hasMode] as AuthMode;

  return (
    <div>
      <main>
        <AuthForm authmode={authmode} />
      </main>
    </div>
  );
}
