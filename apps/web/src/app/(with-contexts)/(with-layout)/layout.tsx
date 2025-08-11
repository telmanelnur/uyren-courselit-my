import HomepageLayout from "./home-page-layout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HomepageLayout>{children}</HomepageLayout>;
}
