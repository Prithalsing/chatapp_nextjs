export function WelcomeScreen() {
  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Welcome to WhatsApp Web Clone</h1>
        <p className="text-muted-foreground">
          Select a chat to start messaging
        </p>
      </div>
    </div>
  )
}