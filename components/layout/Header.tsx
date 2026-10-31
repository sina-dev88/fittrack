import { auth } from "@/auth";
import HeaderContent from "@/components/layout/HeaderContent";

export default async function Header() {
  const session = await auth();

  const name = session?.user?.name || "";
  const email = session?.user?.email || "";

  return <HeaderContent name={name} email={email} />;
}
