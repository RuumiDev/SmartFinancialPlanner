"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { AdminDashboard } from "@/components/admin"
import Swal from "sweetalert2"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, Lock, Mail } from "lucide-react"

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const adminEmail = "admin@financialplanner.com"
  const didWelcomeRef = useRef(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      if (user.email === adminEmail) {
        setIsAuthenticated(true)
        setError(null)
        if (!didWelcomeRef.current) {
          didWelcomeRef.current = true
          await Swal.fire({
            title: "Welcome back",
            text: "Admin access granted.",
            icon: "success",
          })
        }
      } else {
        setIsAuthenticated(false)
        setError("You do not have admin access.")
        await signOut(auth)
      }

      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLogin = async () => {
    setError(null)
    setIsLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      const message = (err as Error).message
      setError(message)
      await Swal.fire({
        title: "Login failed",
        text: "Incorrect email or password.",
        icon: "error",
      })
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/")
  }

  if (isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
            <CardDescription>
              Sign in to access the Smart Financial Planner admin dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
              {isLoading ? "Checking access..." : "Sign In"}
            </Button>
          </div>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => router.push("/")}
              className="text-muted-foreground"
            >
              Back to Survey
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
