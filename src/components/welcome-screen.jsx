export function WelcomeScreen({ isLoaded, isSignedIn }) {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex flex-col justify-center items-center">
      {/* Background animated shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div
        className={`relative w-full max-w-4xl px-8 transform transition-all duration-700 ${
          isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        {!isLoaded ? (
          <div className="text-center text-gray-700">Loading...</div>
        ) : !isSignedIn ? (
          <div className="text-center space-y-4 backdrop-blur-lg rounded-2xl shadow-xl p-8 mx-auto">
            <h1 className="text-4xl font-bold text-gray-800">
              Welcome to MyChat Web
            </h1>
            <p className="text-lg text-gray-600">
              A sleek and modern messaging platform designed to keep you
              connected. Experience effortless communication with ChatApp –
              combining simplicity, functionality, and security.
            </p>
          </div>
        ) : (
          <div className="text-center space-y-4 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 mx-auto">
            <h1 className="text-4xl font-bold text-gray-800">
              Welcome to WhatsApp Web Clone
            </h1>
            <p className="text-lg text-gray-600">
              Select a chat to start messaging.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default WelcomeScreen;
