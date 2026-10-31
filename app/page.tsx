
import { auth } from "@/auth";
import HomePageContent from "@/components/home/HomePageContent";

export default async function HomePage() {
  const session = await auth();

  const isLoggedIn = Boolean(session?.user?.id);

  return (
    <HomePageContent
      isLoggedIn={isLoggedIn}
      currentYear={new Date().getFullYear()}
    />
  );
}

