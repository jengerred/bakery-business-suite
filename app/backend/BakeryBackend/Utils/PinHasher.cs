namespace BakeryBackend.Utils
{
    public static class PinHasher
    {
        public static string HashPin(string pin)
            => BCrypt.Net.BCrypt.HashPassword(pin);

        public static bool VerifyPin(string pin, string hash)
            => BCrypt.Net.BCrypt.Verify(pin, hash);
    }
}
