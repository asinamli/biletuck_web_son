"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/app/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

export default function AuthPage() {
  const router = useRouter();
  const {
    loginWithFirebase,
    registerWithFirebase,
    loginWithGoogleFirebase,
    resetPasswordFirebase,
    isLoading,
    user,
    isAuthenticated
  } = useAuthStore();

  // Form state
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Authenticated ise yönlendir
  if (isAuthenticated && user) {
    router.replace("/");
    return null;
  }

  // Giriş
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginWithFirebase(email, password);
      toast.success("Giriş başarılı!");
      router.replace("/");
    } catch (err) { }
  };

  // Kayıt
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== password2) {
      toast.error("Şifreler eşleşmiyor");
      return;
    }
    try {
      await registerWithFirebase(email, password, { username, firstName, lastName });
      toast.success("Kayıt başarılı! Giriş yapabilirsiniz.");
      setMode("login");
    } catch (err) { }
  };

  // Şifre sıfırlama
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPasswordFirebase(email);
      toast.success("Şifre sıfırlama e-postası gönderildi!");
      setMode("login");
    } catch (err) { }
  };

  // Google ile giriş
  const handleGoogle = async () => {
    try {
      await loginWithGoogleFirebase();
      toast.success("Google ile giriş başarılı!");
      router.replace("/");
    } catch (err) { }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {mode === "login" && "Giriş Yap"}
          {mode === "register" && "Kayıt Ol"}
          {mode === "reset" && "Şifre Sıfırla"}
        </h2>
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              Giriş Yap
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={isLoading}>
              Google ile Giriş Yap
            </Button>
            <div className="flex justify-between mt-2">
              <button type="button" className="text-xs text-blue-600 hover:underline" onClick={() => setMode("reset")}>Şifremi Unuttum</button>
              <button type="button" className="text-xs text-gray-600 hover:underline" onClick={() => setMode("register")}>Kayıt Ol</button>
            </div>
          </form>
        )}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              type="text"
              placeholder="Kullanıcı Adı"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Ad"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Soyad"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
            />
            <Input
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Şifre Tekrar"
              value={password2}
              onChange={e => setPassword2(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              Kayıt Ol
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={isLoading}>
              Google ile Kayıt Ol
            </Button>
            <div className="flex justify-between mt-2">
              <button type="button" className="text-xs text-gray-600 hover:underline" onClick={() => setMode("login")}>Giriş Yap</button>
            </div>
          </form>
        )}
        {mode === "reset" && (
          <form onSubmit={handleReset} className="space-y-4">
            <Input
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              Şifre Sıfırlama Linki Gönder
            </Button>
            <div className="flex justify-between mt-2">
              <button type="button" className="text-xs text-gray-600 hover:underline" onClick={() => setMode("login")}>Giriş Yap</button>
              <button type="button" className="text-xs text-gray-600 hover:underline" onClick={() => setMode("register")}>Kayıt Ol</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
