import { Container } from "@/components/layout/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function WaitlistPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Join the Waitlist</CardTitle>
            <CardDescription>
              Be the first to know when CreatorStays launches.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4">
              <Input type="email" placeholder="Enter your email" />
              <Button type="submit">Join Waitlist</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}
