import { redirect } from "next/navigation"

export default function ShortCreatorProfile({
  params,
}: {
  params: { handle: string }
}) {
  redirect(`/creators/${params.handle}`)
}
