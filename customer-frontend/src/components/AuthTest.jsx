import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'

const AuthTest = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleLogin = async () => {
    try {
      setLoading(true)
      setResult(null)

      const response = await fetch('https://digiads.digiaeon.com/api/simple-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      
      if (data.success) {
        // Store the token in localStorage
        localStorage.setItem('authToken', data.data.tokens.accessToken)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        
        setResult({
          success: true,
          message: 'Login successful! Token stored in localStorage.',
          user: data.data.user,
          token: data.data.tokens.accessToken.substring(0, 20) + '...'
        })
      } else {
        setResult({
          success: false,
          message: data.message || 'Login failed'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Error: ' + error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setResult({
      success: true,
      message: 'Logged out successfully!'
    })
  }

  const checkAuth = () => {
    const token = localStorage.getItem('authToken')
    const user = localStorage.getItem('user')
    
    setResult({
      success: true,
      message: 'Auth check complete',
      hasToken: !!token,
      hasUser: !!user,
      token: token ? token.substring(0, 20) + '...' : null,
      user: user ? JSON.parse(user) : null
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
          <CardDescription>
            Test login and check authentication status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleLogin} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
            <Button onClick={checkAuth} variant="secondary">
              Check Auth
            </Button>
          </div>

          {result && (
            <div className={`p-4 rounded-lg ${
              result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <h4 className="font-semibold">Result:</h4>
              <p>{result.message}</p>
              {result.user && (
                <div className="mt-2">
                  <p><strong>User:</strong> {result.user.firstName} {result.user.lastName}</p>
                  <p><strong>Email:</strong> {result.user.email}</p>
                </div>
              )}
              {result.token && (
                <p><strong>Token:</strong> {result.token}</p>
              )}
              {result.hasToken !== undefined && (
                <div className="mt-2">
                  <p><strong>Has Token:</strong> {result.hasToken ? 'Yes' : 'No'}</p>
                  <p><strong>Has User:</strong> {result.hasUser ? 'Yes' : 'No'}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h4 className="font-semibold mb-2">Current localStorage:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify({
                authToken: localStorage.getItem('authToken') ? 'Present' : 'Missing',
                user: localStorage.getItem('user') ? 'Present' : 'Missing'
              }, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AuthTest






